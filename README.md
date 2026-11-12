# Orbit

A React + Vite prototype for a personal multistream workspace. It includes a responsive dashboard, Twitch player spaces, per-card resizing, a two/three-column layout switcher, add/remove space controls, and preview-only sign-in dialogs.

## Run locally

```sh
npm install
npm run dev
```

## Deploy to GitHub Pages

The `master` branch deploys automatically with GitHub Actions. The production build uses the repository subpath at `https://zer0deve.github.io/orbit-twitchmultistream/`; local development continues to use `/`.

The Twitch embeds use the current hostname as their required `parent` parameter. A channel can be added from **Add space**; whether it plays depends on Twitch availability and embed permissions.

## Integration boundary

Authentication is not active in this prototype. Google sign-in and Twitch account-linking buttons explain the required next step instead of simulating a successful login. Production authentication needs OAuth client configuration and a backend to securely validate sessions and protect tokens.

Twitch embeds in the same browser share that browser's Twitch login and cookies. Separate cards provide independent players and layouts, but they do **not** create separate Twitch identities. Supporting distinct Twitch accounts per space requires a separately isolated browser context for each account; that cannot be provided by ordinary same-page iframes.
