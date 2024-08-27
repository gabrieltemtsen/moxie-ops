import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createSubscription = mutation({
  args: {
    userId: v.id("users"),
    fanToken: v.string(),
    alertType: v.optional(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, { userId, fanToken, alertType, active }) => {
    // Check if a subscription already exists for this user, fanToken, and alertType
    const existingSubscription = await ctx.db.query("subscriptions")
      .filter(q => q.eq(q.field("userId"), userId))
      .filter(q => q.eq(q.field("fanToken"), fanToken))
      .filter(q => q.eq(q.field("alertType"), alertType))
      .first();

    if (existingSubscription) {
      // If a subscription exists, return a message or update the subscription
      return { success: false, message: "Subscription already exists." };
    }

    // If no subscription exists, create a new one
    await ctx.db.insert("subscriptions", {
      userId,
      fanToken,
      alertType,
      active,
    });

    return { success: true, message: "Subscription created successfully" };
  },
});

export const unsubscribe = mutation({
  args: {
    userId: v.id("users"),
    fanToken: v.string(),
    alertType: v.optional(v.string()), 
  },
  handler: async (ctx, { userId, fanToken, alertType }) => {
    // Find the subscription and update its active status to false
    const subscription = await ctx.db.query("subscriptions")
      .filter(q => q.eq(q.field("fanToken"), fanToken))
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, { active: false });
      return { success: true, message: "Unsubscribed successfully..." };
    } else {
      return { success: false, message: "Subscription not found." };
    }
  },
});

export const getActiveSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subscriptions")
      .filter(q => q.eq(q.field("active"), true))
      .collect();
  },
});

export const isFanTokenSubscribed = query({
  args: {
    fanToken: v.string(),
  },
  handler: async (ctx, { fanToken }) => {
    // Check if an active subscription exists for this fanToken
    const existingSubscription = await ctx.db.query("subscriptions")
      .filter(q => q.eq(q.field("fanToken"), fanToken))
      .filter(q => q.eq(q.field("active"), true))
      .first();

    if (existingSubscription) {
      return { isSubscribed: true };
    } else {
      return { isSubscribed: false };
    }
  },
});