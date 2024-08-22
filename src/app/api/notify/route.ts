import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api.js";
import axios from "axios";
import { gql, GraphQLClient } from "graphql-request";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createPublicClient, formatUnits, http } from 'viem';import { base } from 'viem/chains'
import data from "../../../utility/moxie_resolve.json";
import { fetchQuery } from "@airstack/node";

import { init } from "@airstack/node";

init(`${process.env.NEXT_PUBLIC_AIRSTACK_KEY}`);

// Set up a GraphQL client for Moxie Protocol
const graphQLClient = new GraphQLClient(
  "https://api.studio.thegraph.com/query/23537/moxie_protocol_stats_mainnet/version/latest"
);

const client = createPublicClient({
    chain: base,
    transport: http()
  })

  const queryLatestIndexedBlockNumber = gql`
  query GetLatestIndexedBlockNumber {
    Accounts(
      input: {
        filter: { standard: { _eq: ERC6551 } }
        blockchain: base
        order: { createdAtBlockTimestamp: DESC }
        limit: 1
      }
    ) {
      Account {
        createdAtBlockNumber
      }
    }
  }
`;
const fetchLatestIndexedBlockNumber = async (): Promise<number> => {
    try {
        const { data, error } = await fetchQuery(queryLatestIndexedBlockNumber);
      return data.Accounts.Account[0].createdAtBlockNumber;
    } catch (error) {
      console.error("Failed to fetch the latest indexed block number:", error);
      throw new Error("Could not fetch latest indexed block number.");
    }
  };

// Utility function to get the current block number
const getCurrentBlockNumber = async (): Promise<number> => {
    return fetchLatestIndexedBlockNumber()
  };

  const resolveBeneficiaryOrVestingToFid = (address: string) =>
      (data as any[])
        ?.filter((d) => d?.address === address?.toLowerCase())
        ?.map((d) => d?.fid || 'unknown');

// Fetch the latest orders from Moxie based on the block number
const fetchOrders = async (symbol: string, blockNumber: number) => {
  const queryOrders = gql`
    query GetLatestOrders($symbol: String!, $blockNumber: Int) {
      orders(
        first: 1000,
        orderDirection: desc,
        block: { number: $blockNumber }
      ) {
        blockInfo {
          blockNumber
          timestamp
        }
        orderType
        subjectAmount
        subjectToken {
          symbol
        }
        user {
          address: id
        }
      }
    }
  `;

  const variablesOnOrder = {
    symbol,
    blockNumber,
  };

  try {
    const data: any = await graphQLClient.request(queryOrders, variablesOnOrder);
    return data.orders;
  } catch (e: any) {
    console.error(`Error fetching orders for ${symbol}:`, e);
    throw new Error(e);
  }
};



    // Fetch the username for an Ethereum address
    const fetchUsername = async (fid: string): Promise<string> => {
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
    const options: any = {
        method: 'GET',
        headers: { accept: 'application/json', api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY },
    };
    const response = await fetch(url, options);
    const data = await response.json();

    return data.users ? data.users[0]['username'] : "Unknown";
    };

export async function POST(req: NextRequest) {
    const client = new ConvexHttpClient(process.env["NEXT_PUBLIC_CONVEX_URL"] || '');

  // Fetch the current block number
  const currentBlockNumber = await getCurrentBlockNumber();

  // Fetch all active subscriptions
  const subscriptions = await client.query(api.subscriptions.getActiveSubscriptions);

  for (const subscription of subscriptions) {
    const fid = subscription.fanToken.split(':')[1];
    console.log(fid)

    // Fetch the latest orders for this Fan Token
    const orders = await fetchOrders(subscription.fanToken, currentBlockNumber);
console.log(orders.length)
    // Filter the orders for the specific Fan Token
    const filteredOrders = orders.filter((order:any) => order.subjectToken.symbol === subscription.fanToken);
    if (filteredOrders.length > 0) {
      // Fetch the user associated with the subscription
      const user = await client.query(api.users.getUserById, { userId: subscription.userId });

      // Resolve usernames for the addresses involved in the transactions
      const usernames = await Promise.all(
        filteredOrders.map(async (order: any) => {
         
          const fid: any = resolveBeneficiaryOrVestingToFid(order.user.address);
          const username = await fetchUsername(fid);
          const orderType = order.orderType;
          const amount = formatUnits(order.subjectAmount, 18);
          const roundedAmount = Math.round(Number(amount) * 100) / 100;

          return { address: fid, username, orderType,roundedAmount };
        })
      );

      // Format the notification message
      const message = `Hey ${user?.username},
      There has been activity on your Fan Token ${subscription.fanToken}!
      
      **${filteredOrders.length} orders detected:**
      ${usernames.map((u, index) =>`${index + 1}. @${u.username} (${Number(u.roundedAmount)}) ${u.orderType} `).join("\n")}
    Best regards,
    Your Fan Token Tracker by @gabrieltemtsen
      `;

      // Send the notification
      try {
        await axios.put(
          "https://api.warpcast.com/v2/ext-send-direct-cast",
          {
            recipientFid: user?.fid,
            message,
            idempotencyKey: `${user?.fid}-${Date.now()}`,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_WARPCAST_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error(`Failed to send notification to ${user?.username}:`, error);
      }
    }
  }

  return NextResponse.json({ message: "Notifications sent successfully" });
}
