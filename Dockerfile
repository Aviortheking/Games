# This Dockerfile allows you to run NextJS in server mode

#########
# Build #
#########
FROM docker.io/node:alpine as BUILD_IMAGE

# inform software to be in production
ENV NEXT_TELEMETRY_DISABLED=1

# External deps (for node-gyp add: "python3 make g++")
# git is used to install the npm packages with git deps
RUN apk add --no-cache git

# run as non root user
USER node

# go to user repository
WORKDIR /home/node

RUN printenv

# Add package json
ADD --chown=node:node package.json package-lock.json ./

# install dependencies from package lock
RUN npm ci

# Add project files
ADD --chown=node:node . .

# build
RUN npm run build

##############
# Production #
##############
FROM docker.io/node:alpine as PROD_IMAGE

# inform software to be in production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# run as non root user
USER node

# go to work folder
WORKDIR /home/node

# copy from build image
COPY --chown=node:node --from=BUILD_IMAGE /home/node/node_modules ./node_modules
COPY --chown=node:node --from=BUILD_IMAGE /home/node/.next ./.next
COPY --chown=node:node --from=BUILD_IMAGE /home/node/package.json /home/node/next.config.js /home/node/.env* ./
COPY --chown=node:node --from=BUILD_IMAGE /home/node/public ./public

# Expose port
EXPOSE 3000

# run it !
CMD ["npm", "run", "start"]
