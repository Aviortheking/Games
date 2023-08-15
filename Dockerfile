# This Dockerfile allows you to run AstroJS in server mode

#########
# Build #
#########
FROM docker.io/node:20-alpine as BUILD_IMAGE

# run as non root user
USER node

# go to user repository
WORKDIR /home/node

# Add package json
ADD --chown=node:node package.json package-lock.json ./

# install dependencies from package lock
RUN npm ci

# Add project files
ADD --chown=node:node . .

# build
RUN npm run build

# remove dev deps
RUN npm prune --omit=dev

##############
# Production #
##############
FROM docker.io/node:20-alpine as PROD_IMAGE

# inform software to be in production
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# run as non root user
USER node

# go to work folder
WORKDIR /home/node

# copy from build image
COPY --chown=node:node --from=BUILD_IMAGE /home/node/node_modules ./node_modules
COPY --chown=node:node --from=BUILD_IMAGE /home/node/dist ./dist
COPY --chown=node:node --from=BUILD_IMAGE /home/node/package.json /home/node/.env* ./

# Expose port
EXPOSE 3000

# run it !
CMD ["npm", "run", "start"]
