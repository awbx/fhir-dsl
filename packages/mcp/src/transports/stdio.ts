import type { Dispatcher, McpRequest, McpResponse, Transport } from "../types.js";

// Phase 8.1 — minimal stdio transport implementing the MCP framing
// (newline-delimited JSON over stdin/stdout). Sufficient for `claude`
// and other CLI MCP clients to handshake against a server. Streamable
// HTTP transport is a follow-up sub-phase.

export interface StdioTransportOptions {
  /** Read stream (defaults to process.stdin). */
  input?: NodeJS.ReadableStream;
  /** Write stream (defaults to process.stdout). */
  output?: NodeJS.WritableStream;
}

export function stdioTransport(options: StdioTransportOptions = {}): Transport {
  return {
    async start(dispatcher: Dispatcher) {
      const input = options.input ?? process.stdin;
      const output = options.output ?? process.stdout;

      let buffer = "";
      const stream = input as NodeJS.ReadableStream & { setEncoding?: (enc: string) => void };
      stream.setEncoding?.("utf-8");

      stream.on("data", (chunk: string | Buffer) => {
        buffer += typeof chunk === "string" ? chunk : chunk.toString("utf-8");
        let newline = buffer.indexOf("\n");
        while (newline !== -1) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (line.length > 0) handleLine(line, dispatcher, output);
          newline = buffer.indexOf("\n");
        }
      });

      // Idle indefinitely; the host process kills us on shutdown.
      await new Promise<void>(() => {});
    },
  };
}

async function handleLine(line: string, dispatcher: Dispatcher, output: NodeJS.WritableStream): Promise<void> {
  let request: McpRequest;
  try {
    request = JSON.parse(line) as McpRequest;
  } catch {
    write(output, {
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error: invalid JSON" },
    });
    return;
  }
  if (request.jsonrpc !== "2.0" || typeof request.method !== "string") {
    write(output, {
      jsonrpc: "2.0",
      id: request.id ?? null,
      error: { code: -32600, message: "Invalid request" },
    });
    return;
  }
  const response = await dispatcher.handleRequest(request);
  write(output, response);
}

function write(output: NodeJS.WritableStream, response: McpResponse): void {
  output.write(`${JSON.stringify(response)}\n`);
}
