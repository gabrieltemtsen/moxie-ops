import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api.js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export async function POST(req: NextRequest) {
  const {   fanToken } = await req.json();

  const client = new ConvexHttpClient(process.env["NEXT_PUBLIC_CONVEX_URL"] || '');

const isSubscribed = await client.query(api.subscriptions.isFanTokenSubscribed, { fanToken });  

    return NextResponse.json({ isSubscribed: isSubscribed });
}
