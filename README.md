# askmynanny

Make me a blank project, name it as askmynanny

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://askmynanny.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/01db6f99-04e7-4a6a-88f0-4aa7fd864904).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploying to Netlify

Netlify settings come from [`netlify.toml`](netlify.toml): build with `bun run build`, publish `dist`, Node 22, and `NITRO_PRESET=netlify` so the server-rendered app is packaged as a Netlify function rather than for Cloudflare.

In Netlify (Site configuration → Build & deploy), leave **Build command** and **Publish directory** empty so the values in `netlify.toml` are used, then trigger a new deploy. Publishing on Lovable is not affected.
