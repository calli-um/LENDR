import { NextResponse } from "next/server";

type McpToolRequest = {
  name: string;
  arguments?: Record<string, unknown>;
};

export async function POST(req: Request) {
  const body = (await req.json()) as McpToolRequest;

  const mcpBaseUrl = process.env.MCP_HTTP_BASE_URL;
  if (!mcpBaseUrl) {
    return NextResponse.json(
      { error: "Missing MCP_HTTP_BASE_URL" },
      { status: 500 }
    );
  }

  // MCP-over-HTTP contract implemented by lendr-mcp/server.mjs
  const url = `${mcpBaseUrl.replace(/\/$/, "")}/mcp`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "tools/call",
      params: {
        name: body.name,
        arguments: body.arguments ?? {},
      },
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(data ?? { error: "MCP call failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}

