# askmynanny — Preview (no backend, placeholder data)

## Look and feel
Warm, family-friendly, professional: soft cream background, deep teal primary, warm coral accent, rounded cards, gentle shadows. Fonts: Fraunces (headings) + Nunito Sans (body). Shared top bar with logo, "Find a Nanny", "Join as a Nanny".

## Pages
1. **Home (/)** — short welcome with two big choices: "I'm hiring" and "I'm a nanny".
2. **Employer search (/find)** — search bar plus filters (location, age range, gender, skills, education, expected salary, verified only). Grid of nanny cards: photo, name, age, location, top skills, rating, years of experience, "Verified ID" badge.
3. **Nanny profile (/nanny/$id)** — full profile: about, skills, education, salary expectation, benefits wanted, and employment history timeline (employer, dates, salary, benefits, reason for leaving, employer review with stars). Verified badge only — ID never shown.
4. **Nanny registration (/register)** — multi-step form: Personal info → Education & skills → Employment history (add multiple employers with salary, benefits, leave reason, reference) → ID verification (upload placeholder, note it stays private) → Review & submit (shows a success message only).

About 8 sample nannies with made-up details and generated portrait photos.

## Technical details
- Separate route files with their own page titles/descriptions; sample data in one shared file.
- Design tokens in styles.css; shadcn-style components; no Lovable Cloud.
