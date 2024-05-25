# Docker file with Node 18 and Alpine 3.17
FROM node:18-alpine3.17

# Set the working directory
WORKDIR /app

# Copy the source code
COPY . /app

# Copy package.json and yarn.lock
COPY package.json /app 
COPY yarn.lock /app

# Update and install ffmpeg
RUN apk update
RUN apk add
RUN apk add ffmpeg

# Install dependencies
RUN yarn \
    && \
    yarn build \
    && \
    yarn cache clean

# Expose the port
EXPOSE 3000

# Start the app
CMD ["yarn", "server"]