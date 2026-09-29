import {
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";

import {
  GraphState,
} from "./state";

import {
  qualificationNode,
} from "./nodes/qualification-node";

import {
  intentNode,
} from "./nodes/intent-node";

import {
  ragNode,
} from "./nodes/rag-node";

import {
  responseNode,
} from "./nodes/response-node";

import {
  demoNode,
} from "./nodes/demo-node";

import {
  saveLeadNode,
} from "./nodes/save-lead-node";

import {
  addUserMessageNode,
  addAssistantMessageNode,
} from "./nodes/message-node";

import {
  validateResponseNode,
} from "./nodes/validate-response-node";

import {
  regenerateResponseNode,
} from "./nodes/regenerate-response-node";

import {
  routeByIntent,
} from "./routing";

import {
  routeAfterValidation,
} from "./response-routing";

import {
  checkpointer,
} from "../memory/checkpointer";


const graph =
  new StateGraph(GraphState)

    .addNode(
      "addUserMessage",
      addUserMessageNode
    )

    .addNode(
      "qualification",
      qualificationNode
    )

    .addNode(
      "detectIntent",
      intentNode
    )

    .addNode(
      "retrieveKnowledge",
      ragNode
    )

    .addNode(
      "demo",
      demoNode
    )

    .addNode(
      "saveLead",
      saveLeadNode
    )

    .addNode(
      "generateResponse",
      responseNode
    )

    .addNode(
      "validateResponse",
      validateResponseNode
    )

    .addNode(
      "regenerateResponse",
      regenerateResponseNode
    )

    .addNode(
      "addAssistantMessage",
      addAssistantMessageNode
    )

    // START
    .addEdge(
      START,
      "addUserMessage"
    )

    // User message → qualification
    .addEdge(
      "addUserMessage",
      "qualification"
    )

    // Qualification → intent
    .addEdge(
      "qualification",
      "detectIntent"
    )

    // Intent routing
    .addConditionalEdges(
      "detectIntent",
      routeByIntent
    )

    // Product question → RAG
    .addEdge(
      "retrieveKnowledge",
      "saveLead"
    )

    // Demo request → demo
    .addEdge(
      "demo",
      "saveLead"
    )

    // Save lead → response
    .addEdge(
      "saveLead",
      "generateResponse"
    )

    // Response → validator
    .addEdge(
      "generateResponse",
      "validateResponse"
    )

    // Validator routing
    .addConditionalEdges(
      "validateResponse",
      routeAfterValidation
    )

    // Regenerate → validate again
    .addEdge(
      "regenerateResponse",
      "validateResponse"
    )

    // Final response
    .addEdge(
      "addAssistantMessage",
      END
    );


export const truxupGraph =
  graph.compile({
    checkpointer,
  });