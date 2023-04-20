// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import NextCors from "nextjs-cors";
import { PineconeClient, ScoredVector } from "@pinecone-database/pinecone";

const pinecone = new PineconeClient();

// open api utility library
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_KEY,
  })
);

async function queryIndex(
  pinecone: any,
  namespace: string,
  embedding: any
): Promise<ScoredVector[]> {
  const index = pinecone.Index("openai");
  const queryRequest = {
    vector: embedding,
    topK: 3,
    includeValues: false,
    includeMetadata: true,
    namespace: namespace,
  };
  const results = await index.query({ queryRequest });
  return results.matches || [];
}

type Data = {
  status: string;
  data: any;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  try {
    const { name, messages } = req.body;
    if (
      req.method !== "POST" ||
      name === null ||
      messages == null ||
      messages.length === 0
    ) {
      return res
        .status(504)
        .json({ status: "error", data: null, message: "Not a valid request" });
    }
    await pinecone.init({
      environment: "asia-northeast1-gcp",
      apiKey: process.env.PINECONE_KEY as string,
    });

    const lastQuestion = messages[messages.length - 1].content;
    console.log("query index : " + name + ". Question: " + lastQuestion);
    // get embeddings value for prompt question
    const promptEmbeddingsResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: lastQuestion,
    });

    const queryResults = await queryIndex(
      pinecone,
      name,
      promptEmbeddingsResponse.data.data[0].embedding
    );
    console.log("Retrieved results: " + queryResults.length);
    if (queryResults.length === 0) {
      // return an error response to the client
      return res.json({
        status: "error",
        data: null,
        message: "No valid response from OpenAI",
      });
    }
    // @ts-ignore
    const finalPrompt = `Info: ${queryResults[0].metadata.content}
      Question: ${lastQuestion}
      Answer: 
  `;

    messages[messages.length - 1].content = finalPrompt;
    console.log("chat completion time sending this prompt...");
    console.log(finalPrompt);
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      //   max_tokens: 100,/
    });
    console.log("got a response from chatgpt");
    if (!response.data?.choices?.[0]?.message?.content) {
      // return an error response to the client
      return res.json({
        status: "error",
        data: null,
        message: "No valid response from OpenAI",
      });
    }
    // get the bot's answer from the OpenAI API response
    const botAnswer = response.data?.choices?.[0]?.message?.content;
    // create the bot message object
    const botMessage = { role: "assistant", content: botAnswer };
    // store bot message in global message state
    messages.push(botMessage);
    // send the bot's answer back to the client
    return res.json({
      status: "success",
      data: {
        answer: botAnswer,
        messages,
        message: "",
        // @ts-ignore
        domain: queryResults ? queryResults.id : "",
      },
    });
  } catch (ex) {
    // console.log(127, ex);
    return res.json({
      status: "error",
      data: null,
      // @ts-ignore
      message: ex?.message || "Unknown Error",
    });
  }
}
