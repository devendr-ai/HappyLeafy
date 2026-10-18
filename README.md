# HappyLeafy

HappyLeafy - An AI-powered plant care companion with plant identification, health insights, personalized care plans, and smart watering reminders.

Built with Expo SDK 57 (React Native + TypeScript). The SDK must match the Expo Go app on your phone: Expo Go shows its SDK version in its settings. Runs on iPhone, Android and the web from one codebase. Costs nothing to run for personal use.

## Features (v1)

| Feature | How it works | Cost |
| --- | --- | --- |
| **Identify plants from a photo** | [Pl@ntNet API](https://my.plantnet.org) – top 5 matches with confidence | Free, 500 IDs/day (non-commercial) |
| **Care guide** | Bundled offline database of ~45 common houseplants (light, humidity, temperature, soil, pet toxicity, tips) | Free |
| **Care schedule** | Per-plant water and fertilise intervals, pre-filled from the care guide, editable | Free |
| **Today view** | What needs water/feeding today, overdue items, what is coming up this week | Free |
| **Reminders** | Local notifications on the day care is due, at the hour you choose | Free |
| **Plant Doctor** | Symptom checker: 12 common problems, likely causes, signs and fixes | Free |
| **Care log** | History of watering, feeding, repotting, pruning | Free |

All data stays on the device (AsyncStorage). No account, no server.

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

- [ ] AI disease diagnosis from a photo (options: Kindwise plant.health, a vision LLM, or an on-device model)
- [ ] Seasonal watering adjustment (water less in winter) and pot-size / pot-type / light-level aware intervals
- [ ] Light meter using the camera
- [ ] Larger care database (merge Pl@ntNet species with an open dataset, or a care API such as Perenual)
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
