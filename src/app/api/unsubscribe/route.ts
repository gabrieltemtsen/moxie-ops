import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api.js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export async function POST(req: NextRequest) {
  const { fid, fanToken, alertType } = await req.json();

  const client = new ConvexHttpClient(process.env["NEXT_PUBLIC_CONVEX_URL"] || '');

 // Find the user by fid
 const user = await client.query(api.users.getUserByFid, { fid });

 if (!user) {
   return NextResponse.json({ success: false, message: "User not found" });
 }

 // Unsubscribe the user from the specific fan token and alert type
 const result = await client.mutation(api.subscriptions.unsubscribe, {
   userId: user._id,
   fanToken,
   alertType,
 });

 return NextResponse.json(result);
}
