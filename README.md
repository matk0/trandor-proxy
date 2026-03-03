# Trandor Proxy

A lightweight proxy that lets any OpenAI-compatible client use [Trandor](https://www.trandor.com) - pay for AI with Bitcoin Lightning.

## What is this?

Trandor is an AI API gateway that accepts Bitcoin Lightning payments via NWC (Nostr Wallet Connect). This proxy handles the NWC authentication so you can use Trandor with any tool that supports the OpenAI API format.

```
Your App → trandor-proxy → Trandor → AI Providers
              (adds NWC)     (handles payment)
```

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/matk0/trandor-proxy
cd trandor-proxy
npm install
```

### 2. Set your NWC connection string

Get an NWC connection string from your Lightning wallet ([Alby](https://getalby.com), [Mutiny](https://mutinywallet.com), etc.):

```bash
export TRANDOR_NWC="nostr+walletconnect://..."
```

### 3. Start the proxy

```bash
npm start
```

That's it! The proxy is now running at `http://localhost:8745`.

## Usage

### With any OpenAI client

```bash
export OPENAI_BASE_URL=http://localhost:8745/v1
export OPENAI_API_KEY=unused
```

### With curl

```bash
curl -X POST http://localhost:8745/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### With Python

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8745/v1",
    api_key="unused"
)

response = client.chat.completions.create(
    model="gpt-4.1",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TRANDOR_NWC` | Yes | - | Your NWC connection string |
| `TRANDOR_BASE_URL` | No | `https://api.trandor.com` | Trandor API URL |
| `PORT` | No | `8745` | Proxy port |

## Cost Headers

Every response includes these headers showing what you paid:

- `X-Charged-Sats` - Initial charge (2x estimate)
- `X-Cost-Sats` - Actual cost
- `X-Refund-Sats` - Amount refunded
- `X-Cost-USD` - Cost in USD

## Security

Your NWC connection string is a spending key. Keep it secret:

- Don't commit `.env` to git
- Run the proxy locally, not on public servers
- Use a wallet with limited balance for safety

## License

MIT
