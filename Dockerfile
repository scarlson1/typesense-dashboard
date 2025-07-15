FROM node:alpine

ARG VITE_APP_VERSION
ENV VITE_APP_VERSION ${VITE_APP_VERSION}

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]