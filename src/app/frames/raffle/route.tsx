import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { frames } from "../frames";
import axios from "axios";
import { BackgroundImage } from "../components/background-image";
import { Container } from "../components/container";
import { Row } from "../components/row";
import { Text } from "../components/text";
import { Avatar } from "../components/avatar";
import { UserBanner } from "../components/user-banner";
import { TransactionResult } from "../components/transaction-result";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const handleRequest = frames(async (ctx) => {
  const action = ctx.url.searchParams.get("action");
  const inputText = ctx.message?.inputText || ctx.url.searchParams.get("username");
  const username = ctx.message?.requesterUserData?.username;
  const requesterFid = String(ctx.message?.requesterFid);


   // **Default View**
   if (!action) {
    return {
      image: (
        <Container tw="flex flex-col items-center bg-[#1A1A1A] text-white p-6 rounded-lg shadow-lg">
          <Avatar
            size="lg"
            borderRadius="full"
            src="https://i.imgur.com/58E5aNl.jpg"
          />
          <Text tw="text-4xl font-bold text-center italic">
            Register for Gabrieltemtsens FT Raffle Draws
          </Text>
        </Container>
      ),
      buttons: [
        <Button key="register" action="post" target={{ query: { action: "register" } }}>
          Register
        </Button>,
        <Button key="share" action="post" target={{ query: { action: "share" } }}>
          Share
        </Button>,
      ],
    };
  }

  // **Register Action**
  if (action === "register") {
    try {
      // Check if user is already registered
      const checkEntryResponse = await fetch(`${baseUrl}/api/check-entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid: requesterFid }),
      });

      if (!checkEntryResponse.ok) {
        throw new Error(`Error checking entry: ${await checkEntryResponse.text()}`);
      }

      const checkEntryData = await checkEntryResponse.json();
      if (checkEntryData?.isRegistered) {
        return {
          image: (
            <TransactionResult type="success">
              You are already registered! Good luck 🎉
            </TransactionResult>
          ),
          buttons: [
            <Button key="share" action="post" target={{ query: { action: "share" } }}>
              Share
            </Button>,
          ],
        };
      }

      // Register the user
      const registerResponse = await fetch(`${baseUrl}/api/raffle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid: requesterFid, username }),
      });

      if (!registerResponse.ok) {
        throw new Error(`Error registering user: ${await registerResponse.text()}`);
      }

      return {
        image: (
          <TransactionResult type="success">
            Registration Successful! Good luck 🎉
          </TransactionResult>
        ),
        buttons: [
          <Button
            key="share"
            action="link"
            target="https://warpcast.com/~/compose?text=Register%20for%20@gabrieltemtsen%20Fantoken%20raffleDraw%20to%20win%205k%20moxies%20for%205%20lucky%20winners%20by%20@gabrieltemtsen&embeds[]=https://moxie-ops.xyz/frames/raffle"
          >
            Share
          </Button>,
          <Button key="back" action="post" target={{ query: { action: "" } }}>
            Back
          </Button>,
        ],
      };
    } catch (error) {
      console.error("Error during registration:", error);
      return {
        image: (
          <TransactionResult type="error">
            Registration failed. Please try again.
          </TransactionResult>
        ),
        buttons: [
          <Button key="retry" action="post" target={{ query: { action: "register" } }}>
            Retry
          </Button>,
          <Button key="back" action="post" target={{ query: { action: "" } }}>
            Back
          </Button>,
        ],
      };
    }
  }

  // **Share Action**
  if (action === "share") {
    return {
      image: (
        <Container tw="flex flex-col items-center bg-[#1A1A1A] text-white p-6 rounded-lg shadow-lg">
          <Text tw="text-3xl font-bold text-center">
            Spread the word! 🎉
          </Text>
        </Container>
      ),
      buttons: [
        <Button
          key="share-link"
          action="link"
          target="https://warpcast.com/~/compose?text=Register%20for%20@gabrieltemtsen%20Fantoken%20raffleDraw%20to%20win%205k%20moxies%20for%205%20lucky%20winners%20by%20@gabrieltemtsen&embeds[]=https://moxie-ops.xyz/frames/raffle"
        >
          Share on Warpcast
        </Button>,
        <Button key="back" action="post" target={{ query: { action: "" } }}>
          Back
        </Button>,
      ],
    };
  }

  // **Fallback for Invalid Actions**
  return {
    image: (
      <TransactionResult type="error">
        Invalid action. Please try again.
      </TransactionResult>
    ),
    buttons: [
      <Button key="reset" action="post" target={{ query: { action: "" } }}>
        Reset
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
