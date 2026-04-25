# The Passport Pantry

An offline-first React 18 + TypeScript + Tailwind CSS cooking passport app built with Vite and Capacitor.

## Run On Web

```bash
npm install
npm run dev
```

## Run On iOS

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Then choose an iPhone simulator or connected iPhone in Xcode and press Run.

## Run On Android

```bash
npm run build
npx cap sync android
npx cap open android
```

Then choose an emulator or connected Android device in Android Studio and press Run.

## ZIP Submission

The uploaded ZIP must contain `index.html` at the root. Build the static web version first:

```bash
npm run build
```

Then create the ZIP from the contents of `dist/`, not the `dist` folder itself. The resulting ZIP should look like this at the top level:

```text
index.html
manifest.webmanifest
assets/
```

Because Vite is configured with relative asset paths, the generated root `index.html` can be opened from a static host or extracted folder.

## Build Web Assets

```bash
npm run build
```

All recipe and ingredient content lives in `src/data.json`. Earned food badges, country stamps, and uploaded Base64 photos are stored in `localStorage` under `passport-pantry-state-v1`.

## Mobile/PWA Notes

The app is mobile-first and installable as a static PWA shell via `public/manifest.webmanifest`. The iOS and Android folders contain the Capacitor native project scaffolds.
