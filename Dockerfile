# syntax=docker/dockerfile:1
FROM node:25-alpine AS build
WORKDIR /app
COPY . .
RUN corepack enable && pnpm -v || npm -v &&     npm ci || npm i &&     npm run build


FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

