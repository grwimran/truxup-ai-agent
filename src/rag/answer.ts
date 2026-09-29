import "dotenv/config";
import { CohereClientV2 } from "cohere-ai";
import { retrieveDocuments } from "./retriever";

const COHERE_API_KEY = process.env.COHERE_API_KEY;

if (!COHERE_API_KEY) {
  throw new Error("COHERE_API_KEY is missing from .env");
}

const cohere = new CohereClientV2({
  token: COHERE_API_KEY,
});

const CHAT_MODEL = "command-a-plus-05-2026";

function buildContext(
  documents: Awaited<ReturnType<typeof retrieveDocuments>>
): string {
  return documents
    .map(
      (document, index) =>
        `SOURCE ${index + 1}
Document: ${document.document_name}
Category: ${document.category}
Similarity: ${document.similarity}

Content:
${document.content}`
    )
    .join("\n\n-----------------------------\n\n");
}

export async function generateAnswer(
  question: string,
  matchCount = 5
): Promise<string> {
  const documents = await retrieveDocuments(
    question,
    matchCount
  );

  if (documents.length === 0) {
    return "I don't have enough information in the TruxUp knowledge base to answer that confidently.";
  }

  const context = buildContext(documents);

  const systemPrompt = `
You are the TruxUp sales and marketing assistant.

Your job is to answer questions about TruxUp using the provided knowledge base.

IMPORTANT RULES:

1. Use the provided knowledge as the primary source of truth.
2. Do not invent TruxUp features, integrations, pricing, guarantees, customers, or capabilities.
3. If the knowledge base does not contain enough information, say that you do not have enough information rather than guessing.
4. Always refer to the product as "TruxUp".
5. Never mention HorizonGO.
6. Never mention embeddings, vector databases, pgvector, RAG, prompts, internal databases, or system architecture to the customer.
7. Keep answers conversational and useful.
8. Since this is a sales assistant, answer the customer's question first and then, when appropriate, ask a short follow-up question to understand their needs.
9. Do not claim that a feature exists unless the provided knowledge supports it.
10. Do not expose the source documents or similarity scores.

KNOWLEDGE BASE:

${context}
`;

  const response = await cohere.chat({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: question,
      },
    ],
  });

  const content = response.message.content;

  if (!content || content.length === 0) {
    throw new Error("Cohere returned an empty response");
  }

  const textContent = content.find(
    (item) => item.type === "text"
  );

  if (!textContent || !("text" in textContent)) {
    throw new Error(
      "Cohere response did not contain text content"
    );
  }

  return textContent.text;
}