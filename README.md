# Gregal Jocs

The games of Gregal (the Arena: CS2, LoL and NFL prompt matches, and the
winds' football league), as a separate app: its own desktop installer, its
own profile (`~/.config/gregal-jocs`, `~/.local/share/gregal-jocs`), its own
port (8197) and its own releases here.

Gregal Jocs reuses Gregal's server. It imports it through `gregal/host`
(the only public door into Gregal), so **the `gregal` repository must be
checked out next to this one**:

```
C:\dev\gregal        (alsolanes/gregal)
C:\dev\gregal-jocs   (this repository)
```

`go.mod` has `replace gregal => ../gregal`.

## Layout

| Folder | What |
|---|---|
| `cmd/gregal-jocs` | The binary: Gregal's CLI and server with the games registered; `--open` opens `/jocs/` |
| `server` | Registers the product (`web.RegisterProduct`) and the games' HTTP API |
| `arena`, `football` | Game rules and engines |
| `web/app` | The `/jocs/` pages (embedded) |
| `desktop` | The Electron app; the installer downloads its backend on first start |
| `deploy` | Docker deployment for a server (see `deploy/GUIDE.md`) |
| `docs/api-contract.md` | The games' HTTP routes |

## Build and test

```
go build -o gregal-jocs ./cmd/gregal-jocs
go test ./...
node --test web/app/*.test.cjs
cd desktop && npm ci && npm test
```

## Release

```
node scripts/release.cjs bump X.Y.Z
git commit -am "Release vX.Y.Z" && git tag -a vX.Y.Z -m "Gregal Jocs vX.Y.Z" && git push --follow-tags
node scripts/release.cjs publish X.Y.Z
```

`publish` builds the backend and the light installer, and publishes them as
the latest release of `alsolanes/gregal-jocs`, with `jocs.yml` (the app's
update channel) and `gregal-jocs-backend.json` (the backend the app
downloads). The notes say which commits of both repositories it was built
from.
