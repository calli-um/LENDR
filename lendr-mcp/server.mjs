import express from "express";
import cors from "cors";

import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { getListings } from "./tools/getListing.js";
import { searchListings } from "./tools/searchListings.js";
const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());
console.log("Loaded getListings:", typeof getListings);
console.log("Loaded searchListings:", typeof searchListings);

/**
 * =========================
 * TOOL DEFINITIONS
 * =========================
 */
const TOOLS = [
  {
    name: "get_listings",
    description: "Get rental listings",
    inputSchema: {
      type: "object",
      properties: {
        keyword: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "search_listings",
    description: "Search listings",
    inputSchema: {
      type: "object",
      properties: {
        keyword: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
];

/**
 * =========================
 * MCP LOGIC
 * =========================
 */
async function runTool(name, args = {}) {
  console.log("Running tool:", name);
  console.log("Args:", args);

  if (name === "get_listings") {
    const keyword = args.keyword || "";
    const limit = args.limit || 10;

    return keyword
      ? await searchListings(keyword)
      : await getListings(limit);
  }

  if (name === "search_listings") {
    return await searchListings(args.keyword || "");
  }

  throw new Error(`Unknown tool: ${name}`);
}

/**
 * =========================
 * HEALTH
 * =========================
 */
app.get("/health", (_, res) => {
  res.json({ ok: true });
});

/**
 * =========================
 * MCP ENDPOINT
 * =========================
 */
app.post("/mcp", async (req, res) => {
  try {
    const { method, params } = req.body;

    console.log("[MCP CALL]");
    console.log("Method:", method);
    console.log("Params:", params);

    if (method === "tools/list") {
      return res.json({ tools: TOOLS });
    }

    if (method === "tools/call") {
      const name = params?.name;
      const args = params?.arguments ?? {};

      const result = await runTool(name, args);

      return res.json({
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      });
    }

    return res.status(400).json({
      error: "Invalid method",
      details: method,
    });
  } catch (err) {
    console.error("\n========== FULL MCP ERROR ==========");
    console.error(err);
    console.error("Stack:");
    console.error(err?.stack);
    console.error("====================================\n");

    return res.status(500).json({
      error: "MCP error",
      details: err?.message || String(err),
    });
  }
});

/**
 * =========================
 * ENV DEBUG
 * =========================
 */
function envSummary() {
  const required = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const present = required
    .filter((k) => process.env[k])
    .sort();

  console.log("[lendr-mcp] Env present:", present);
}

envSummary();

/**
 * =========================
 * START SERVER
 * =========================
 */
app.listen(PORT, () => {
  console.log(`🚀 LENDR MCP running on http://localhost:${PORT}`);
});