FROM node:alpine

ARG VITE_APP_VERSION
ENV VITE_APP_VERSION ${VITE_APP_VERSION}

RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev", "--", "--host"]