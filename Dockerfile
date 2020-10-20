FROM node:latest as build
WORKDIR /app
COPY src/package.json ./
COPY src/yarn.lock ./
COPY src/tsconfig.json ./
RUN yarn install
COPY src/ .
RUN yarn run build

# FROM node:carbon as final
# RUN npm install -g serve
# COPY --from=build /app/build/ /build/
# CMD serve -p 80 -s build
# EXPOSE 80

FROM httpd
COPY --from=build /app/build/ /usr/local/apache2/htdocs/
RUN echo "ServerName localhost" >> /usr/local/apache2/conf/httpd.conf