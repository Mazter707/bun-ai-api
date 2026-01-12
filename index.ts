const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  async fetch(req) {
    return new Response("Api de Bun funcionando correctamente!");
  },
});

console.log(`Servidor corriendo en http://localhost:${server.port}`);
