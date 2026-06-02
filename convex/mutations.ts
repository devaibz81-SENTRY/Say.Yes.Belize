import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submitOnboarding = mutation({
  args: {
    guestCount: v.number(),
    features: v.array(v.string()),
    calculatedPrice: v.number(),
    tier: v.string(),
    customerName: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert("submissions", {
      ...args,
      timestamp: Date.now(),
    });
    return submissionId;
  },
});
