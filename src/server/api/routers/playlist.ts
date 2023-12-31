import { EngagementType } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const playlistRouter = createTRPCRouter({
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
