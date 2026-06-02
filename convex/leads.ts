import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getLead = query({
  args: { leadId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_leadId", (q) => q.eq("leadId", args.leadId))
      .first();
  },
});

export const createLead = mutation({
  args: {
    templateId: v.string(),
    email: v.string(),
    phone: v.string(),
    guests: v.number(),
    names: v.string(),
    date: v.string(),
    location: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const leadId = generateId();
    await ctx.db.insert("leads", {
      ...args,
      leadId,
      status: "new",
      location: args.location ?? "",
      message: args.message ?? "",
    });
    return { leadId };
  },
});

function generateId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
