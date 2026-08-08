# syntax=docker/dockerfile:1.7
#
# kd7swh.com — reproducible Eleventy toolchain
#
# Targets:
#   dev       long-running dev server with live reload (compose service "dev")
#   build     one-shot production build, output in /site/_site
#   artifact  scratch image containing only _site, for `--output type=local`
#
# Base image is digest-pinned for reproducibility (digest read from
# `docker buildx imagetools inspect node:22-bookworm-slim` on 2026-08-08;
# this is the multi-arch index digest). Dependabot keeps it current.
# To refresh manually, rerun the inspect command and update the digest.

ARG NODE_IMAGE=node:22-bookworm-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436

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

# The repo arrives as a bind mount owned by a different uid, which trips
# git's "detected dubious ownership" check; this keeps in-container git
# commands from failing confusingly.
RUN git config --global --add safe.directory /site

# On hosts where file-change events don't cross the bind mount, the
# watcher has to poll or live reload silently never fires.
# TZ matters: on a Pacific Monday evening the UTC date is already Tuesday,
# and "which Monday is this?" must not land a week ahead.
ENV CHOKIDAR_USEPOLLING=1 \
    CHOKIDAR_INTERVAL=400 \
    NODE_ENV=development \
    TZ=America/Los_Angeles

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
