import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api.js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export async function POST(req: NextRequest) {
  const { fid, username, fanToken, alertType } = await req.json();

  const client = new ConvexHttpClient(process.env["NEXT_PUBLIC_CONVEX_URL"] || '');
  
  // Find or create the user
  const user = await client.mutation(api.users.findOrCreateUser, { fid, username });
  

  // Create the subscription
  await client.mutation(api.subscriptions.createSubscription ,  {
    userId: user._id || user,
    fanToken,
    alertType,
    active: true,
  });

  return NextResponse.json({ message: "Subscribed successfully" });
}
