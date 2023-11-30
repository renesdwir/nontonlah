import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { EngagementType } from "@prisma/client";

export const videoRouter = createTRPCRouter({
  getRandomVideos: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const videoWithUser = await ctx.db.video.findMany({
        where: {
          publish: true,
        },
        include: {
          user: true,
        },
        take: 10,
      });
      const videos = videoWithUser.map(({ user, ...video }) => video);
      const users = videoWithUser.map(({ user }) => user);

      const videosWithCount = await Promise.all(
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
      console.log(videosWithCount);

      console.log("testt");
      return {
        greeting: `Hello ${input}`,
      };
    }),
});
