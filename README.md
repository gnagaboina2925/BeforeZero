# BeforeZero

Interactive household emergency rehearsal. Tagline: **Practice before it matters.**

This is a scripted prototype. You can type or speak an answer, then have Grok map it onto an existing listed choice. It is not live emergency guidance.

## Getting started

From the `beforezero` folder:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Create a local env file named `.env.local` in `beforezero`. Do not commit it. `.gitignore` already ignores `.env*` files, including `.env.local`.

```bash
XAI_API_KEY=your_xai_api_key_here
XAI_MODEL=grok-4.3
XAI_IMAGE_MODEL=grok-imagine-image-2.0
```

- `XAI_API_KEY` is required for “Check my answer”, “Speak my answer”, “Listen to question”, and local scene generation. Keep it server-side. Do not prefix it with `NEXT_PUBLIC_`.
- `XAI_MODEL` is optional. The default is `grok-4.3`, the currently listed economical Grok text model on xAI’s model pricing page. Override it if you want a different supported text model.
- `XAI_IMAGE_MODEL` is optional. The default is `grok-imagine-image-2.0`, the documented Grok Imagine image model.

The app calls xAI from `POST /api/rehearsal/interpret` using the Chat Completions API (`https://api.x.ai/v1/chat/completions`) with `response_format.json_schema`. Requests set `reasoning_effort: "none"` (Grok 4.3 defaults to `low`) and do not send `search_parameters`. Scripted multiple-choice still works if interpretation is unavailable.

Voice uses the same server-side key:
- `POST /api/voice/transcribe` → Speech to text (`https://api.x.ai/v1/stt`, `grok-voice-transcribe-2.0`)
- `POST /api/voice/speak` → Text to speech (`https://api.x.ai/v1/tts`, default voice `eve`)

Recordings are not saved to disk. Typed choices still work if voice fails.

Failures log a sanitized line in the Next.js terminal:

```text
[beforezero-interpret] {"event":"beforezero-interpret","hasApiKey":true,"model":"grok-4.3","httpStatus":400,"reason":"invalid_schema",...}
```

The browser error also includes a short `diagnostic` token such as `invalid_request:http_400`. In development (`npm run dev`), the terminal line also includes redacted `providerErrorMessage` and `providerErrorParam` only. Those fields are not sent to the browser. Logs never include API keys, Authorization headers, request bodies, or user answers.

## Scripts

```bash
npm run lint
npm run test
npm run build
npm run generate:scenes
```

Automated tests mock the provider and do not spend API credits. `npm run generate:scenes` is the only command that creates Grok Imagine stills. It is not run during `dev`, `build`, or user interactions.

## Grok Imagine scene illustrations

From the `beforezero` folder, generate two local stills with the documented Grok Imagine model `grok-imagine-image-2.0` (`https://api.x.ai/v1/images/generations`, `response_format: b64_json`, landscape `aspect_ratio: 16:9`):

```bash
npm run generate:scenes
```

The script loads `XAI_API_KEY` from the environment or `.env.local` without printing it. Override the image model with `XAI_IMAGE_MODEL` if needed. Files are written under `public/scenes/` and skipped if they already exist. Until those files exist, the app shows a CSS gradient fallback. The UI never treats the illustration as a picture of the user’s home.

## Live Grok check (one request)

1. Start the app with `npm run dev` and a valid `XAI_API_KEY` in `.env.local`.
2. Open the app, choose a household, and start practice.
3. On step 1, leave the listed choices unused and type something clear such as `I would use the flashlight on my phone.`
4. Click **Check my answer** once. Wait for Grok feedback.
5. If it maps to a listed choice, click **Use this interpretation**, then **Continue**.
6. If it fails, look in the terminal running `npm run dev` for a `[beforezero-interpret]` JSON line. The on-screen error may also end with a diagnostic token in square brackets.

## Live voice check (one recording)

1. On a rehearsal step, click **Listen to question** once and confirm the spoken prompt matches the on-screen question. Use **Stop** if needed.
2. Click **Speak my answer**, allow the microphone, say a short answer, then **Stop recording**.
3. Review the transcript in the text box (confirm replace if text was already there), then click **Check my answer** once.

## Learn more

Next.js docs: [https://nextjs.org/docs](https://nextjs.org/docs)
