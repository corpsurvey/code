FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=https://code-production-1e3b.up.railway.app

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]