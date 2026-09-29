import "dotenv/config";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing from .env");
}

export const checkpointer =
  PostgresSaver.fromConnString(databaseUrl);