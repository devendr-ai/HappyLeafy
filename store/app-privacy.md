# App Store Connect: App Privacy answers

Answers for **App Store Connect → your app → App Privacy**, based on what the code actually sends
(see `src/lib/plantnet.ts`, `src/lib/gemini.ts`, `src/lib/weather.ts`, `src/lib/proxy.ts`, `server/`).
Re-check this whenever a feature starts sending new data.

Apple counts data as "collected" when it leaves the device and you or a partner keep it longer than
needed to answer the request. Google's free Gemini tier may keep inputs to improve its products, so
photos and text sent to it must be declared.

## Do you or your third-party partners collect data from this app?

**Yes.**

## Data types to declare

| Apple category → type | What it is in HappyLeafy | Purpose | Linked to user? | Used for tracking? |
| --- | --- | --- | --- | --- |
| User Content → **Photos or Videos** | Plant photos sent for identification, diagnosis and the AI doctor (Pl@ntNet, Google Gemini) | App Functionality | No | No |
| User Content → **Other User Content** | Questions to Ask AI, notes, plant details sent with AI requests | App Functionality | No | No |
| Identifiers → **Device ID** | Random per-install ID sent to our proxy for daily fair-use limits (kept 2 days) | App Functionality | No | No |
| Location → **Coarse Location** | Coordinates of the town the user picks, sent to Open-Meteo for rain data | App Functionality | No | No |

For each one, the follow-up questions are:
- *Used for tracking?* **No**
- *Linked to the user's identity?* **No** (no accounts, no names, no Apple ID)
- *Purposes:* **App Functionality** only

## Do NOT declare (not collected)

Contact info, health and fitness, financial info, precise location (GPS isn't used), sensitive info,
contacts, emails/messages, browsing or search history, purchases, usage data, diagnostics (no crash
reporting yet). **Add Diagnostics → Crash Data** if Sentry or similar is added later.

## Tracking

**No.** No advertising, no data brokers, no cross-app tracking, so no App Tracking Transparency prompt.

## URLs (App Store Connect → App Information)

- Privacy Policy URL: `https://happyleafy.com/privacy.html`
- Support URL: `https://happyleafy.com/support.html`
- Marketing URL (optional): `https://happyleafy.com/`

## Things the third-party terms require

- **Age:** Google's Gemini API terms require users to be 18+ and forbid apps "likely to be accessed by
  individuals under 18" on it. Answer the age-rating questionnaire to get an **18+** rating, or gate
  the AI features behind an age confirmation.
- **EU / UK / Switzerland:** Gemini's free tier can't be offered to users there. Until the proxy uses a
  paid Gemini key, **exclude those countries** in App Store Connect → Pricing and Availability (and in
  TestFlight external testing).
- **Commercial use:** Pl@ntNet's free plan and Open-Meteo's free API are non-commercial. Switch both to
  paid plans before charging for the app.

## Before the first real build

- **Privacy manifest:** Apple requires a privacy manifest for "required reason" APIs. Expo modules ship
  their own; check the generated `PrivacyInfo.xcprivacy` after `eas build` and add entries in
  `app.json` → `ios.privacyManifests` if App Store Connect warns about missing reasons.
- **Encryption:** set `ios.infoPlist.ITSAppUsesNonExemptEncryption: false` (the app only uses HTTPS).
