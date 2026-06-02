import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listLeads = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("leads")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("leads")
      .order("desc")
      .collect();
  },
});

export const getLead = query({
  args: { leadId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_leadId", (q) => q.eq("leadId", args.leadId))
      .first();
  },
});

export const updateLeadStatus = mutation({
  args: {
    leadId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db
      .query("leads")
      .withIndex("by_leadId", (q) => q.eq("leadId", args.leadId))
      .first();
    if (!lead) throw new Error("Lead not found");

    await ctx.db.patch(lead._id, { status: args.status });
    return { success: true };
  },
});
