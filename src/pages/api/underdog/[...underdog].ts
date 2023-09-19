import { NextApiHandler } from "next";

import { NextUnderdog, NetworkEnum } from "@underdog-protocol/js";

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
  }

  const nextUnderdog = NextUnderdog({
    apiKey: process.env.UNDERDOG_API_KEY!,
    network: process.env.NEXT_PUBLIC_NETWORK as NetworkEnum,
  });

  await nextUnderdog(req, res);
};

export default handler;
