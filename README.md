# Number Crunch API

Express API for the debt repayment calculator.

## Local setup

```bash
cp .env.example .env
npm install
npm run dev
```

The server defaults to `http://localhost:3050` with the example configuration.
`CORS_ORIGINS` is a comma-separated browser-origin allowlist. Set `TRUST_PROXY=true`
only when the app is behind one trusted reverse proxy.

## Verification

```bash
npm test
npm audit
```
