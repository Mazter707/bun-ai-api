import { cerebrasService } from './services/cerebras';
import { groqService } from './services/groq';
import type { AIService, ChatMessage } from './types';

const services: AIService[] = [
    groqService,
    cerebrasService,
];
let currentServiceIndex = 0;

function getNextService() {
    const service = services[currentServiceIndex];
    currentServiceIndex = (currentServiceIndex + 1) % services.length;
    return service;
}

const server = Bun.serve({
    port: process.env.PORT ?? 3000,
    hostname: "0.0.0.0", // 🔹 necesario para Traefik/Coolify
    async fetch(req) {
        const { pathname } = new URL(req.url);

        if (req.method === 'POST' && pathname === '/chat') {
            const start = performance.now();
            const requestId = crypto.randomUUID();

            // 🔹 parseamos JSON sin tipado forzado, evitando warning
            let messages: ChatMessage[] | undefined;
            try {
                const body: any = await req.json(); // body puede ser cualquier cosa
                messages = Array.isArray(body?.messages) ? body.messages : undefined;
            } catch (err) {
                messages = undefined;
            }

            if (!messages) {
                console.log(`[${requestId}] Error: no se recibieron mensajes`);
                return new Response("Bad Request: messages missing or invalid", { status: 400 });
            }

            console.log(`[${requestId}] Recibida petición con ${messages.length} mensajes`);

            const service = getNextService();
            const stream = await service?.chat(messages);

            const end = performance.now();
            console.log(`[${requestId}] Servicio usado: ${service?.name}, tiempo: ${(end - start).toFixed(2)}ms`);

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        }

        return new Response("Not found", { status: 404 });
    }
});

console.log(`Servidor corriendo en ${server.url}`);
