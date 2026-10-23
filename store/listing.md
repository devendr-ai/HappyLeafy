# App Store listing and submission pack

Everything to paste into App Store Connect, in the order you'll meet it. Privacy answers are in
[app-privacy.md](app-privacy.md). Screenshots are in [screenshots/](screenshots/) (6.9" iPhone,
1320 × 2868, the only size Apple requires). Upload them in file-name order: Today, soil check, plant
page, care guide, My Plants, Doctor. Regenerate with `node docs/img/shoot.mjs store` (uses the live
web demo). The app is iPhone-only (`supportsTablet: false`), so no iPad screenshots are needed.

---

## 1. App Information

| Field | Value |
| --- | --- |
| Name (30 max) | `HappyLeafy: Plant Care & ID` |
| Subtitle (30 max) | `Identify, water, diagnose` |
| Bundle ID | `com.happyleafy.app` |
| SKU | `happyleafy-ios` |
| Primary language | English (U.S.) |
| Primary category | Lifestyle |
| Secondary category | Education |
| Content rights | No, it does not contain, show or access third-party content (plant names and care info are facts; photos are the user's own) |
| Privacy Policy URL | `https://happyleafy.com/privacy.html` |
| Support URL | `https://happyleafy.com/support.html` |
| Marketing URL | `https://happyleafy.com/` |
| Copyright | `2026 Richa Yash Garg` (the developer account's legal name) |

## 2. Pricing and Availability

**Price:** Free (USD 0). No in-app purchases.

**Countries: untick these.** Google's free Gemini tier can't be offered to users in the EEA,
Switzerland or the UK, and isn't available in some other countries. Re-enable them once the proxy uses
a paid Gemini key.

- **EU (27):** Austria, Belgium, Bulgaria, Croatia, Cyprus, Czechia, Denmark, Estonia, Finland, France,
  Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands,
  Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden
- **Rest of EEA:** Iceland, Liechtenstein, Norway
- **Also:** Switzerland, United Kingdom
- **Gemini not offered / extra licences needed:** China mainland, Russia. Before release, compare the
  rest against Google's list at `https://ai.google.dev/gemini-api/docs/available-regions` and untick
  any App Store country that isn't on it.

Simpler alternative for a first release: tick only the countries your testers live in, and widen later.

## 3. Age Rating

Gemini's terms require users to be 18+. Answer the questionnaire honestly (all content questions:
**None / No**: no violence, mature themes, gambling, medical advice for people, web browser, chat
between users, user-generated content shared with others, ads). If it asks about AI-generated
content or an AI assistant, answer **Yes** (Ask AI and Diagnose use Google Gemini).

Then use **Override to a higher age rating** and choose **18+**. The app's onboarding also states
that it's for adults.

## 4. Version page (1.0)

**Promotional text (170 max, can change any time without review):**

```
Snap a leaf to name your plant, check the soil before you water, and ask an AI when something looks off. Free, no account, and your plants stay on your phone.
```

**Description (4000 max):**

```
HappyLeafy helps you keep your houseplants alive without guesswork.

NAME ANY PLANT
Photograph a leaf or flower and HappyLeafy suggests what it is, with a care guide for that plant: light, water, humidity, feeding, toxicity to pets and common problems.

CHECK BEFORE YOU WATER
When a plant is due, HappyLeafy asks you to check the soil first. Dry? It tells you roughly how much water to give, in ml or cups, based on the pot size. Still damp? Record it and skip: the next check moves out a few days, and it still counts toward your streak. Not sure? It shows how to check that plant in its pot: the depth to feel for, the roots of an orchid, the skewer test for succulents, a light touch for ferns.

SCHEDULES THAT ADJUST
Watering and feeding schedules are adjusted for the season, pot size, light and, for outdoor plants, recent rain in your town. If the soil keeps being damp, HappyLeafy suggests a longer interval, and you decide whether to use it.

FIX PROBLEMS
Diagnose: photograph what looks wrong (yellow leaves, spots, pests) and get likely causes and what to do. Ask AI: ask anything about a specific plant, and save the answers you want to keep. A week later HappyLeafy asks whether the advice helped, and suggests what to try next if it didn't.

ALL THE CARE IN ONE PLACE
Reminders for watering, feeding, misting, leaf cleaning and repotting. One daily summary instead of a flood of notifications. Vacation mode. Rooms, notes, photo timeline and care history for each plant. Metric or US units.

PRIVATE BY DESIGN
No account and no ads. Your plants are stored on your phone, and you can back them up to a file whenever you like. Photos and questions are sent only when you ask for an identification or AI advice.

Good to know
- Free daily allowance of identifications and AI questions per phone.
- Identification by Pl@ntNet. AI advice by Google Gemini: treat it as a helpful second opinion, not a guarantee.
- For adults (18+).
```

**Keywords (100 max, commas, no spaces):**

```
houseplant,watering,reminder,identifier,succulent,disease,doctor,garden,flower,leaf,soil,monstera
```

**Support URL / Marketing URL:** as in section 1.

**Version:** 1.0.0 · **Build:** pick the build uploaded by `eas submit`.

## 5. App Review Information

**Sign-in required:** No (the app has no accounts).

**Contact:** your name, phone number and `info@happyleafy.com`.

**Notes (paste as-is):**

```
HappyLeafy has no accounts or sign-in; all plant data is stored on the device.

How to test:
1. Complete the short onboarding (choose any options).
2. Tap the round camera button (bottom right) or "Add plant", then "Take a photo" or "Choose from photos" of any plant leaf or flower. Results come from the Pl@ntNet API via our server. Tap a result to add the plant.
3. Or choose "Type the name" to add a plant by name (e.g. "Monstera").
4. Today tab: tap a care task. Watering starts with "Check soil": choose Dry, Still damp or Not sure.
5. Open a plant: tap Ask AI to ask a question, or use the Doctor tab with a photo of a leaf. AI answers come from Google Gemini via our server.
6. Settings: reminders (local notifications only, no push server), units, backup to a file, restore.
7. After saving an AI answer, a "Did it help?" check-in appears on Today on its due date.

Each device has a free daily allowance (20 identifications, 10 diagnoses, 60 AI questions). Network access is needed for identification and AI only; everything else works offline.

The app is rated 18+ and not offered in the EEA, Switzerland or the UK because of Google Gemini API terms.
```

## 6. TestFlight (before the App Store)

| Field | Value |
| --- | --- |
| Beta App Description | `Try HappyLeafy before release: identify your plants, check the soil before watering, and ask the AI about problems. Please tell us what's confusing.` |
| Feedback email | `info@happyleafy.com` |
| What to Test | `Add 2–3 of your own plants (Identify or Add). When a check is due, use Check soil. Try Ask AI or the Doctor on a plant. Turn on reminders in Settings and tell us if they arrive at a sensible time.` |
| Sign-in required | No |

Internal testers (people you add as App Store Connect users) can install immediately. For friends,
create an **External** group, add the build and turn on **Public Link**. The first build goes through
Beta App Review (usually under a day), then share the link.

---

## Build and upload a new version

Done once already (2026-10-22: build 1.0.0 (2) is in TestFlight). For each new version, from
`/Users/devendra/happyleafy`:

1. Build: `npx eas-cli@latest build --platform ios --profile production` (EAS has the certificates; no Apple password needed)
2. Upload: `npx eas-cli@latest submit --platform ios --latest`
3. In App Store Connect, pick the new build on the version page and submit for review.
