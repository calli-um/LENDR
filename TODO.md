# TODO

## Implement deployable MCP server (Supabase + HTTP) for Next.js UI

- [ ] Fix/verify `lendr-mcp/server.mjs` tool wiring (correct helper imports + schemas)
- [ ] Implement MCP HTTP transport inside `lendr-mcp/server.mjs` (express)
- [ ] Add/implement MCP HTTP endpoints for `tools/list` and `tools/call`
- [ ] Ensure server binds to `process.env.PORT` and uses CORS
- [ ] Add Next.js route `app/api/mcp/route.ts` that forwards requests to the MCP HTTP server
- [ ] Update `lendr-mcp/package.json` start script
- [ ] Smoke-test with curl for tools list/call
- [ ] Verify Next.js `LendrMcpChat` works end-to-end
- [ ] Add deployment notes for Railway/Render env vars

