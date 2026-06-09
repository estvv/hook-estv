# hook-estv

HTTP request catcher and webhook debugger - self-hosted alternative to RequestBin/Pipedream.

## Features

- 🎣 Create temporary hooks with random URLs
- 🕐 Auto-delete after 24 hours
- 📊 Real-time WebSocket updates
- 🎨 Syntax highlighting for JSON/XML
- 💾 Export requests to JSON
- 🔄 Replay requests to other URLs
- 📏 Max request size: 1MB
- 🔒 No authentication required

## Architecture

```
Caddy (host) → hook-frontend-estv:80 (nginx + React)
              → hook-backend-estv:8080 (Node + Express + WebSocket)
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/hooks` | Create new hook |
| GET | `/api/hooks/:slug` | Get hook info |
| GET | `/api/hooks/:id/requests` | Get all requests for hook |
| DELETE | `/api/hooks/:slug` | Delete hook |
| ALL | `/hook/:slug/*` | Catch all HTTP requests |
| GET | `/health` | Health check |

## Quick Start

```bash
# Pull changes
make pull

# Start services
make up

# Stop services  
make down

# Rebuild and restart
make update
```

## Configuration

Environment variables (see `.env.example`):

- `PORT=8080` - Backend port
- `MAX_REQUEST_SIZE=1048576` - Max request size (1MB)
- `NODE_ENV=production`

## Hook Lifecycle

1. **Create**: POST `/api/hooks` → returns `{ slug, url }`
2. **Catch**: ALL `/hook/:slug/*` → captures any HTTP request
3. **View**: Open `/hook/:slug` in browser → see real-time requests
4. **Replay**: Forward request to another URL
5. **Expire**: Auto-delete after 24 hours

## Resource Usage

| Service | Memory | CPU |
|---------|--------|-----|
| Backend | <100MB | <0.3 cores |
| Frontend | <10MB | <0.1 cores |
| **Total** | <110MB | <0.4 cores |

## Caddy Configuration

Add to `/etc/caddy/Caddyfile`:

```
hook.estv.fr {
    handle /api/* {
        reverse_proxy hook-backend-estv:8080
    }
    handle {
        reverse_proxy hook-frontend-estv:80
    }
}
```

## License

MIT