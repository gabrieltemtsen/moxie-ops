import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createSubscription = mutation({
  args: {
    userId: v.id("users"),
    fanToken: v.string(),
    alertType: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, { userId, fanToken, alertType, active }) => {
    return await ctx.db.insert("subscriptions", {
      userId,
      fanToken,
      alertType,
      active,
    });
  },
});
export const unsubscribe = mutation({
  args: {
    userId: v.id("users"),
    fanToken: v.string(),
    alertType: v.string(),
  },
  handler: async (ctx, { userId, fanToken, alertType }) => {
    // Find the subscription and update its active status to false
    const subscription = await ctx.db.query("subscriptions")
      .filter(q => q.eq(q.field("userId"), userId))
      .filter(q => q.eq(q.field("fanToken"), fanToken))
      .filter(q => q.eq(q.field("alertType"), alertType))
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, { active: false });
      return { success: true, message: "Unsubscribed successfully" };
    } else {
      return { success: false, message: "Subscription not found" };
    }
  },
});

export const getActiveSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subscriptions").filter(q => q.eq(q.field("active"), true)).collect();
  },
});
