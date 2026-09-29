import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { createEmbedding } from "../ingestion/embeddings";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing"
  );
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

export type RetrievedDocument = {
  id: number;
  document_name: string;
  category: string;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
};

export async function retrieveDocuments(
  query: string,
  matchCount = 5
): Promise<RetrievedDocument[]> {
  // Create embedding for user's question
  const queryEmbedding = await createEmbedding(query);

  console.log(
    `Query embedding dimensions: ${queryEmbedding.length}`
  );

  // Search Supabase pgvector
  const { data, error } = await supabase.rpc(
    "match_truxup_documents",
    {
      query_embedding: queryEmbedding,
      match_count: matchCount,
    }
  );

  if (error) {
    throw new Error(
      `Vector search failed: ${error.message}`
    );
  }

  return data ?? [];
}