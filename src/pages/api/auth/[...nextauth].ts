import axios from "axios";
import bs58 from "bs58";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import nextAuth, { NextAuthOptions } from "next-auth";
import credentialsProvider from "next-auth/providers/credentials";
import nacl from "tweetnacl";
import {
  createUnderdogClient,
  networkToUnderdogApiEndpoints,
} from "@underdog-protocol/js";

import { NetworkEnum } from "@underdog-protocol/types";
import { underdogClient } from "@/lib/underdog";

export const pagesNextAuthOptions: NextAuthOptions["pages"] = {
  signIn: "/signin",
};

export const jwtNextAuthOptions: NextAuthOptions["jwt"] = {
  async encode({ secret, token }) {
    return jwt.sign(token!, secret);
  },
  async decode({ secret, token }) {
    if (token) {
      return jwt.verify(token.toString(), secret);
    }
  },
};

const nextAuthOptions = (req: NextApiRequest): NextAuthOptions => ({
  jwt: jwtNextAuthOptions,
  providers: [
    credentialsProvider({
      credentials: {
        walletAddress: { label: "Wallet Address" },
        signature: { label: "Signature" },
      },
      async authorize(credentials) {
        if (!credentials) throw new Error("No credentials provided");

        const nonce = req.cookies["auth-nonce"];

        const message = `Sign this message to connect your wallet.\n\nNonce: ${nonce}`;
        const messageBytes = new TextEncoder().encode(message);

        const publicKeyBytes = bs58.decode(credentials.walletAddress);
        const signatureBytes = bs58.decode(credentials.signature);

        const result = nacl.sign.detached.verify(
          messageBytes,
          signatureBytes,
          publicKeyBytes
        );

        if (!result) throw new Error("Unable to verify signature");

        const nfts = await underdogClient.getNfts({
          params: { projectId: 1 },
          query: { page: 1, limit: 1, ownerAddress: credentials.walletAddress },
        });

        if (nfts.results.length === 0) {
          const stats = await underdogClient.getProjectStats({ params: { projectId: 1 } });

          await underdogClient.createNft({
            params: { projectId: 1 },
            body: {
              name: `Kevin's Membership Card #${stats.total + 1}`,
              image: "https://dev.updg8.com/imgdata/A6Mi24fpmJg7hZ1TTNP52n4PUcmhjosF8aiH5ZssQVxu",
              receiverAddress: credentials.walletAddress,
            }
          });
        }

        return {
          id: credentials.walletAddress,
          name: credentials.walletAddress,
        };
      },
    }),
  ],
  pages: pagesNextAuthOptions,
  secret: process.env.NEXTAUTH_SECRET!,
  session: {
    strategy: "jwt",
  },
});

const handler = (req: NextApiRequest, res: NextApiResponse) =>
  nextAuth(req, res, nextAuthOptions(req));

export default handler;
