import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  submissions: defineTable({
    guestCount: v.number(),
    features: v.array(v.string()),
    calculatedPrice: v.number(),
    tier: v.string(),
    customerName: v.optional(v.string()),
    email: v.optional(v.string()),
    timestamp: v.number(),
  }),
  leads: defineTable({
    templateId: v.string(),
    email: v.string(),
    phone: v.string(),
    guests: v.number(),
    names: v.string(),
    date: v.string(),
    location: v.optional(v.string()),
    message: v.optional(v.string()),
    leadId: v.string(),
    status: v.string(),
  })
    .index("by_leadId", ["leadId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),
});
