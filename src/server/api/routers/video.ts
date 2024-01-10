import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { EngagementType, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
type Context = {
  db: PrismaClient;
};
const checkVideoOwnership = async (
  ctx: Context,
  id: string,
  userId: string,
) => {
  const video = await ctx.db.video.findUnique({
    where: {
      id: id,
    },
  });
  if (!video || video.userId !== userId) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Video not found",
    });
  }
  return video;
};
export const videoRouter = createTRPCRouter({
  getVideoById: publicProcedure
    .input(z.object({ id: z.string(), viewerId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const rawVideo = await ctx.db.video.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          Comment: {
            include: { user: true },
          },
        },
      });
      if (!rawVideo) {
        throw new Error("Video Not Found");
      }
      const { user, Comment, ...video } = rawVideo;
      const followers = await ctx.db.followEngagement.count({
        where: { followingId: video.userId },
      });
      const likes = await ctx.db.videoEngagement.count({
        where: { videoId: video.id, engagementType: EngagementType.LIKE },
      });
      const dislikes = await ctx.db.videoEngagement.count({
        where: { videoId: video.id, engagementType: EngagementType.DISLIKE },
      });
      const views = await ctx.db.videoEngagement.count({
        where: { videoId: video.id, engagementType: EngagementType.VIEW },
      });
      const userWithFollowers = { ...user, followers };
      const videoWithLikesDislikesViews = { ...video, likes, dislikes, views };
      const commenstWithUser = Comment.map(({ user, ...Comment }) => ({
        user,
        Comment,
      }));
      let viewerHasFollowed = false;
      let viewerHasLiked = false;
      let viewerHasDisliked = false;
      if (input.viewerId && input.viewerId !== "") {
        viewerHasFollowed = !!(await ctx.db.followEngagement.findFirst({
          where: {
            followingId: rawVideo.userId,
            followerId: input.viewerId,
          },
        }));
        viewerHasLiked = !!(await ctx.db.videoEngagement.findFirst({
          where: {
            videoId: input.id,
            userId: input.viewerId,
            engagementType: EngagementType.LIKE,
          },
        }));
        viewerHasDisliked = !!(await ctx.db.videoEngagement.findFirst({
          where: {
            videoId: input.id,
            userId: input.viewerId,
            engagementType: EngagementType.DISLIKE,
          },
        }));
      } else {
        viewerHasFollowed = false;
        viewerHasLiked = false;
        viewerHasDisliked = false;
      }
      const viewer = {
        hasFollowed: viewerHasFollowed,
        hasLiked: viewerHasLiked,
        hasDisliked: viewerHasDisliked,
      };
      return {
        video: videoWithLikesDislikesViews,
        user: userWithFollowers,
        comments: commenstWithUser,
        viewer,
      };
    }),
  getVideosByUserId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const videosWithUser = await ctx.db.video.findMany({
        where: {
          userId: input,
          publish: true,
        },
        include: {
          user: true,
        },
      });

      const videos = videosWithUser.map(({ user, ...video }) => video);
      const users = videosWithUser.map(({ user }) => user);
      const videosWithCounts = await Promise.all(
        videos.map(async (video) => {
          const views = await ctx.db.videoEngagement.count({
            where: {
              videoId: video.id,
              engagementType: EngagementType.VIEW,
            },
          });
          return {
            ...video,
            views,
          };
        }),
      );

      return { videos: videosWithCounts, users: users };
    }),
  getRandomVideos: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const videoWithUser = await ctx.db.video.findMany({
        where: {
          publish: true,
        },
        include: {
          user: true,
          _count: {
            select: {
              VideoEngagement: {
                where: {
                  engagementType: EngagementType.VIEW,
                },
              },
            },
          },
        },
      });
      const videos = videoWithUser.map(({ user, ...video }) => video);
      const users = videoWithUser.map(({ user }) => user);

      // const videosWithCount = await Promise.all(
      //   videos.map(async (video) => {
      //     const views = await ctx.db.videoEngagement.count({
      //       where: {
      //         videoId: video.id,
      //         engagementType: EngagementType.VIEW,
      //       },
      //     });
      //     return {
      //       ...video,
      //       views,
      //     };
      //   }),
      // );
      const indices = Array.from({ length: videos.length }, (_, i) => i);
      //shuffle the indices array
      for (let i = indices.length - 1; i > 0; i--) {
        if (indices[i] !== undefined) {
          const j = Math.floor(Math.random() * (i + 1));
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
      }
      const shuffledVideosWithCounts = indices.map((i) => videos[i]);
      const shuffledUsers = indices.map((i) => users[i]);
      const randomVideos = shuffledVideosWithCounts.slice(0, input);
      const randomUsers = shuffledUsers.slice(0, input);
      return { videos: randomVideos, users: randomUsers };
    }),
  getVideoBySearch: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const videoWithUser = await ctx.db.video.findMany({
        where: {
          publish: true,
          title: {
            contains: input,
          },
        },
        take: 10,
        include: {
          user: true,
          _count: {
            select: {
              VideoEngagement: {
                where: {
                  engagementType: EngagementType.VIEW,
                },
              },
            },
          },
        },
      });

      const videos = videoWithUser.map(({ user, ...video }) => video);
      const users = videoWithUser.map(({ user }) => user);
      if (videos.length === 0) return null;
      return { videos: videos, users: users };
    }),
  addVideoToPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        videoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const playlistAlreadyHasVideo = await ctx.db.playlistHasVideo.findMany({
        where: {
          playlistId: input.playlistId,
          videoId: input.videoId,
        },
      });
      if (playlistAlreadyHasVideo.length > 0) {
        const deleteVideo = await ctx.db.playlistHasVideo.deleteMany({
          where: {
            playlistId: input.playlistId,
            videoId: input.videoId,
          },
        });
        return deleteVideo;
      } else {
        const playlistHasVideo = await ctx.db.playlistHasVideo.create({
          data: {
            playlistId: input.playlistId,
            videoId: input.videoId,
          },
        });
        return playlistHasVideo;
      }
    }),
  publishVideo: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const video = await checkVideoOwnership(ctx, input.id, input.userId);
      const publishVideo = await ctx.db.video.update({
        where: {
          id: video.id,
        },

        data: {
          publish: !video.publish,
        },
      });

      return publishVideo;
    }),
});
