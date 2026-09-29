
import "dotenv/config";

import express from "express";
import cors from "cors";
import { z } from "zod";

import { truxupGraph } from "../graph/graph";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

// ========================================
// Middleware
// ========================================

app.use(cors());

app.use(
  express.json({
    limit: "1mb",
  })
);

// ========================================
// Request validation
// ========================================

const chatRequestSchema = z.object({
  threadId: z
    .string()
    .trim()
    .min(1, "threadId is required"),

  message: z
    .string()
    .trim()
    .min(1, "message is required")
    .max(10000, "message is too long"),
});

// ========================================
// Health check
// ========================================

app.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "truxup-ai-agent",
  });
});

// ========================================
// Chat API
// ========================================

app.post("/api/chat", async (req, res) => {
  const requestStartedAt = Date.now();

  try {
    // ========================================
    // Validate request
    // ========================================

    const parsed =
      chatRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      console.warn(
        "Invalid API request:",
        parsed.error.issues
      );

      return res.status(400).json({
        success: false,
        error: "Invalid request",
        details: parsed.error.issues.map(
          (issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })
        ),
      });
    }

    const {
      threadId,
      message,
    } = parsed.data;

    // ========================================
    // Request logging
    // ========================================

    console.log(
      "\n========================================"
    );

    console.log(
      "TRUXUP API REQUEST"
    );

    console.log(
      "========================================"
    );

    console.log(
      "Thread ID:",
      threadId
    );

    console.log(
      "Message:",
      message
    );

    // ========================================
    // Run LangGraph
    // ========================================

    const result =
      await truxupGraph.invoke(
        {
          userMessage: message,
          threadId,
        },
        {
          configurable: {
            thread_id: threadId,
          },
        }
      );

    // ========================================
    // Validate LangGraph result
    // ========================================

    if (!result) {
      throw new Error(
        "LangGraph returned an empty result"
      );
    }

    if (
      typeof result.response !== "string" ||
      result.response.trim().length === 0
    ) {
      throw new Error(
        "LangGraph returned an empty response"
      );
    }

    if (!result.lead) {
      throw new Error(
        "LangGraph returned no lead profile"
      );
    }

    // ========================================
    // Response logging
    // ========================================

    console.log(
      "\nTRUXUP API RESPONSE:"
    );

    console.log(
      result.response
    );

    console.log(
      "\nLEAD:"
    );

    console.log(
      JSON.stringify(
        result.lead,
        null,
        2
      )
    );

    console.log(
      "\nREQUEST DURATION:",
      `${Date.now() - requestStartedAt}ms`
    );

    // ========================================
    // Successful response
    // ========================================

    return res.status(200).json({
      success: true,
      threadId,
      response: result.response,
      lead: result.lead,
    });

  } catch (error) {

    // ========================================
    // Handle client disconnect
    // ========================================

    if (res.headersSent) {
      console.error(
        "Response headers already sent."
      );

      return;
    }

    // ========================================
    // Log complete server-side error
    // ========================================

    console.error(
      "\n========================================"
    );

    console.error(
      "TRUXUP API ERROR"
    );

    console.error(
      "========================================"
    );

    console.error(
      "Error:",
      error
    );

    console.error(
      "Duration:",
      `${Date.now() - requestStartedAt}ms`
    );

    // ========================================
    // Safe client response
    // ========================================

    return res.status(500).json({
      success: false,
      error: "Failed to process the message",
    });
  }
});

// ========================================
// JSON parsing error handler
// ========================================

app.use(
  (
    error: any,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {

    if (
      error instanceof SyntaxError &&
      "body" in error
    ) {
      console.warn(
        "Invalid JSON request body."
      );

      return res.status(400).json({
        success: false,
        error: "Invalid JSON request body",
      });
    }

    next(error);
  }
);

// ========================================
// 404 handler
// ========================================

app.use(
  (
    _req,
    res
  ) => {
    return res.status(404).json({
      success: false,
      error: "Route not found",
    });
  }
);

// ========================================
// Global Express error handler
// ========================================

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {

    console.error(
      "\nUNHANDLED EXPRESS ERROR:"
    );

    console.error(error);

    if (res.headersSent) {
      return;
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
);

// ========================================
// Start server
// ========================================

const server = app.listen(
  PORT,
  () => {

    console.log(
      "\n========================================"
    );

    console.log(
      "TRUXUP AI API"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Server running on http://localhost:${PORT}`
    );

    console.log(
      `Health: http://localhost:${PORT}/health`
    );

    console.log(
      `Chat:   http://localhost:${PORT}/api/chat`
    );
  }
);

// ========================================
// Server startup error
// ========================================

server.on(
  "error",
  (error: NodeJS.ErrnoException) => {

    console.error(
      "\n========================================"
    );

    console.error(
      "TRUXUP API SERVER ERROR"
    );

    console.error(
      "========================================"
    );

    if (error.code === "EADDRINUSE") {

      console.error(
        `Port ${PORT} is already in use.`
      );

      console.error(
        "Stop the existing server or choose another PORT."
      );

    } else {

      console.error(
        error
      );
    }

    process.exit(1);
  }
);

// ========================================
// Graceful shutdown
// ========================================

let isShuttingDown = false;

function shutdown(
  signal: string
) {

  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(
    `\n${signal} received.`
  );

  console.log(
    "Shutting down TruxUp API..."
  );

  server.close(
    (error) => {

      if (error) {

        console.error(
          "Error while closing server:"
        );

        console.error(
          error
        );

        process.exit(1);
      }

      console.log(
        "HTTP server closed."
      );

      process.exit(0);
    }
  );
}

process.on(
  "SIGINT",
  () => shutdown("SIGINT")
);

process.on(
  "SIGTERM",
  () => shutdown("SIGTERM")
);

// ========================================
// Process-level exception handling
// ========================================

process.on(
  "uncaughtException",
  (error) => {

    console.error(
      "\nUNCAUGHT EXCEPTION:"
    );

    console.error(
      error
    );

    shutdown(
      "uncaughtException"
    );
  }
);

process.on(
  "unhandledRejection",
  (reason) => {

    console.error(
      "\nUNHANDLED PROMISE REJECTION:"
    );

    console.error(
      reason
    );

    shutdown(
      "unhandledRejection"
    );
  }
);

