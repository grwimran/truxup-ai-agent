import { retrieveDocuments } from "../../rag/retriever";
import { GraphStateType } from "../state";

export async function ragNode(
  state: GraphStateType
) {
  const documents = await retrieveDocuments(
    state.userMessage,
    5
  );

  const context = documents
    .map((doc, index) => {
      return `
SOURCE ${index + 1}

Document: ${doc.document_name}
Category: ${doc.category}
Similarity: ${doc.similarity.toFixed(4)}

CONTENT:
${doc.content}
`;
    })
    .join("\n------------------------------\n");

  return {
    context,
  };
}