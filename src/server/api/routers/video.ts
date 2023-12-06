import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { EngagementType } from "@prisma/client";

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
        where: { followerId: video.userId },
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
      return {
        video: videoWithLikesDislikesViews,
        user: userWithFollowers,
        comments: commenstWithUser,
      };
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
});
