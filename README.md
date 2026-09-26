# BeforeZero

Accessible emergency-learning website. Tagline: **Practice before it matters.**

Three on-site paths:

1. **Learn** (`/learn`) — two sourced U.S. storm case studies from NHC and FEMA records.
2. **Practice** (`/practice`) — choose the hurricane or tornado lesson. Stable URLs: `/practice/hurricane` and `/practice/tornado`. The hurricane lesson remains at that path; `/practice/hurricane-flood-1` redirects there. Secondary: `/simulate` (blackout) and `/practice/rehearsal` (five-step household rehearsal).
3. **Alerts** (`/alerts`) — on-demand National Weather Service active alerts for a U.S. place you confirm. Not a notification or dispatch service. Browser geolocation is not requested.

Display and listening options (text size, contrast, captions, narration controls, reduced motion) do not ask for a disability. This project does not claim WCAG certification.

This is a scripted prototype. It is not live emergency guidance.

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

- `XAI_API_KEY` is required for interpretation, optional alert explanation, “Speak my answer”, “Listen”, and local scene generation. Keep it server-side. Do not prefix it with `NEXT_PUBLIC_`.
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
npm run generate:lesson-narration
```

Automated tests mock the provider and do not spend API credits. `npm run generate:scenes` is the only command that creates Grok Imagine stills. It is not run during `dev`, `build`, or user interactions.

`npm run generate:lesson-narration` regenerates only changed Grok Voice scripts and remuxes existing Imagine clips. It does not start Imagine jobs. The Practice UI does not show script hashes or regeneration commands. Until hashes match the current teaching script, the lesson shows “Updated narration is being prepared. Text guidance is available.” and does not play leftover audio.

Hurricane remuxing reads the original Imagine files in `public/lesson/source/` (`watch.mp4` 6.6 MB, `street.mp4` 12.3 MB, `flood.mp4` 6.7 MB, `interior.mp4` 3.7 MB; about 28 MB together). Those files are local working copies and are not in git. Do not delete them. Without them, `--narration-only` cannot remux new voice onto the existing clips.

Tornado media lives under `public/lesson/tornado/`. Local labeled SVGs and captions do not call Imagine or TTS:

```bash
npm run generate:lesson-media -- --lesson tornado-home-1
```

Paid tornado generation (approved when run with `--confirm-paid`): **2** Grok Imagine video jobs (`sky`, `shelter`) and **8** Grok TTS jobs. It does not regenerate hurricane clips. The labeled shelter diagram stays the instructional visual; Imagine footage is illustrative only.

```bash
npm run generate:lesson-media -- --lesson tornado-home-1 --confirm-paid
```

Reviewed tornado URLs (26 Sep 2026): https://www.weather.gov/safety/tornado-ww ; https://www.weather.gov/safety/tornado-during ; https://www.cdc.gov/tornadoes/safety/stay-safe-during-a-tornado-safety.html

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

## Official preparation sources (reviewed 25 Sep 2026)

Scenario copy and follow-up tasks were checked against current public Ready.gov pages. This app is not FEMA-approved or endorsed.

Reviewed URLs:

- Power Outages: https://www.ready.gov/power-outages (page last updated 06/04/2026)
- Make a Plan: https://www.ready.gov/plan (page last updated 09/01/2026)
- Build a Kit: https://www.ready.gov/kit (page last updated 07/01/2026)
- Emergency Alerts: https://www.ready.gov/alerts (page last updated 05/27/2026)
- Hurricanes: https://www.ready.gov/hurricanes (page last updated 09/24/2026)
- Floods: https://www.ready.gov/floods
- NWS API Web Service: https://www.weather.gov/documentation/services-web-api (updated 3/24/2026)
- Census Geocoding Services API: https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html
- NHC Harvey 2017 archive: https://www.nhc.noaa.gov/archive/2017/HARVEY.shtml
- NHC Tropical Cyclone Report Ian AL092022: https://www.nhc.noaa.gov/data/tcr/AL092022_Ian.pdf
- FEMA DR-4332: https://www.fema.gov/disaster/4332

The former path `https://www.ready.gov/family-emergency-communication-plan` returned 404 at review time; family communication content is cited from Make a Plan.

Ready.gov power-outage guidance lists flashlights for every household member and a cell phone with chargers and a backup battery. It does not list candles as outage lighting. Make a Plan asks households to decide how they will contact one another if separated and to pick a familiar, easy-to-find meeting place. It does not tell people to travel during an emergency regardless of conditions or official directions. Build a Kit describes several days of water and food plus a flashlight and extra batteries in a designated place, not only knowing a storage spot.

## Learn more

Next.js docs: [https://nextjs.org/docs](https://nextjs.org/docs)
