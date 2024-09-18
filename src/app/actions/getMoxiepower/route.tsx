import { NextRequest } from "next/server";
import {frames} from "../frames"
import { castAction, castActionMessage } from "frames.js/core";
import { gql, GraphQLClient } from "graphql-request";
import Moralis from 'moralis';


import { getUserDataForFid } from "frames.js";
import { fetchQuery } from "@airstack/node";
import { init } from "@airstack/node";

init(`${process.env.NEXT_PUBLIC_AIRSTACK_KEY}`);

const queryFarscore = gql`
 query Farscore($fid: String!){
  Socials(
    input: {
      filter: {
        dappName: {_eq: farcaster},
        userId: {_eq: $fid}
      },
      blockchain: ethereum
    }
  ) {
    Social {
      farcasterScore {
        farScore # Get the FarScore here
      }
    }
  }
}
`;

const getMoxiePrice = async () => {
  try {
    await Moralis.start({
      apiKey: process.env.NEXT_PUBLIC_MORALIS_KEY,
    });
  
    const response = await Moralis.EvmApi.token.getTokenPrice({
      "chain": "0x2105",
      "address": "0x8C9037D1Ef5c6D1f6816278C7AAF5491d24CD527"
    });
    return response.raw.usdPrice; 
  } catch (e) {
    console.error(e);
  }

}

const getUserFarscore = async (fid: string) => {
 
    try {
      const { data, error } = await fetchQuery(queryFarscore, { fid: fid });
      console.log('data:', data);
      console.log('error:', error);
      return data.Socials.Social[0].farcasterScore.farScore;
    } catch (error) {
      console.error("Failed to fetch thefarscore: :", error);
      throw new Error("Could not fetch farscore.");
    }
  };



export const GET = async (req: NextRequest) => {
  return castAction({
    action: {
      type: "post",
    },
    icon: "globe",
    name: "check moxie power",
    aboutUrl: `${process.env.VERCEL_URL}/actions/getMoxiepower`,
    description: "Check Casters Moxie Power",
  });
};

export const POST = frames(async (ctx) => {
  const moxiePrice = await getMoxiePrice();
  const casterFid = ctx.message?.castId?.fid as number;
  const convertedFid = String(casterFid);
  const userData = await getUserDataForFid({ fid: casterFid });
  console.log('userData:', userData);
  const username = userData?.username;
  const farscore = (await getUserFarscore(convertedFid));
  const likeScore = Math.round(1 * farscore);
  const likeInUSD = parseFloat((moxiePrice ? likeScore * moxiePrice : 0).toFixed(4));
  const replyScore = Math.round(3 * farscore);
  const replyInUSD =parseFloat((moxiePrice ? replyScore * moxiePrice : 0).toFixed(4));
  const recastScore =(6 * farscore);
  const recastInUSD = parseFloat((moxiePrice ? recastScore * moxiePrice : 0).toFixed(4));

   

   
  return castActionMessage(`${username}'s  REPLYKE POWER: \n\n LIKE: ${likeScore} Moxies ==> $${likeInUSD} \n\n REPLY: ${replyScore} Moxies ==> $${replyInUSD} \n\n RECAST/QUOTE:${recastScore} Moxies ==> $${recastInUSD}`);

 


});