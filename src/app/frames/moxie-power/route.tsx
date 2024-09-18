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
    console.log("requesterFid", requesterFid);
    return {
      image: (
        <div
          tw="relative flex w-full h-full items-center justify-center bg-cover object-scale-down bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${baseUrl}/moxie-power.png)`, objectFit: 'contain' }}
        >
        </div>
      ),
      buttons: [
        <Button key="subscribe" action="link" target={'https://warpcast.com/~/add-cast-action?actionType=post&icon=check&name=moxie+power+in+%E2%93%82+&postUrl=https%3A%2F%2Fwww.moxie-ops.xyz%2Factions%2FgetMoxiepower'}>
          Moxie power in Ⓜ
        </Button>,
        <Button key="unsubscribe" action="link" target={'https://warpcast.com/~/add-cast-action?actionType=post&icon=check&name=moxie+power+in+%EF%BC%84+&postUrl=https%3A%2F%2Fwww.moxie-ops.xyz%2Factions%2FgetMoxiePowerUSD'}>
          Moxie power in $
        </Button>,
        <Button key="request-stats" action="link" target={''}>
          Share
        </Button>,
      ],
    };


});

export const GET = handleRequest;
export const POST = handleRequest;
