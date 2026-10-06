# Direct Cloudflare Free hosting

Public URL: https://chat.unihelp.workers.dev/

The standalone public deployment does not depend on keeping a computer running or on a ChatGPT subscription. Use Workers **Free** and its included D1 quota. Do not upgrade to Workers Paid or buy a custom domain. Free quotas reject excess usage rather than automatically charging for it.

1. Sign in: `node node_modules/wrangler/bin/wrangler.js login`.
2. Confirm the Cloudflare account is on Workers Free.
3. Build: `node scripts/run-framework.mjs build`.
4. Deploy: `node scripts/deploy-cloudflare.mjs`.

The deploy script reuses or creates `smart-complaint-db`, applies the checked-in migrations, uploads the compiled Worker and static assets, and sends the existing Groq key to Cloudflare through stdin. The public `workers.dev` URL is printed by Wrangler after a successful deployment. Creating the account or completing its sign-in must be done by the owner.

Configuration is separate from Sites at `cloudflare/wrangler.json`. Verified D1 IDs are added after provider creation; never substitute a guessed database ID. The file contains no secrets. The Groq model remains `openai/gpt-oss-120b`; no paid inference provider is added. Model usage remains subject to the Groq account's free-plan limits.

## Server logs

Workers observability is enabled with 100% sampling. In Cloudflare, select Workers & Pages → `chat` → Observability for stored logs, or Logs → Live for a live stream. The Free plan currently retains logs for three days with 200,000 log events per day. Provider policies may change.

Chat logs correlate events by `traceId`, also returned as `X-Request-ID`. They include request path, response status, duration, cached retries, result type, article ID, clarification count, Groq status, token usage, model and error type. They omit message text, cookies and API keys. Request-level Cloudflare metadata is also collected. CLI live logs: `node node_modules/wrangler/bin/wrangler.js tail chat --config cloudflare/wrangler.json --format pretty`.

Cloudflare documentation: https://developers.cloudflare.com/workers/platform/pricing/ and https://developers.cloudflare.com/d1/platform/pricing/.
