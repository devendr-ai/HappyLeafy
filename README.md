# HappyLeafy

HappyLeafy - An AI-powered plant care companion with plant identification, health insights, personalized care plans, and smart watering reminders.

Built with Expo SDK 57 (React Native + TypeScript). The SDK must match the Expo Go app on your phone: Expo Go shows its SDK version in its settings. Runs on iPhone, Android and the web from one codebase. Costs nothing to run for personal use.

## Features (v1)

| Feature | How it works | Cost |
| --- | --- | --- |
| **Identify plants from a photo** | [Pl@ntNet API](https://my.plantnet.org) – top 5 matches with confidence | Free, 500 IDs/day (non-commercial) |
| **Care guide** | Bundled offline guide: 111 genera/species plus 38 plant-family fallbacks, so almost any identified plant gets care advice | Free |
| **Care schedule** | Per-plant water and fertilise intervals, pre-filled from the care guide, editable | Free |
| **Today view** | What needs water/feeding today, overdue items, what is coming up this week | Free |
| **Reminders** | Local notifications on the day care is due, at the hour you choose | Free |
| **Plant Doctor** | Photo diagnosis via Pl@ntNet's disease API (same key and daily quota) with treatment advice, plus a symptom checker for 12 common problems | Free* |
| **AI plant doctor** | Optional Google Gemini second opinion: reads up to 3 photos plus watering, soil, pot and light details, explains likely causes, fixes and next steps. Falls back across Flash models when one hits its free quota | Free tier (key from aistudio.google.com) |
| **Smart watering** | Interval adjusts for season (hemisphere-aware), pot material and size, drainage and light | Free |
| **Care log** | History of watering, feeding, repotting, pruning | Free |

All data stays on the device (AsyncStorage). No account, no server.

\* Pl@ntNet's pricing page does not say whether disease identification is in the free plan. If your key is refused, the app says so and the symptom checker still works.

## Run it on your phone (free)

1. Install **Expo Go** from the App Store / Play Store.
2. On your Mac:

   ```bash
   npm install
   npx expo start
   ```

3. Scan the QR code with your phone camera (iOS) or Expo Go (Android).
4. Get a free Pl@ntNet key at <https://my.plantnet.org> and paste it into **Settings** in the app.
   Optional: put it in `.env` as `EXPO_PUBLIC_PLANTNET_KEY=...` so it is pre-filled.
5. Optional: get a free Gemini key at <https://aistudio.google.com/apikey> and paste it into **Settings** for AI diagnosis (`EXPO_PUBLIC_GEMINI_KEY` in `.env` also works).

Web preview: `npx expo start --web` (reminders are disabled on web).

## Project layout

```
src/app/            screens (Expo Router)
  (tabs)/           Today, My Plants, Identify, Doctor, Settings
  plant/[id].tsx    plant detail + care guide + history
  add.tsx           add / confirm a plant
src/lib/            store, schedule maths, care DB, Pl@ntNet client, reminders, photos
src/components/     shared UI
```

## Roadmap to parity with Planta / PictureThis

- [x] Photo disease diagnosis (Pl@ntNet)
- [x] Seasonal, pot and light aware watering
- [ ] Light meter using the camera
- [x] Larger care database with family fallbacks
- [ ] Multiple photos per plant / growth timeline
- [ ] Rooms / locations, search and sorting
- [ ] Cloud backup and sync (Supabase / Firebase free tier)
- [ ] Home-screen widget

## Thinking about monetising later

- **Pl@ntNet's free tier is non-commercial only.** A paid app needs their commercial plan, or another ID provider (Kindwise plant.id, etc.). Budget per identification.
- Store fees: Apple Developer Program $99/year, Google Play $25 once.
- Typical model in this category: free tier (a few IDs, reminders) + subscription for unlimited ID, diagnosis, and advanced care plans.
- Differentiation matters more than parity: the incumbents are strong. Pick a niche (e.g. plants and climate of one region, balcony vegetable gardens, or an app with no aggressive paywall) and win there first.

## Scripts

```bash
npx tsc --noEmit   # typecheck
npx eslint .       # lint
npx expo-doctor    # check config and dependency versions
```
