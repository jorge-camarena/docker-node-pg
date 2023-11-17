FROM node:18
WORKDIR /app
COPY . /app
RUN npm install 
COPY . .
EXPOSE 8080
CMD ["node", "app.js"]
