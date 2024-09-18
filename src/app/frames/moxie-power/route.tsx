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
        style={{
          width: '100%',
          height: '100%',
          padding: '5rem',
          margin: '2rem',
          background: 'linear-gradient(to right, #BF40BF 50%, #CF9FFF 50%)',
        }}
         tw="flex flex-col relative p-3 overflow-hidden  h-full w-full">
          

           <div tw="flex absolute m-20 p-9 inset-0 flex-col h-77 items-center justify-center p-8 bg-white text-black rounded-lg shadow-lg ">
           <div tw="flex justify-center items-center text-4xl font-extrabold text-black tracking-wide drop-shadow-lg">
        
  Install Moxie Power Cast Actions
</div>
<div tw="text-xl mt-4 text-black font-medium tracking-wider">
  Check the REPLYKE value in USD and in Moxies easily using cast actions.
</div>
<div tw="absolute bottom-4 right-4 text-sm text-blue-700 italic">
  Frame by @gabrieltemtsen
</div>
          </div>
        </div>
      ),
      buttons: [
        <Button key="subscribe" action="link" target={'https://warpcast.com/~/add-cast-action?actionType=post&icon=check&name=moxie+power+in+%E2%93%82+&postUrl=https%3A%2F%2Fwww.moxie-ops.xyz%2Factions%2FgetMoxiepower'}>
          Moxie power in Ⓜ
        </Button>,
        <Button key="unsubscribe" action="link" target={'https://warpcast.com/~/add-cast-action?actionType=post&icon=check&name=moxie+power+in+%EF%BC%84+&postUrl=https%3A%2F%2Fwww.moxie-ops.xyz%2Factions%2FgetMoxiePowerUSD'}>
          Moxie power in $
        </Button>,
        <Button key="request-stats" action="link" target={'https://warpcast.com/~/compose?text=Check%20caster%27s%20moxie%20power%20easily%20through%20cast%20actions%20in%20Moxies%20or%20USD%20install%20actions%20in%20frame%20below%20by%20@gabrieltemtsen&embeds[]=https://moxie-ops.xyz/frames/moxie-power'}>
          Share
        </Button>,
      ],
    };


});

export const GET = handleRequest;
export const POST = handleRequest;
