import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const findOrCreateUser = mutation({
  args: {
    fid: v.string(),
    username: v.string(),
  },
  handler: async (ctx, { fid, username }) => {
    let user: any = await ctx.db.query("raffleEntries").filter(q => q.eq(q.field("fid"), fid)).first();
    if (!user) {
      user = await ctx.db.insert("raffleEntries", { fid, username });
    }
    return user;
  },
});

export const getUserByFid = query({
  args: {
    fid: v.string(),
  },
  handler: async (ctx, { fid }) => {
    return await ctx.db.query("raffleEntries").filter(q => q.eq(q.field("fid"), fid)).first();
  },
});


