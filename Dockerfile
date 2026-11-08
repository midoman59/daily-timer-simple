# Image de production : build Angular puis service par nginx.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG BASE_HREF=/
RUN npx ng build --configuration production --base-href "${BASE_HREF}"

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/daily-timer-simple/browser /usr/share/nginx/html
EXPOSE 80
