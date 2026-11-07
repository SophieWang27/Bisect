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

Open `my-app/.env` in VS Code and add your Gemini API key after `GEMINI_API_KEY=`.
Keep that file private; it is ignored by Git. Then start FastAPI:

```bash
uvicorn api:app --reload --port 8000
```

The backend serves `/health`, `/topics`, and `/explain`. The topic picker reads
its available topics from the Python question model, and selection works
without a Gemini key. Personalized explanations use `gemini-3.8-flash` and need
the key. The frontend connects through same-origin Next.js routes and shows its
built-in translated lesson if FastAPI or Gemini is unavailable. The proxy
defaults to `http://127.0.0.1:8000`; set the server-only `BACKEND_URL` variable
if FastAPI runs elsewhere. Never put the Gemini key in a `NEXT_PUBLIC_` variable.

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
