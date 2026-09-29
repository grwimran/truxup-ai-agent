import fs from "node:fs/promises";
import path from "node:path";

export type KnowledgeDocument = {
  documentName: string;
  category: string;
  content: string;
  filePath: string;
};

async function findMarkdownFiles(
  directory: string
): Promise<string[]> {
  const entries = await fs.readdir(directory, {
    withFileTypes: true,
  });

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles = await findMarkdownFiles(fullPath);
      files.push(...nestedFiles);
    } else if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith(".md")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function loadKnowledgeDocuments(): Promise<
  KnowledgeDocument[]
> {
  const knowledgeDirectory = path.resolve(
    process.cwd(),
    "knowledge"
  );

  const markdownFiles = await findMarkdownFiles(
    knowledgeDirectory
  );

  const documents: KnowledgeDocument[] = [];

  for (const filePath of markdownFiles) {
    const content = await fs.readFile(filePath, "utf-8");

    const relativePath = path.relative(
      knowledgeDirectory,
      filePath
    );

    const parts = relativePath.split(path.sep);

    const category =
      parts.length > 1 ? parts[0] : "general";

    documents.push({
      documentName: path.basename(filePath),
      category,
      content,
      filePath,
    });
  }

  return documents;
}