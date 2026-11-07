# Pull request text (copy and paste, no code changes)

## Title
feat: askmynanny UI preview, employer nanny search, profiles and nanny registration

## Description

### Summary
Adds a front-end-only preview of askmynanny, a platform where nannies build a verified profile with their work history and families search for trusted care. All data is placeholder; there is no backend yet.

### What's included
- **Home (`/`)**: welcome page with two entry points, "I'm hiring" and "I'm a nanny".
- **Employer search (`/find`)**: keyword search plus filters for location, gender, max age, max expected salary, skills and "Verified ID only"; nanny cards show photo, age, location, rating, years of experience, top skills and the verified badge.
- **Nanny profile (`/nanny/$id`)**: about, education, languages, expected salary, skills, benefits wanted, and an employment history timeline (employer, dates, location, salary, benefits, reason for leaving, employer review with stars).
- **Nanny registration (`/register`)**: 5-step form (Personal info, Education & skills, Work history with multiple employers, ID verification upload, Review & submit) ending in a success screen.
- **Privacy**: government IDs are never displayed; profiles only show an "ID Verified" badge.
- **Design system**: warm cream, teal and coral tokens in `styles.css`; Fraunces + Nunito Sans fonts; shared header with navigation; per-page SEO titles and descriptions.
- **Sample data**: 4 mock nanny profiles with generated portraits (`src/lib/nannies.ts`, `src/assets/`).

### Not included / follow-ups
- No persistence: the registration form does not save anything and file uploads are not stored.
- No authentication, real ID verification, or employer review submission flow.
- Salary filter assumes a single currency.

### How to test
1. Run the app and open `/find`; try the filters and the search bar.
2. Click a nanny card and check the profile and employment history.
3. Open `/register`, step through all 5 steps and submit to see the confirmation screen.
