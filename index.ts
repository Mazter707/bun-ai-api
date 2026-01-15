import { cerebrasService } from './services/cerebras';
import { groqService } from './services/groq';
import type { AIService, ChatMessage } from './types';

const services: AIService[] = [
    groqService,
    cerebrasService,
];
let currentServiceIndex = 0;

function getNextService(){
    const service = services[currentServiceIndex];
    currentServiceIndex = (currentServiceIndex + 1) % services.length;
    return service;
}


const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    if (req.method === 'POST' && pathname === '/chat') {
        const requestId = crypto.randomUUID(); // 🔑 ID único
        const start = performance.now();       // ⏱ inicio
        
        const { messages } = await req.json() as { messages: ChatMessage[] };
        const service = getNextService();

        console.log(`[${requestId}] Using service: ${service?.name}`);

        const stream = await service?.chat(messages);

        const end = performance.now();         // ⏱ fin
        console.log(
          `[${requestId}] ${service?.name} took ${(end - start).toFixed(2)} ms`
        );

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
