import { EngagementType } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const announcementRouter = createTRPCRouter({
  getAnnouncementsByUserId: publicProcedure
    .input(z.object({ id: z.string(), viewerId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const annoucementsWithUser = await ctx.db.announcement.findMany({
        where: {
          userId: input.id,
        },
        include: {
          user: true,
        },
      });
      const annoucements = annoucementsWithUser.map(
        ({ user, ...annoucement }) => annoucement,
      );
      const user = annoucementsWithUser.map(({ user }) => user);
      const annoucementsWithEngagements = await Promise.all(
        annoucements.map(async (annoucement) => {
          const likes = await ctx.db.announcementEngagement.count({
            where: {
              announcementId: annoucement.id,
              engagementType: EngagementType.LIKE,
            },
          });
          const dislikes = await ctx.db.announcementEngagement.count({
            where: {
              announcementId: annoucement.id,
              engagementType: EngagementType.DISLIKE,
            },
          });

          let viewerHasLiked = false;
          let viewerHasDisliked = false;

          if (input.viewerId && input.viewerId !== "") {
            viewerHasLiked = !!(await ctx.db.announcementEngagement.findFirst({
              where: {
                announcementId: annoucement.id,
                userId: input.viewerId,
                engagementType: EngagementType.LIKE,
              },
            }));

            viewerHasDisliked =
              !!(await ctx.db.announcementEngagement.findFirst({
                where: {
                  announcementId: annoucement.id,
                  userId: input.viewerId,
                  engagementType: EngagementType.DISLIKE,
                },
              }));
          }
          const viewer = {
            hasLiked: viewerHasLiked,
            hasDisliked: viewerHasDisliked,
          };

          return {
            ...annoucement,
            likes,
            dislikes,
            viewer,
          };
        }),
      );

      return { annoucements: annoucementsWithEngagements, user };
    }),
});
