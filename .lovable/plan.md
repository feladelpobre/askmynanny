# Fix "Page not found" on Netlify

## Why it happens
The project is set up by default to be hosted on Cloudflare-style servers. Netlify builds it, but can't find a homepage in the output, so it shows its own 404 page. Your app pages are fine; the build just isn't packaged for Netlify.

## What I'll change
1. Add a `netlify.toml` file at the project root that tells Netlify:
   - build command: `npm run build`
   - build for Netlify, not Cloudflare (`NITRO_PRESET = "netlify"`)
   - use Node 22
2. If the existing build config ignores that setting, set the Netlify target directly in `vite.config.ts` instead.
3. Run a Netlify-style build in the sandbox and confirm the output has the Netlify server function and static files.
4. Add a short "Deploying to Netlify" section to the README.

This does not affect publishing on Lovable.

## After merging
In Netlify: Site settings → Build & deploy, clear any custom "Publish directory" or build command so the values from `netlify.toml` are used, then trigger a new deploy.

## PR text (for your current PR, unchanged)

**Title:** feat: askmynanny UI preview, employer nanny search, profiles and nanny registration

**Description:**
Front-end-only preview of askmynanny: nannies build verified profiles with work history, and families search for care. All data is placeholder; there is no backend yet.

- Home (`/`): "I'm hiring" / "I'm a nanny" entry points
- Employer search (`/find`): search plus filters (location, gender, age, salary, skills, verified only)
- Nanny profile (`/nanny/$id`): details plus employment history (salary, benefits, leave reason, employer reviews)
- Registration (`/register`): 5-step form including a private ID upload; profiles only show an "ID Verified" badge
- Warm design system (Fraunces + Nunito Sans), 4 mock nannies with generated portraits

Not included: saving data, sign-in, real ID verification.
