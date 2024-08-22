import { ethers } from "ethers";

// Set up a provider, e.g., using Infura or Alchemy
const provider = new ethers.providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/ImPte7otRAJ_4gDny9NLO_Ao9GT4_CiQ');

export async function getCurrentBlockNumber(): Promise<number> {
  const blockNumber = await provider.getBlockNumber();
  return blockNumber;
}
