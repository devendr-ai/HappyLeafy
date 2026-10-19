# HappyLeafy API proxy

A Cloudflare Worker that keeps the Pl@ntNet and Gemini keys off people's phones. The app sends
photos and AI requests here; the worker adds the keys, forwards them, and caps daily use per device.

| Route | Forwards to | Default daily cap per device |
| --- | --- | --- |
| `POST /v1/plantnet/identify` | Pl@ntNet `/v2/identify/all` | 20 |
| `POST /v1/plantnet/diseases` | Pl@ntNet `/v2/diseases/identify` | 10 |
| `POST /v1/gemini/:model` | Gemini `generateContent` | 60 |

A shared cap (`LIMIT_PLANTNET_GLOBAL`, default 450) keeps all devices together under Pl@ntNet's
500/day free quota. Caps live in `wrangler.jsonc` → `vars`.

## Deploy (one time)

```bash
cd server
npm install
npx wrangler login                          # opens the browser; approve
npx wrangler kv namespace create USAGE      # copy the printed id into wrangler.jsonc
npx wrangler secret put PLANTNET_KEY        # paste your Pl@ntNet key when asked
npx wrangler secret put GEMINI_KEY          # paste your Gemini key when asked
npx wrangler secret put APP_TOKEN           # any long random string; same value goes in the app's .env
npx wrangler deploy                         # prints https://happyleafy-proxy.<you>.workers.dev
```

Then in the app's root `.env` (git-ignored):

```
EXPO_PUBLIC_PROXY_URL=https://happyleafy-proxy.<you>.workers.dev
EXPO_PUBLIC_APP_TOKEN=<the APP_TOKEN value>
```

Restart Expo (`npx expo start --clear`). Users who enter their own key in Settings bypass the proxy.

## Local test

```bash
printf 'PLANTNET_KEY=dummy\nGEMINI_KEY=dummy\nAPP_TOKEN=test-token\n' > .dev.vars
npx wrangler dev --port 8787
curl localhost:8787/v1/health
```

## Notes

- `APP_TOKEN` ships inside the app, so it is not a real secret; it only stops casual misuse.
  The daily caps are the actual protection. For the App Store, add Apple App Attest.
- Pl@ntNet's free plan and Gemini's free tier are for non-commercial use. Switch to their paid
  plans before charging money (and use Gemini's paid tier for EU/UK/Swiss users).
- Logs: `npx wrangler tail`. Usage counters: the `USAGE` KV namespace (keys expire after 2 days).
