# Trandor Proxy Skill

## Purpose

Use this skill when you need to make AI API calls through Trandor but your framework only supports standard OpenAI configuration (base URL + API key).

## What This Proxy Does

The proxy sits between your OpenAI-compatible client and Trandor:

```
Your Agent (OpenAI client)
         |
         v
   trandor-proxy (localhost:8745)
   - Adds X-NWC header with your wallet credentials
   - Forwards request to Trandor
   - Returns response with cost headers
         |
         v
   Trandor API (api.trandor.com)
   - Charges your wallet via NWC
   - Calls AI provider
   - Refunds overpayment
```

## When to Use

- Your framework requires `OPENAI_BASE_URL` + `OPENAI_API_KEY` format
- You want to use Trandor without modifying your existing OpenAI integration
- You need a local endpoint that handles NWC authentication

## Setup Instructions

### 1. Get the proxy

```bash
git clone https://github.com/yourusername/trandor-proxy
cd trandor-proxy
npm install
```

### 2. Configure your NWC connection

Get an NWC connection string from your Lightning wallet (Alby, Mutiny, etc.) and set it:

```bash
export TRANDOR_NWC="nostr+walletconnect://..."
```

### 3. Start the proxy

```bash
npm start
```

The proxy runs on `http://localhost:8745` by default.

### 4. Configure your OpenAI client

Point your client to the proxy:

```bash
export OPENAI_BASE_URL=http://localhost:8745/v1
export OPENAI_API_KEY=unused  # Required by most clients but ignored by proxy
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TRANDOR_NWC` | Yes | - | Your NWC connection string |
| `TRANDOR_BASE_URL` | No | `https://api.trandor.com` | Trandor API URL |
| `PORT` | No | `8745` | Port for the proxy |

## Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/v1/models` | GET | List available models |
| `/v1/chat/completions` | POST | Chat completion (adds NWC auth) |

## Response Headers

The proxy forwards these headers from Trandor:

- `X-Charged-Sats` - Amount charged upfront
- `X-Cost-Sats` - Actual cost in satoshis
- `X-Cost-USD` - Actual cost in USD
- `X-Refund-Sats` - Amount refunded
- `X-Refund-Status` - Refund status (success/failed/none)

## Security Notes

- The NWC connection string is a **spending key** - treat it like a password
- Run the proxy locally, not on a public server
- The proxy only needs to be running when making API calls

## Example Usage

```bash
# Test the proxy is working
curl http://localhost:8745/health

# List models
curl http://localhost:8745/v1/models

# Chat completion
curl -X POST http://localhost:8745/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```
