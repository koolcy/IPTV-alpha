FROM node:22-alpine

WORKDIR /app/worker

COPY worker/package*.json ./
RUN npm install

COPY worker/ ./

EXPOSE 8787

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8787"]
