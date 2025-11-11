#FRONTEND BUILDER STAGE 
FROM node:18 AS builder

WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

RUN npm install

# Copy the rest of the frontend code
COPY . .

RUN npm run build

#NGINX STAGE
FROM nginx:latest

# Copy the built React app
COPY --from=builder /app/build /usr/share/nginx/html

# Copy Nginx configuration
COPY /nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
