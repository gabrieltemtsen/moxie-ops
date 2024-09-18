import { createFrames } from "frames.js/next";
import {
  farcasterHubContext,
  warpcastComposerActionState,
} from "frames.js/middleware";

export const frames = createFrames({
  basePath: '/actions',
  debug: process.env.NODE_ENV === "development",
  middleware: [
    farcasterHubContext({
        // remove if you aren't using @frames.js/debugger or you just don't want to use the debugger hub
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
    warpcastComposerActionState(),
  ],
});