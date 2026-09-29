import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export type DocumentChunk = {
  documentName: string;
  category: string;
  chunkIndex: number;
  content: string;
  metadata: {
    source: string;
    category: string;
    chunkIndex: number;
  };
};

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 3000,
  chunkOverlap: 400,
});

export async function splitDocuments(
  documents: {
    documentName: string;
    category: string;
    content: string;
    filePath: string;
  }[]
): Promise<DocumentChunk[]> {
  const chunks: DocumentChunk[] = [];

  for (const document of documents) {
    const splitContent = await splitter.splitText(document.content);

    splitContent.forEach((content, index) => {
      chunks.push({
        documentName: document.documentName,
        category: document.category,
        chunkIndex: index,
        content,
        metadata: {
          source: document.filePath,
          category: document.category,
          chunkIndex: index,
        },
      });
    });
  }

  return chunks;
}