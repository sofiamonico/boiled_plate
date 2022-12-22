FROM node:18-alpine
#  Navigate to the container working directory 
WORKDIR /app
#  Copy package.json
COPY package*.json ./

RUN npm install
COPY . .
CMD [ "npm", "run", "start:dev"]
EXPOSE 3000