import express from "express";
import cors from "cors";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";

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

/**
 * =========================
 * MCP SERVER
 * =========================
 */
const server = new Server(
  {
    name: "lendr-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * =========================
 * LIST TOOLS (FIXED)
 * =========================
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
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
    ],
  };
});

/**
 * =========================
 * CALL TOOL (FIXED)
 * =========================
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_listings") {
      const keyword = args?.keyword || "";
      const limit = args?.limit || 10;

      const result = keyword
        ? await searchListings(keyword)
        : await getListings(limit);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    }

    if (name === "search_listings") {
      const result = await searchListings(args?.keyword || "");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: "Unknown tool" }),
        },
      ],
    };
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: "Tool execution failed",
            details: String(err),
          }),
        },
      ],
    };
  }
});

/**
 * =========================
 * HTTP WRAPPER (FOR NEXT.JS)
 * =========================
 */
app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.post("/mcp", async (req, res) => {
  try {
    const { method, params } = req.body;
    console.log("/mcp called", { method, params });


    // The MCP SDK Server instance is transport-dependent.
    // Calling `server.request()` without an active MCP transport/connection
    // causes: "Error: Not connected".
    //
    // Since this server already has request handlers registered for
    // ListToolsRequestSchema and CallToolRequestSchema, route the HTTP payload
    // directly to those handlers.

    if (method === "tools/list") {
      // Bypass MCP SDK request pipeline.
      // Return the same tool definitions we register via setRequestHandler().
      return res.json({
        tools: [
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
        ],
      });
    }



    if (method === "tools/call") {
      const name = params?.name;
      const args = params?.arguments ?? {};

      // Bypass MCP SDK request pipeline.
      if (name === "get_listings") {
        const keyword = args?.keyword || "";
        const limit = args?.limit ?? 10;
        const result = keyword ? await searchListings(keyword) : await getListings(limit);
        return res.json({ content: [{ type: "text", text: JSON.stringify(result) }] });
      }

      if (name === "search_listings") {
        const result = await searchListings(args?.keyword || "");
        return res.json({ content: [{ type: "text", text: JSON.stringify(result) }] });
      }

      return res.json({ content: [{ type: "text", text: JSON.stringify({ error: "Unknown tool" }) }] });
    }


    return res.status(400).json({
      error: "Invalid method",
      details: `Unsupported method: ${method}`,
    });
  } catch (err) {
    return res.status(500).json({
      error: "MCP error",
      details: String(err),
    });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 LENDR MCP running on http://localhost:${PORT}`);
});