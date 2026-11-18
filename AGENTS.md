# AGENTS.md — gregal-jocs

Gregal Jocs: the games, as an app apart from Gregal. Read README.md first.

## Commands

- `go build -o gregal-jocs ./cmd/gregal-jocs` — build (needs `../gregal`)
- `go test ./...` and `node --test web/app/*.test.cjs` — tests (must pass before committing)
- `cd desktop && npm test` — desktop app tests

## Conventions

- Only import Gregal through `gregal/host/...`. If something is missing,
  add an alias in `../gregal/host` (never a copy) and build both repos.
- Reply in the user's chosen language (English by default; Catalan supported).
- Do not commit `config.yaml`, `.env` or binaries.
