# Docker file with Node 18 and Alpine 3.17
FROM node:18-alpine3.17

# Set the working directory
WORKDIR /app

# Copy the source code
COPY . /app

# Copy package.json and package.lock
COPY package.json /app 
COPY package.lock /app

# Update and install ffmpeg
RUN apk update
RUN apk add
RUN apk add ffmpeg

# Install dependencies
RUN npm install \
    && \
    npm run build

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "server"]