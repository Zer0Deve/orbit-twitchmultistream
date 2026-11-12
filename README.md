# Orbit

A React + Vite prototype for a personal multistream workspace. It includes a responsive dashboard, Twitch player spaces, per-card resizing, a two/three-column layout switcher, add/remove space controls, and Google sign-in with Firebase Authentication.

## Run locally

```sh
npm install
npm run dev
```

## Deploy to GitHub Pages

The `master` branch deploys automatically with GitHub Actions. The production build uses the repository subpath at `https://zer0deve.github.io/orbit-twitchmultistream/`; local development continues to use `/`.

## Configure Google sign-in

1. Create a Firebase project and register a Web app in Firebase Console.
2. Under **Authentication → Sign-in method**, enable **Google**.
3. Under **Authentication → Settings → Authorized domains**, add `zer0deve.github.io`. Add `localhost` if you want to test locally.
4. For local development, copy `.env.example` to `.env.local` and fill in the Web app's `apiKey`, `authDomain`, `projectId`, and `appId` from Firebase project settings.
5. In the GitHub repository, add these same values as **Settings → Secrets and variables → Actions → Variables**: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_APP_ID`. Re-run the Pages workflow after setting them.

Firebase Web app configuration is public client configuration, not a service-account credential. Never put a service-account key or OAuth client secret in this frontend.

The Twitch embeds use the current hostname as their required `parent` parameter. A channel can be added from **Add space**; whether it plays depends on Twitch availability and embed permissions.

## Integration boundary

Google authentication is handled by Firebase Auth and persists the session in the browser. The app requires the Firebase Web app configuration and enabled Google provider described above. Twitch account linking is not active.

Twitch embeds in the same browser share that browser's Twitch login and cookies. Separate cards provide independent players and layouts, but they do **not** create separate Twitch identities. Supporting distinct Twitch accounts per space requires a separately isolated browser context for each account; that cannot be provided by ordinary same-page iframes.
