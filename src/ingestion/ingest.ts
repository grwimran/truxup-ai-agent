import "dotenv/config";
import { loadKnowledgeDocuments } from "./loader";
import { splitDocuments } from "./splitter";
import { createEmbedding } from "./embeddings";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env"
  );
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

async function main() {
  console.log("Starting TruxUp knowledge ingestion...\n");

  // 1. Load Markdown documents
  const documents = await loadKnowledgeDocuments();

  console.log(
    `Loaded ${documents.length} Markdown document(s).`
  );

  // 2. Split documents into chunks
  const chunks = await splitDocuments(documents);

  console.log(
    `Created ${chunks.length} chunk(s).\n`
  );

  // 3. Clear previous data
  console.log("Clearing existing knowledge chunks...");

  const { error: deleteError } = await supabase
    .from("truxup_documents")
    .delete()
    .not("id", "is", null);

  if (deleteError) {
    throw new Error(
      `Failed to clear existing documents: ${deleteError.message}`
    );
  }

  console.log("Existing chunks cleared.\n");

  // 4. Process every chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    console.log(
      `[${i + 1}/${chunks.length}] Embedding ${chunk.documentName} - chunk ${chunk.chunkIndex}`
    );

    // Create Cohere embedding
    const embedding = await createEmbedding(
      chunk.content
    );

    console.log(
      `  Embedding dimensions: ${embedding.length}`
    );

    // Insert into Supabase
    const { error } = await supabase
      .from("truxup_documents")
      .insert({
        document_name: chunk.documentName,
        category: chunk.category,
        chunk_index: chunk.chunkIndex,
        content: chunk.content,
        embedding: embedding,
        metadata: chunk.metadata,
      });

    if (error) {
      throw new Error(
        `Failed inserting ${chunk.documentName} chunk ${chunk.chunkIndex}: ${error.message}`
      );
    }

    console.log("  Inserted successfully.");
  }

  console.log("\n========================================");
  console.log("INGESTION COMPLETED SUCCESSFULLY");
  console.log("========================================");
  console.log(`Documents: ${documents.length}`);
  console.log(`Chunks inserted: ${chunks.length}`);
}

main().catch((error) => {
  console.error("\nIngestion error:");
  console.error(error);
  process.exit(1);
});