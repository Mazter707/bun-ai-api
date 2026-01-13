FROM oven/bun:1.1

WORKDIR /app

COPY bun.lockb package.json ./
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "start"]
