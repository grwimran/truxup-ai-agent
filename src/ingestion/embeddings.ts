import "dotenv/config";
import { CohereClientV2 } from "cohere-ai";

const COHERE_API_KEY = process.env.COHERE_API_KEY;

if (!COHERE_API_KEY) {
  throw new Error(
    "COHERE_API_KEY is missing from .env"
  );
}

const cohere = new CohereClientV2({
  token: COHERE_API_KEY,
});

const EMBEDDING_MODEL = "embed-english-v3.0";

export async function createEmbedding(
  text: string
): Promise<number[]> {
  const response = await cohere.embed({
    model: EMBEDDING_MODEL,

    inputType: "search_document",

    embeddingTypes: ["float"],

    texts: [text],
  });

  const embeddings = response.embeddings?.float;

  if (!embeddings || embeddings.length === 0) {
    throw new Error(
      "Cohere API returned no embeddings"
    );
  }

  return embeddings[0];
}