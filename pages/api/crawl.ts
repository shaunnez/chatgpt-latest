// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { CheerioCrawler, Dataset, EnqueueStrategy } from "crawlee";
import { PineconeClient, ScoredVector } from "@pinecone-database/pinecone";
import { getEmbeddingsForText } from "@/services/getEmbeddingsForText";

const crawler = new CheerioCrawler({
  // Use the requestHandler to process each of the crawled pages.
  maxRequestsPerCrawl: 10000,
  async requestHandler({ request, $, enqueueLinks, log }) {
    const title = $("title").text();
    $("script, style").remove();
    const cleanText = $("body")
      .text()
      .replace(/\s\s+/g, " ") // Remove extra whitespace
      .trim(); // Remove leading and trailing spaces
    log.info(`Title of ${request.loadedUrl} is '${title}'`);
    const dataset = await Dataset.open(
      new URL(request.loadedUrl as string).hostname
    );
    // Save results as JSON to ./storage/datasets/default
    await dataset.pushData({
      domain: request.loadedUrl,
      title: title,
      content: removeNewlines(cleanText),
    });
    await enqueueLinks({
      strategy: EnqueueStrategy.SameOrigin,
      transformRequestFunction(req) {
        // ignore all links ending with `.pdf`
        if (req.url.endsWith(".pdf")) return false;
        if (req.url.endsWith(".json")) return false;
        if (req.url.endsWith(".csv")) return false;
        if (req.url.endsWith(".xlsx")) return false;
        if (req.url.endsWith(".xls")) return false;
        if (req.url.endsWith(".doc")) return false;
        if (req.url.endsWith(".docx")) return false;
        if (req.url.endsWith(".ppt")) return false;
        if (req.url.endsWith(".pptx")) return false;
        if (req.url.endsWith(".jpeg")) return false;
        if (req.url.endsWith(".jpg")) return false;
        if (req.url.endsWith(".png")) return false;
        if (req.url.endsWith(".gif")) return false;
        return req;
      },
    });
  },
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const pinecone = new PineconeClient();

async function upsertEmbeddings(
  pinecone: any,
  namespace: string,
  embedding: any
): Promise<boolean> {
  const index = pinecone.Index("openai");
  const upsertRequest = {
    namespace: namespace,
    vectors: embedding,
  };
  try {
    const result = await index.upsert({ upsertRequest });
    // @ts-ignore
    if (result.upsertedCount > 0) {
      return true;
    } else {
      return false;
    }
  } catch (ex) {
    console.log("hmm", ex);
    return false;
  }
}

// utility method
function removeNewlines(serie: string) {
  serie = serie.replace(/\n/g, " ");
  serie = serie.replace(/\\n/g, " ");
  serie = serie.replace(/ {2}/g, " ");
  serie = serie.replace(/ {2}/g, " ");
  return serie;
}

function chunkArray(array: any, chunkSize = 100) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, url } = req.body;

  if (req.method !== "POST" || url == null) {
    return res.status(504).json({ status: "error", data: null });
  }
  await pinecone.init({
    environment: "asia-northeast1-gcp",
    apiKey: process.env.PINECONE_KEY as string,
  });
  console.log("initializing crawling...");
  const crawlerResults = await crawler.run([url]);
  console.log("crawling done", crawlerResults);
  const localDataset = await Dataset.open(new URL(url).hostname);
  const localData = await localDataset.getData();
  const promises = [] as any[];
  const pineconePromises = [] as any[];
  const embeddings = [] as any[];
  console.log("generating embeddings...");
  localData.items.slice(0, 10).forEach((item) => {
    promises.push(
      new Promise(async (resolve, reject) => {
        try {
          if (!item.content) {
            throw Error();
          }
          const textEmbeddings = await getEmbeddingsForText({
            text: item.content,
          });
          if (textEmbeddings.length === 0) {
            throw Error();
          }
          textEmbeddings.forEach((x, i) => {
            embeddings.push({
              id: `${item.domain}#${i}`,
              values: x.embedding,
              metadata: { content: x.text },
            });
          });
          resolve(true);
        } catch (error) {
          console.log("failed to create embedding: " + item.domain);
          resolve(false);
        }
      })
    );
  });
  await Promise.all(promises);
  console.log("embedding generation done: " + embeddings.length);
  console.log("storing in pinecone...");
  const chunkedArray = chunkArray(embeddings, 100);
  chunkedArray.forEach((item) => {
    pineconePromises.push(upsertEmbeddings(pinecone, name, item));
  });
  const pineconeResults = await Promise.all(pineconePromises);
  console.log("pinecone inserts done", pineconeResults);
  return res.json({
    status: "success",
    // data: crawlerResults,
  });
}
