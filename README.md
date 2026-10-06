# Smart Complaint System · نظام الشكاوى الذكي

A student project for Umm Al-Qura University, Group 5.

The interface contains only support chat, responses, a new-conversation button, and **Save conversation**, which downloads a UTF-8 text file. The displayed chat is temporary; keep a download before reloading or closing it. No screenshots or attachments can be uploaded.

## AI and retrieval

Groq remains the only remote AI provider, using `openai/gpt-oss-120b`. No paid embedding service or OpenAI API account is needed. Local character TF-IDF search retrieves candidates; Groq interprets the request and selects a matching stored solution or asks for clarification. Responses use the dataset's solutions rather than generated procedures. The app makes at most one bounded Groq call per support message and falls back to local matching when Groq is unavailable. Hosting does not change the account's Groq plan.

The reviewed knowledge base has **132 entries**: all original 110 solutions revised and 22 new cases added. `slou.csv` is authoritative; `web/knowledge.json` is its generated cloud copy. The `aliases` column includes informal Arabic and English phrases. Service-specific wording reduces ambiguity between otherwise similar platform errors.

The revision removes unsupported fixed file-size limits and waiting periods, requests for identity numbers, advice to delete system files, and instructions to restart shared university network equipment. New cases cover browser freezes, account lockout, verification, phishing, microphone/camera, PDF files, printing, lost files, exam/assignment confirmation, and HTTP errors. These are general support suggestions, not verified university policies or guaranteed resolutions.

## Local Python app

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
# Edit .env and supply your GROQ_API_KEY.
.venv/Scripts/python.exe main.py
```

Open `http://127.0.0.1:7860`. Existing environment settings are preserved. `run_server.bat` uses the environment next to the project.

Saved Python chat downloads are generated in ignored `runtime/`. Older embedding and Excel files are preserved, but no longer drive retrieval. The local legacy complaint-recording helper remains available to Python callers; the simple public interface does not offer ticket management or send complaints to university departments.

## Hosted app

Public URL: https://chat.unihelp.workers.dev/

`web/` runs directly on Cloudflare Workers Free, independently of a ChatGPT subscription or this computer. Deployment instructions are in `web/cloudflare/README.md`. The public page is a simple chat and downloads conversations directly on the visitor's device. Server-only `GROQ_API_KEY` and optional `LLM_MODEL_CONVERSATION` are configured through the hosting environment. They are never included in the browser bundle. Free service remains subject to provider quotas and future policy changes.

D1 stores temporary clarification state and request responses for retry protection. Anonymous sessions use a private HttpOnly cookie. Starting a new conversation resets support context on the next message. Session context is ignored after an hour of inactivity; data is not automatically deleted. Public traffic is limited to 10 requests per IP per minute and 800 per UTC day, in addition to Groq's account/token limits. Old ticket tables remain in migration history but the web app does not write to them or expose a ticket API.

Do not submit passwords, identity numbers or confidential information. Messages may be sent to Groq. This is a student project, without official university integration.

## Checks

```powershell
.local-venv/Scripts/python.exe -m unittest discover -s tests -v
cd web
node node_modules/typescript/bin/tsc --noEmit
node node_modules/esbuild/bin/esbuild lib/retrieval.ts --bundle --platform=node --format=esm --outfile=.sites-runtime/retrieval.mjs
node scripts/test-retrieval.mjs
# Requires a running local preview with migrations applied:
node scripts/test-http.mjs
```

Coverage includes all 132 exact article queries, colloquial/English aliases, service questions, screenshot follow-ups, scope, bounded clarification, local storage failures, idempotent retries, input validation and cross-origin rejection. Live HTTP checks use a small number of Groq calls. No held-out accuracy percentage is claimed.

## Team

Hisham Abdullah Almalki · Saleh Mohammed Alsulami · Adel Mohammed Alzahrani · Ali Abdullah Almufarriji · Abdulrahman Saud Alzahrani.

College of Computing · Computer Science & AI Department · Selected Topics I, 2025/2026.
