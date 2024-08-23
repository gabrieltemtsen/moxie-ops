import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import axios from "axios";

const frames = createFrames({
  basePath: '/frames',
  middleware: [
    farcasterHubContext({
      ...(process.env.NODE_ENV === "production"
        ? {
          hubHttpUrl: "https://hubs.airstack.xyz",
          hubRequestOptions: {
            headers: {
              "x-airstack-hubs": process.env.NEXT_PUBLIC_AIRSTACK_KEY as string,
            },
          },
        }
        : {
            hubHttpUrl: "http://localhost:3010/hub",
          }),
    }),
  ],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const handleRequest = frames(async (ctx) => {
  const action = ctx.url.searchParams.get("action");
  const inputText = ctx.message?.inputText || ctx.url.searchParams.get("username");
  const username = ctx.message?.requesterUserData?.username;
  const requesterFid = String(ctx.message?.requesterFid);

  // Default View
  if (!action) {
    console.log("requesterFid", requesterFid);
    return {
      image: (
        <div
          tw="relative flex w-full h-full items-center justify-center bg-cover object-scale-down bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${baseUrl}/subFantoken.jpg)`, objectFit: 'contain' }}
        >
        </div>
      ),
      buttons: [
        <Button key="subscribe" action="post" target={{ query: { action: "subscribe" } }}>
          Subscribe
        </Button>,
        <Button key="unsubscribe" action="post" target={{ query: { action: "unsubscribe" } }}>
          Unsubscribe
        </Button>,
        <Button key="request-stats" action="post" target={{ query: { action: "select-stats" } }}>
          Request Stats
        </Button>,
      ],
    };
  }

  // Select between User FT or Channel FT
  if (action === "select-stats") {
    return {
      imageOptions: {
        width: 1200,
        height: 630,
      },
      image: (
        <div
          tw="relative flex w-full h-full items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${baseUrl}/reqFantoken.jpg)`, objectFit: 'contain' }}
        >
        </div>
      ),
      buttons: [
        <Button key="user-ft" action="post" target={{ query: { action: "request-stats-user" } }}>
          Request User FT Stats
        </Button>,
        <Button key="channel-ft" action="post" target={{ query: { action: "request-stats-channel" } }}>
          Request Channel FT Stats
        </Button>,
      ],
    };
  }

  // Subscribe
  if (action === "subscribe") {
    console.log("requesterFid1", requesterFid);
    const subscriptionResponse = await fetch(`${baseUrl}/api/subs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fid: requesterFid,
        username: username,
        fanToken: `fid:${requesterFid}`, // Replace with actual fanToken information
        alertType: "buy-sell",
      }),
    });

    return {
      image: (
        <div tw="flex w-full h-full items-center justify-center text-center">
          <div tw="text-2xl font-bold text-green-600">
            {subscriptionResponse.ok ? 'Subscription Successful!' : 'Subscription Failed. Please try again.'}
          </div>
        </div>
      ),
      buttons: [
        <Button key="subscribe" action="post" target={{ query: { action: "subscribe" } }}>
          Subscribe
        </Button>,
        <Button key="unsubscribe" action="post" target={{ query: { action: "unsubscribe" } }}>
          Unsubscribe
        </Button>,
        <Button key="request-stats" action="post" target={{ query: { action: "select-stats" } }}>
          Request Stats
        </Button>,
      ],
    };
  }

  // Unsubscribe
  if (action === "unsubscribe") {
    console.log("requesterFid2", requesterFid);
    const unsubscribeResponse = await fetch(`${baseUrl}/api/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fid: requesterFid,
        fanToken: "fanTokenHere", // Replace with actual fanToken information
      }),
    });

    return {
      image: (
        <div tw="flex w-full h-full items-center justify-center text-center">
          <div tw="text-2xl font-bold text-green-600">
            {unsubscribeResponse.ok ? 'Unsubscription Successful!' : 'Unsubscription Failed. Please try again.'}
          </div>
        </div>
      ),
      buttons: [],
    };
  }

  // Request Stats for User FT - Ask for Username
  if (action === "request-stats-user" && !inputText) {
    console.log("requesterFid3", requesterFid);
    return {
      imageOptions: {
        width: 1200,
        height: 630,
      },
      image: (
        <div
          tw="relative flex w-full h-full items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${baseUrl}/reqFantoken.jpg)`, objectFit: 'contain' }}
        >
        </div>
      ),
      buttons: [
        <Button key="enter-username" action="post" target={{ query: { action: "request-stats-user", username: ctx.message?.inputText || "" } }}>
        Request User FT Stats
        </Button>,
      ],
      textInput: "Enter Fan Token Username:",
    };
  }

  // Request Stats for User FT - Process Username
  if (action === "request-stats-user" && inputText) {
    const url = `https://api.neynar.com/v2/farcaster/user/search?q=${inputText}&limit=5`;
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY }
    };

    const neynarResponse = await axios.get(url, options);
    const users = neynarResponse.data.result.users;
    const fanTokenFid = users.length ? `fid:${users[0].fid}` : null;

    if (!fanTokenFid) {
      return {
        image: (
          <div tw="flex w-full h-full items-center justify-center text-center">
            <div tw="text-2xl font-bold text-red-600">
              Fan Token Not Found
            </div>
          </div>
        ),
        buttons: [],
      };
    }

    const statsResponse = await fetch(`${baseUrl}/api/get-stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fid: requesterFid,
        fanToken: fanTokenFid,
      }),
    });

    return {
      image: (
        <div tw="flex w-full h-full items-center justify-center text-center">
          <div tw="text-2xl font-bold text-green-600">
            {statsResponse.ok ? 'Stats Request Successful! Check your DCs.' : 'Stats Request Failed. Please try again.'}
          </div>
        </div>
      ),
      buttons: [
        <Button key="subscribe" action="post" target={{ query: { action: "" } }}>
          Reset
        </Button>,
        
      ],
    };
  }

  // Request Stats for Channel FT - Ask for Channel Name
  if (action === "request-stats-channel" && !inputText) {
    return {
      imageOptions: {
        width: 1200,
        height: 630,
      },
      image: (
        <div
          tw="relative flex w-full h-full items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${baseUrl}/reqFantoken.jpg)`, objectFit: 'contain' }}
        >
        </div>
      ),
      buttons: [
        <Button key="enter-channel" action="post" target={{ query: { action: "request-stats-channel", username: ctx.message?.inputText || "" } }}>
          Request Channel FT
        </Button>,
      ],
      textInput: "Enter Channel Name/ID:",
    };
  }

  // Request Stats for Channel FT - Process Channel Name
  if (action === "request-stats-channel" && inputText) {
    const url = `https://api.neynar.com/v2/farcaster/channel/search?q=${inputText}`;
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY }
    };

    const neynarResponse = await axios.get(url, options);
    const channels = neynarResponse.data.channels;
    const fanTokenCid = channels.length ? `cid:${channels[0].id}` : null;

    if (!fanTokenCid) {
      return {
        image: (
          <div tw="flex w-full h-full items-center justify-center text-center">
            <div tw="text-2xl font-bold text-red-600">
              Channel Not Found
            </div>
          </div>
        ),
        buttons: [
          <Button key="subscribe" action="post" target={{ query: { action: "" } }}>
            Reset
          </Button>,
        ],
      };
    }

    const statsResponse = await fetch(`${baseUrl}/api/get-stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fid: requesterFid,
        fanToken: fanTokenCid,
      }),
    });

    return {
      image: (
        <div tw="flex w-full h-full items-center justify-center text-center">
          <div tw="text-2xl font-bold text-green-600">
            {statsResponse.ok ? 'Stats Request Successful! Check your DCs.' : 'Stats Request Failed. Please try again.'}
          </div>
        </div>
      ),
      buttons: [
        <Button key="subscribe" action="post" target={{ query: { action: "" } }}>
          Reset
        </Button>,
      ],
    };
  }

  // Fallback for any other unexpected states
  return {
    image: (
      <div tw="flex w-full h-full items-center justify-center text-center">
        <div tw="text-2xl font-bold text-red-600">
          An unexpected error occurred.
        </div>
      </div>
    ),
    buttons: [
      <Button key="subscribe" action="post" target={{ query: { action: "" } }}>
        Reset
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
