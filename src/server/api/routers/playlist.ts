import { EngagementType } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const playlistRouter = createTRPCRouter({
  getPlaylistById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const rawPlaylist = await ctx.db.playlist.findUnique({
        where: {
          id: input,
        },
        include: {
          user: true,
          PlaylistHasVideo: {
            include: {
              video: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
      if (!rawPlaylist) throw new Error("Playlist not found");
      const followers = await ctx.db.followEngagement.count({
        where: {
          followingId: rawPlaylist.userId,
        },
      });
      const userWithFollowers = { ...rawPlaylist.user, followers };
      const videosWithUser = rawPlaylist.PlaylistHasVideo.map(({ video }) => ({
        ...video,
        author: video?.user,
      }));

      const videos = videosWithUser.map(({ author, ...video }) => video);
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

      const {
        user,
        PlaylistHasVideo: rawVideos,
        ...playlistInfo
      } = rawPlaylist;

      return {
        playlist: playlistInfo,
        videos: videosWithCounts,
        authors: users,
        user: userWithFollowers,
      };
    }),
  getPlaylistByTitle: publicProcedure
    .input(
      z.object({
        title: z.string(),
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let rawPlaylist = await ctx.db.playlist.findFirst({
        where: {
          title: input.title,
          userId: input.userId,
        },
        include: {
          user: true,
          PlaylistHasVideo: {
            include: {
              video: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
      if (rawPlaylist === null || rawPlaylist === undefined) {
        rawPlaylist = await ctx.db.playlist.create({
          data: {
            userId: input.userId,
            title: input.title,
            description: input.title,
          },
          include: {
            user: true,
            PlaylistHasVideo: {
              include: {
                video: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        });
      }
      const followers = await ctx.db.followEngagement.count({
        where: {
          followingId: rawPlaylist.userId,
        },
      });
      const userWithFollowers = { ...rawPlaylist.user, followers };
      const videosWithUser = rawPlaylist.PlaylistHasVideo.map(({ video }) => ({
        ...video,
        author: video?.user,
      }));

      const videos = videosWithUser.map(({ author, ...video }) => video);
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

      const {
        user,
        PlaylistHasVideo: rawVideos,
        ...playlistInfo
      } = rawPlaylist;

      return {
        playlist: playlistInfo,
        videos: videosWithCounts,
        authors: users,
        user: userWithFollowers,
      };
    }),
  getPlaylistsByUserId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const rawPlaylists = await ctx.db.playlist.findMany({
        where: {
          userId: input,
        },
        include: {
          user: true,
          PlaylistHasVideo: {
            include: {
              video: true,
            },
          },
        },
      });

      const playlists = await Promise.all(
        rawPlaylists.map(async (playlist) => {
          const videoCount = await ctx.db.playlistHasVideo.count({
            where: {
              playlistId: playlist.id,
            },
          });

          const firstVideoInPlaylist = await ctx.db.playlistHasVideo.findFirst({
            where: {
              playlistId: playlist.id,
            },
            include: {
              video: {
                select: {
                  thumbnailUrl: true,
                },
              },
            },
          });

          return {
            ...playlist,
            videoCount,
            playlistThumbnail: firstVideoInPlaylist?.video?.thumbnailUrl,
          };
        }),
      );

      return playlists;
    }),
  getSavePlaylistData: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const playlists = await ctx.db.playlist.findMany({
        where: {
          userId: input,
          NOT: [
            { title: "Liked Videos" },
            { title: "History" },
            { title: "Disliked Videos" },
          ],
        },
        include: {
          PlaylistHasVideo: {
            include: {
              video: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });
      return playlists;
    }),
  addPlaylist: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        userId: z.string(),
        description: z.string().min(5).max(50).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.create({
        data: {
          title: input.title,
          userId: input.userId,
          description: input.description || "",
        },
      });
      return playlist;
    }),
});
