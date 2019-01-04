# client

FROM node:latest as client

WORKDIR /usr/src/app/client
COPY client/package*.json ./
RUN npm install -qy
COPY client/ ./
RUN npm run build

# server

FROM node:latest

WORKDIR /usr/src/app/
COPY --from=client /usr/src/app/client/build/ ./client/build/

WORKDIR /usr/src/app/server
COPY server/package*.json ./
RUN npm install -qy

EXPOSE 8000

CMD ["npm", "start"]