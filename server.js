const express = require('express');

const app = express();
app.use(express.json({ limit: '10mb' }));

const TRANDOR_BASE_URL = process.env.TRANDOR_BASE_URL || 'https://api.trandor.com';
const TRANDOR_NWC = process.env.TRANDOR_NWC;
const PORT = process.env.PORT || 8745;

if (!TRANDOR_NWC) {
  console.error('ERROR: TRANDOR_NWC environment variable is required');
  console.error('Set it to your NWC connection string: nostr+walletconnect://...');
  process.exit(1);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', upstream: TRANDOR_BASE_URL });
});

// Forward GET /v1/models (no auth needed)
app.get('/v1/models', async (req, res) => {
  try {
    const response = await fetch(`${TRANDOR_BASE_URL}/v1/models`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(502).json({ error: 'Failed to reach Trandor', details: error.message });
  }
});

// Forward POST /v1/chat/completions with NWC header
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const response = await fetch(`${TRANDOR_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NWC': TRANDOR_NWC,
      },
      body: JSON.stringify(req.body),
    });

    // Forward cost headers
    const costHeaders = ['X-Charged-Sats', 'X-Cost-Sats', 'X-Cost-USD', 'X-Refund-Sats', 'X-Refund-Status'];
    costHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) res.set(header, value);
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(502).json({ error: 'Failed to reach Trandor', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Trandor proxy running on http://localhost:${PORT}`);
  console.log(`Forwarding to: ${TRANDOR_BASE_URL}`);
  console.log(`NWC configured: ${TRANDOR_NWC.substring(0, 30)}...`);
});
