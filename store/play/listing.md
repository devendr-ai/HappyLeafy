# Google Play listing and submission pack

Everything for the Play Console, in the order you'll meet it. Images are in this folder:

| File | Where it goes |
| --- | --- |
| `icon-512.png` (512 × 512) | Main store listing → App icon |
| `feature-graphic.jpg` (1024 × 500) | Main store listing → Feature graphic |
| `screenshots/1-today.png` … `6-doctor.png` (1080 × 1920) | Main store listing → Phone screenshots, in that order |

Regenerate the screenshots with `node docs/img/shoot.mjs play`.

---

## 1. Create app

| Field | Value |
| --- | --- |
| App name | `HappyLeafy: Plant Care & ID` |
| Default language | English (United States) – en-US |
| App or game | App |
| Free or paid | Free |
| Declarations | Tick both (Developer Program Policies, US export laws) |

## 2. Main store listing

**App name (30 max):** `HappyLeafy: Plant Care & ID`

**Short description (80 max, 76 used):**

```
Identify plants, check soil before you water, and fix problems with AI help.
```

**Full description (4000 max):**

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

## 3. Store settings

| Field | Value |
| --- | --- |
| App category | House & Home |
| Tags | Plants, Gardening, Home |
| Email | `info@happyleafy.com` (shown publicly) |
| Website | `https://happyleafy.com/` |
| Privacy policy | `https://happyleafy.com/privacy.html` |

## 4. App content (Policy → App content)

- **Privacy policy:** `https://happyleafy.com/privacy.html`
- **App access:** All functionality is available without special access (no sign-in).
- **Ads:** No, my app does not contain ads.
- **Content rating (IARC questionnaire):** email `info@happyleafy.com`; category **All Other App Types**
  (or Reference/Education if offered). Answer **No** to violence, sexuality, language, controlled
  substances, gambling, user-to-user interaction/sharing, sharing location with other users, and
  digital purchases. If asked about generative AI, answer **Yes** (Ask AI and Diagnose use Google Gemini).
- **Target audience and content:** **18 and over only** (Google Gemini API terms require adult users).
  Not designed to appeal to children.
- **News app:** No. **Government app:** No. **Financial features:** None. **Health apps:** None
  (plant care is not human health).
- **Data safety:** see section 5.

## 5. Data safety answers

Overview questions:
- Does your app collect or share any of the required user data types? **Yes**
- Is all of the user data collected by your app encrypted in transit? **Yes** (HTTPS everywhere)
- Do you provide a way for users to request that their data is deleted? **No**: there are no accounts, plants
  stay on the phone, the proxy keeps only a random device ID for 2 days, and the app can be uninstalled to
  remove everything. (If the form insists, answer Yes and give `privacy@happyleafy.com`.)

Data types (tick only these):

| Category → type | Collected | Shared | Processed ephemerally | Required or optional | Purposes |
| --- | --- | --- | --- | --- | --- |
| Photos and videos → **Photos** | Yes | Yes (Pl@ntNet, Google Gemini) | No | Optional | App functionality |
| App activity → **Other user-generated content** (AI questions, notes) | Yes | Yes (Google Gemini) | No | Optional | App functionality |
| Device or other IDs → **Device or other IDs** (random install ID for daily limits) | Yes | No | No | Required | App functionality, Fraud prevention / security |
| Location → **Approximate location** (coordinates of the town the user picks) | Yes | Yes (Open-Meteo) | Yes | Optional | App functionality |

"Shared" is Yes for photos and text because Google's free Gemini tier may use them to improve its
products, which goes beyond a service provider acting only for us. Keep this in step with
`store/app-privacy.md` and `docs/privacy.html`.

## 6. Countries (Production → Countries / regions)

Same as the App Store, because of Google Gemini's free-tier terms: **all countries except** the EU (27),
Iceland, Liechtenstein, Norway, Switzerland, United Kingdom, China and Russia.

## 7. Testing before production (new personal accounts)

1. **Closed testing → Create track** (e.g. "Friends").
2. Upload the `.aab` from EAS (first upload must be manual in Play Console).
3. **Testers:** create an email list with at least **12** Google accounts (Gmail addresses of Android users).
4. Share the **opt-in link**; each tester taps it, joins, then installs from Google Play.
5. Keep at least 12 testers opted in for **14 days in a row**, then **Apply for production** (Dashboard).

## Build and upload

- Build: `npx eas-cli@latest build --platform android --profile production` (EAS holds the upload keystore).
- First upload: download the `.aab` from the EAS build page and upload it in Play Console → Closed testing → Create release.
- Later uploads: `npx eas-cli@latest submit --platform android --latest` once a Google service-account key is set up in EAS.
