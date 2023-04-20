// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import { PineconeClient, ScoredVector } from "@pinecone-database/pinecone";
const pinecone = new PineconeClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  await pinecone.init({
    environment: "asia-northeast1-gcp",
    apiKey: process.env.PINECONE_KEY as string,
  });

  const pineconeInfo = await pinecone
    .Index("openai")
    .describeIndexStats({ describeIndexStatsRequest: { filter: {} } });

  const sites = [];
  for (var k in pineconeInfo.namespaces) {
    sites.push(k);
  }
  return res.json({
    status: "success",
    // @ts-ignore
    sites: sites,
  });
}
