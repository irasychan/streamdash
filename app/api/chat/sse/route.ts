import { connectionManager } from "@/services/chat/ConnectionManager";
import type { SSEClient, SSEEvent } from "@/features/chat/types/chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const clientId = `sse-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const stream = new ReadableStream({
    start(controller) {
      const client: SSEClient = {
        id: clientId,
        send: (event: SSEEvent) => {
          try {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            // Controller might be closed or the SSE connection may be invalid
            console.error(
              "Error sending SSE event for client",
              clientId,
              "event:",
              event,
              "error:",
              error,
            );
          }
        },
        close: () => {
          try {
            controller.close();
          } catch (error) {
            // Stream controller may already be closed
            console.error(
              "Error closing SSE stream for client",
              clientId,
              "error:",
              error,
            );
          }
        },
      };

      // Register client with connection manager
      connectionManager.addSSEClient(client);

      // Send initial keepalive
      const keepalive = `data: ${JSON.stringify({ type: "keepalive", clientId })}\n\n`;
      controller.enqueue(encoder.encode(keepalive));

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        connectionManager.removeSSEClient(clientId);
      });
    },
    cancel() {
      connectionManager.removeSSEClient(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
