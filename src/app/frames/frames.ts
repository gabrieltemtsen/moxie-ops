import { farcasterHubContext } from "frames.js/middleware";
import { createFrames } from "frames.js/next";

export const frames = createFrames({
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
  