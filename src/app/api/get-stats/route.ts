import { NextRequest, NextResponse } from "next/server";
import { gql, GraphQLClient } from "graphql-request";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createPublicClient, formatUnits, http } from 'viem';
import { base } from 'viem/chains';
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
});

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
  return fetchLatestIndexedBlockNumber();
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

// Fetch the username for a given FID
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
  const { fid, fanToken } = await req.json(); // Get the user's FID and Fan Token from the request body

  if (!fid || !fanToken) {
    return NextResponse.json({ error: "FID and Fan Token are required" }, { status: 400 });
  }

  // Fetch the user's name for the message
  const username = await fetchUsername(fid);

  if (username === "Unknown") {
    return NextResponse.json({ error: "Failed to resolve the username" }, { status: 404 });
  }

  const currentBlockNumber = await getCurrentBlockNumber();

  // Fetch the latest orders for the specified Fan Token
  const orders = await fetchOrders(fanToken, currentBlockNumber);

  // Filter the orders for the specific Fan Token
  const filteredOrders = orders.filter((order: any) => order.subjectToken.symbol === fanToken);

  // Resolve usernames for the addresses involved in the transactions
  const usernames = await Promise.all(
    filteredOrders.map(async (order: any) => {
      const fid: any = resolveBeneficiaryOrVestingToFid(order.user.address);
      const username = await fetchUsername(fid);
      const orderType = order.orderType;
      const amount = formatUnits(order.subjectAmount, 18);
      const roundedAmount = Math.round(Number(amount) * 100) / 100;

      return { username, orderType, roundedAmount };
    })
  );

  const message = `
Hey ${username},

Here are the latest stats for your Fan Token ${fanToken}:

${usernames.map((u, index) =>
    `${index + 1}. @${u.username} (${Number(u.roundedAmount)}) ${u.orderType}`
  ).join("\n")}

Best regards,
Your Fan Token Tracker by @gabrieltemtsen
`;

  // Send the message to the requester via Warpcast
  try {
    await axios.put(
      "https://api.warpcast.com/v2/ext-send-direct-cast",
      {
        recipientFid: fid,
        message,
        idempotencyKey: `${fid}-${Date.now()}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_WARPCAST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(`Failed to send notification to ${username}:`, error);
    return NextResponse.json({ error: "Failed to send the message" }, { status: 500 });
  }

  return NextResponse.json({ message: "Message sent successfully" });
}
