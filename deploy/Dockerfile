# Gregal Jocs: minimal image (a single static binary). Build context = the
# folder that holds both checkouts (gregal/ and gregal-jocs/, side by side);
# Dockerfile.dockerignore keeps only what the build needs:
#   docker build -f gregal-jocs/deploy/Dockerfile -t gregal-jocs .
ARG GO_VERSION=1.27
FROM golang:${GO_VERSION} AS build
WORKDIR /src
COPY gregal/go.mod gregal/go.sum ./gregal/
COPY gregal-jocs/go.mod gregal-jocs/go.sum ./gregal-jocs/
RUN cd gregal-jocs && go mod download
COPY gregal/internal ./gregal/internal
COPY gregal/host ./gregal/host
COPY gregal-jocs ./gregal-jocs
ARG VERSION=dev
WORKDIR /src/gregal-jocs
RUN CGO_ENABLED=0 go build -trimpath -buildvcs=false \
      -ldflags "-X main.version=${VERSION}" -o /out/gregal-jocs ./cmd/gregal-jocs

FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata wget && \
    adduser -D -u 1000 -h /data gregal && install -d -o gregal -g gregal /data
COPY --from=build /out/gregal-jocs /usr/local/bin/gregal-jocs
COPY gregal-jocs/deploy/entrypoint.sh /usr/local/bin/jocs-entrypoint
USER gregal
# All state (config, models, accounts, matches) lives in /data: it is the volume.
ENV HOME=/data GREGAL_PERSIST_KEYS=1 GREGAL_ACCOUNTS_DIR=/data/accounts
VOLUME /data
EXPOSE 8197
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8197/jocs/ >/dev/null || exit 1
ENTRYPOINT ["jocs-entrypoint"]
