# WiE-Hacks-2026-Delta

WiE Hackathon 2026 Submission

**Project: BISECT** — a multilingual concept-gap tutor.

FastAPI + React.js

The project uses a Next.js frontend and a FastAPI backend.

## Getting Started

Start the frontend from `my-app`:

```bash
cd my-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Start the FastAPI backend

Use Python 3.11 or newer. In a second terminal, run:

```bash
cd my-app
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

Open `my-app/.env` in VS Code and set `GEMINI_API_KEY` for the on-page AI tutor
and personalized explanations. Create a key in [Google AI Studio](https://aistudio.google.com/app/apikey),
paste it after `GEMINI_API_KEY=`, and keep `.env` private; it is ignored by Git.
Open the AI chat again after saving; the backend checks the key on each health
check, so a restart is not required for this local setup:

```bash
uvicorn api:app --host 127.0.0.1 --port 8001
```

The backend serves `/health`, `/topics`, `/explain`, `/chat`, anonymous activity intake,
and public teacher summary/report routes. Anyone who can reach the website can
view its aggregate teacher dashboard and reports. Teacher metrics are derived
from persisted SQLite records in `my-app/bisect.sqlite3`; answers, names, and
free-text explanations are not stored in those records. Records older than 90
days are pruned at backend startup by default. Set `BISECT_CLASS_ID` to separate
class datasets. The chatbot and personalized explanations use `gemini-3.5-flash-lite` by default
and require a Gemini key; set `GEMINI_MODEL` to another supported Gemini model
if needed. The teacher report is based on saved activity. The frontend proxies
requests through same-origin Next.js routes. The proxy defaults to
`http://127.0.0.1:8001`; set `BACKEND_URL` if FastAPI runs elsewhere. Never put
the Gemini key in a `NEXT_PUBLIC_` variable. Restart both
servers after changing `.env` values.

The public teacher dashboard starts empty until real student activity is submitted.
Teachers can refresh the data, download or copy a Markdown class report, open
a Teams chat draft, and create a downloadable multilingual vocabulary card.
Enter Teams recipient email addresses to prefill a new chat draft; without
recipients the link opens Teams. The teacher reviews and sends the message.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
