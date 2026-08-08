# syntax=docker/dockerfile:1.7
#
# kd7swh.com — reproducible Eleventy toolchain
#
# Targets:
#   dev       long-running dev server with live reload (compose service "dev")
#   build     one-shot production build, output in /site/_site
#   artifact  scratch image containing only _site, for `--output type=local`
#
# PIN THE BASE IMAGE before you rely on this for reproducibility. A moving tag
# is not reproducible. Get the current digest with:
#
#   docker buildx imagetools inspect node:22-bookworm-slim
#
# then set NODE_IMAGE below to node:22-bookworm-slim@sha256:<digest>.
# Dependabot can keep a pinned digest current once it is pinned.

ARG NODE_IMAGE=node:22-bookworm-slim

# --------------------------------------------------------------------- base
FROM ${NODE_IMAGE} AS base
WORKDIR /site
ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# --------------------------------------------------------------------- deps
# Separate stage so dependency installs cache independently of site content.
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ---------------------------------------------------------------------- dev
# Interactive stage. Also used by the publish and build compose services so
# there is exactly one image to keep current.
FROM base AS dev
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates \
      git \
      w3m \
 && rm -rf /var/lib/apt/lists/*

COPY --from=deps /site/node_modules /site/node_modules
RUN chown -R node:node /site

USER node

# git inside a container on a Windows bind mount otherwise trips
# "detected dubious ownership". Git itself is expected to run on Windows;
# this is only so in-container git commands don't fail confusingly.
RUN git config --global --add safe.directory /site

# inotify events do not cross the Windows bind mount into the Linux VM,
# so the file watcher has to poll or live reload silently never fires.
ENV CHOKIDAR_USEPOLLING=1 \
    CHOKIDAR_INTERVAL=400 \
    NODE_ENV=development

EXPOSE 8080
CMD ["npx", "@11ty/eleventy", "--serve", "--incremental", "--port=8080"]

# -------------------------------------------------------------------- build
# Hermetic production build. No bind mounts, no host state.
FROM base AS build
ENV NODE_ENV=production
COPY --from=deps /site/node_modules /site/node_modules
COPY . .
RUN npx @11ty/eleventy

# ----------------------------------------------------------------- artifact
# Nothing but the built site. Extract with:
#   docker build --target artifact --output type=local,dest=./_site .
FROM scratch AS artifact
COPY --from=build /site/_site /
