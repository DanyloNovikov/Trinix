import { ethers } from "ethers";
import { withIronSessionApiRoute } from "iron-session/next";
import * as util from "ethereumjs-util";
import { NextApiRequest, NextApiResponse } from "next";
import contract from "../../public/contracts/NftMarket.json";
import { NftMarketContract } from "@_types/nftMarketContract";

const NETWORKS = {
  "5777": "Ganache"
}

type NETWORK = typeof NETWORKS;

const abi = contract.abi;
const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_ID as keyof NETWORK;

export const contractAddress = contract["networks"][targetNetwork]["address"];
export const pinataApiKey = process.env.PINATA_API_KEY as string;
export const pinataApiSecret = process.env.PINATA_API_SECRECT as string;

export function withSession(handler: any) {
  return withIronSessionApiRoute(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD as string,
    cookieName: "nft-auth-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production" ? true : false
    }
  })
}

export const addressCheckMiddleware = async (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise( async (resolve, reject) => {
    const message = req.session.user["message-session"];
    const provider = new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:7545");
    const contract = new ethers.Contract(contractAddress, abi, provider) as unknown as NftMarketContract;

    
    let nonce: string | Buffer = 
      "\x19Ethereum Signed Message:\n" + 
      JSON.stringify(message).length + 
      JSON.stringify(message);

    nonce = util.keccak(Buffer.from(nonce, "utf-8"));
    const { v, r, s } = util.fromRpcSig(req.body.signature);
    const pubKey = util.ecrecover(util.toBuffer(nonce), v,r,s);
    const addrBuffer = util.pubToAddress(pubKey);
    const address = util.bufferToHex(addrBuffer);

    if (address === req.body.address) {
      resolve("Correct Address")
    } else {
      reject("Wrong Address")
    }
  });
};