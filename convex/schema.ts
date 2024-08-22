import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    fid: v.string(),
    username: v.string(),
  }).index("by_fid", ["fid"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    fanToken: v.string(),
    alertType: v.string(), // 'buy' or 'sell'
    active: v.boolean(),
  }).index("by_userId", ["userId"]),
});
