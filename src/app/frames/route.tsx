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
        <Button key="back" action="post" target={{ query: { action: "" } }}>
          Back
        </Button>,
      ],
    };
  }

  // Subscribe
  if (action === "subscribe") {
    console.log("requesterFid1", requesterFid);

    // Check if the user is already subscribed
    const existingSubscriptionResponse = await fetch(`${baseUrl}/api/check-sub`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fanToken: `fid:${requesterFid}`,
      }),
    });

    const existingSubscription = await existingSubscriptionResponse.json();
    console.log("existingSubscription", existingSubscription);

    if (existingSubscription.isSubscribed.isSubscribed) {
      return {
        image: (
          <div tw="flex w-full h-full items-center justify-center text-center bg-purple-700">
            <div tw="text-3xl font-bold text-white">
              You are already subscribed!
            </div>
          </div>
        ),
        buttons: [
          <Button key="back" action="post" target={{ query: { action: "" } }}>
            Back
          </Button>,
        ],
      };
    }

    // Proceed with subscription if not already subscribed
    const subscriptionResponse = await fetch(`${baseUrl}/api/subs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fid: requesterFid,
        username: username,
        fanToken: `fid:${requesterFid}`,
        alertType: "buy-sell",
      }),
    });

    return {
      image: (
        <div tw="flex w-full h-full items-center justify-center text-center bg-purple-700">
          <div tw="text-3xl font-bold text-white">
            {subscriptionResponse.ok ? 'Subscription Successful!' : 'Subscription Failed. Please try again.'}
          </div>
        </div>
      ),
      buttons: [
        <Button key="subscribe" action="post" target={{ query: { action: "" } }}>
          Reset
        </Button>,
        <Button 
          key="share"
          action="link"
          target={
            'https://warpcast.com/~/compose?text=Subscribe%20to%20daily%20Moxie%20Fantoken%20tracker%20to%20see%20who%20bought/sold%20your%20fan%20tokens%20or%20request%20your%20fantoken%20stats%20at%20anytime%20by%20@gabrieltemtsen&embeds[]=https://moxie-ops.xyz/frames'
          }
        >
          share
        </Button>,
        <Button key="back" action="post" target={{ query: { action: "" } }}>
          Back
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
        fanToken: `fid:${requesterFid}`,
      }),
    });

    return {
      image: (
        <div tw="flex w-full h-full items-center justify-center text-center bg-purple-700">
          <div tw="text-3xl font-bold text-white">
            {unsubscribeResponse.ok ? 'Unsubscription Successful!' : 'Unsubscription Failed. Please try again.'}
          </div>
        </div>
      ),
      buttons: [
        <Button key="subscribe" action="post" target={{ query: { action: "" } }}>
          Reset
        </Button>,
        <Button 
          key="share"
          action="link"
          target={
            'https://warpcast.com/~/compose?text=Subscribe%20to%20daily%20Moxie%20Fantoken%20tracker%20to%20see%20who%20bought/sold%20your%20fan%20tokens%20or%20request%20your%20fantoken%20stats%20at%20anytime%20by%20@gabrieltemtsen&embeds[]=https://moxie-ops.xyz/frames'
          }
        >
          share
        </Button>,
        <Button key="back" action="post" target={{ query: { action: "" } }}>
          Back
        </Button>,
      ],
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
        <Button key="back" action="post" target={{ query: { action: "select-stats" } }}>
          Back
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
          <div tw="flex w-full h-full items-center justify-center text-center bg-purple-700">
            <div tw="text-3xl font-bold text-white">
              Fan Token Not Found
            </div>
          </div>
        ),
        buttons: [
          <Button key="subscribe" action="post" target={{ query: { action: "" } }}>
            Reset
          </Button>,
          <Button key="back" action="post" target={{ query: { action: "select-stats" } }}>
            Back
          </Button>,
        ],
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
        <div tw="flex w-full h-full items-center justify-center text-center bg-purple-700">
          <div tw="text-3xl font-bold text-white">
            {statsResponse.ok ? 'Stats Request Successful! Check your DCs.' : 'Stats Request Failed. Please try again.'}
          </div>
        </div>
      ),
      buttons: [
        <Button key="subscribe" action="post" target={{ query: { action: "" } }}>
          Reset
        </Button>,
        <Button key="back" action="post" target={{ query: { action: "select-stats" } }}>
          Back
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
        <Button key="back" action="post" target={{ query: { action: "select-stats" } }}>
          Back
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
          <div tw="flex w-full h-full items-center justify-center text-center bg-purple-700">
            <div tw="text-3xl font-bold text-white">
              Channel Not Found
            </div>
          </div>
        ),
        buttons: [
          <Button key="subscribe" action="post" target={{ query: { action: "" } }}>
            Reset
          </Button>,
          <Button key="back" action="post" target={{ query: { action: "select-stats" } }}>
            Back
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
        <div tw="flex w-full h-full items-center justify-center text-center bg-purple-700">
          <div tw="text-3xl font-bold text-white">
            {statsResponse.ok ? 'Stats Request Successful! Check your DCs.' : 'Stats Request Failed. Please try again.'}
          </div>
        </div>
      ),
      buttons: [
        <Button key="subscribe" action="post" target={{ query: { action: "" } }}>
          Reset
        </Button>,
        <Button key="back" action="post" target={{ query: { action: "select-stats" } }}>
          Back
        </Button>,
      ],
    };
  }

  // Fallback for any other unexpected states
  return {
    image: (
      <div tw="flex w-full h-full items-center justify-center text-center bg-purple-700">
        <div tw="text-3xl font-bold text-white">
          An unexpected error occurred.
        </div>
      </div>
    ),
    buttons: [
      <Button key="subscribe" action="post" target={{ query: { action: "" } }}>
        Reset
      </Button>,
      <Button key="back" action="post" target={{ query: { action: "" } }}>
        Back
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
