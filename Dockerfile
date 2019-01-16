FROM node:carbon as build
WORKDIR /app
COPY src/package*.json ./
COPY src/tsconfig.json ./
RUN npm install
COPY src/ .
RUN npm run build

FROM node:carbon as final
RUN npm install -g serve
COPY --from=build /app/build/ /build/
CMD serve -s build
EXPOSE 5000