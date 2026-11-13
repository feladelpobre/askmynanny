# askmynanny: market and user research

Desk research done in November 2026 to feed the idea validation report and the PRD. Sources are listed at the end. Items marked **(unverified)** come from a single secondary source; confirm them before quoting them as fact.

> Desk research is not a substitute for talking to users. Section 6 has an interview script and a short survey to collect first-hand evidence from families and nannies.

## 1. Competition

| Competitor | What it is | Verification | Pricing | Gaps askmynanny can fill |
|---|---|---|---|---|
| **Facebook hiring groups** | Where most Filipino families still find a yaya | None. You trust "a photo and a comment thread" | Free | No identity check, no work history, scam-prone |
| **Placement agencies** | DOLE-licensed agencies that recruit and place kasambahay | Varies; many don't verify identity unless asked | Agency fees | Expensive, inconsistent vetting |
| **Pinoyaya** | Filipino app for hiring yayas, babysitters and housekeepers directly | **Optional** ID check with a live selfie ("ID-Verified" badge). ID is not a background check | Browse free; ₱399 (7 days) or ₱699 (30 days) to message and send offers | Verification is optional; no verified employment history or employer reviews mentioned |
| **Kazam** (Azcalun, Inc.) | Platform connecting homeowners with housekeepers, nannies, drivers and caregivers; app since 2022 | No platform verification found; employers vet candidates themselves | Free sign-up; employers pay for reply credits or a subscription | ~22,000 users (16,000 helpers, 6,000 homeowners) **(unverified)**; user reports of interview no-shows |
| **HelperPlace / HelperChoice** | International helper platforms (Hong Kong, Singapore, Middle East) | HelperChoice checks passport, visa and local ID; profile details are self-reported | Varies | Built for overseas hiring, which needs licensed agencies (see the regulatory notes) |
| **General job boards** (JobStreet, Kalibrr, Indeed, Bossjob) | White-collar and BPO hiring | Company-side only | Varies | Not designed for household work |

**askmynanny's differentiating angle:**
1. **Verification is mandatory, not optional.** Every contactable nanny has passed an ID plus live-photo check reviewed by an admin.
2. **Employment history confirmed by past employers.** Competitors show self-reported work history; askmynanny asks the previous employer to confirm dates, role and the review.
3. **Two-way trust.** Employers are verified too, which protects nannies from fake job offers.
4. **Compliance built in.** Minimum-wage checks by region, a Kasambahay Law (RA 10361) contract, and no fees charged to nannies.

## 2. Problems employers run into

| Problem | Evidence | What askmynanny does about it |
|---|---|---|
| **No identity check** when hiring through Facebook groups | Pinoyaya guide | Mandatory ID and live-photo verification |
| **References that can't be checked**, or that avoid calls and answer evasively | Pinoyaya guide | Past employers confirm work history in the app |
| **Cash advances ("vale"), then the helper leaves** | Respicio commentaries; Cebu expat guide (reports employers have "no claim" if she leaves with the advance unpaid) | Contract template with a signed cash-advance clause; payroll log (v2) |
| **Interview no-shows** | Kazam user reviews | Interview scheduling with reminders and a reliability indicator |
| **Hiring in a rush** without checks; **poor fit** because needs weren't defined | Pinoyaya guide | Structured household profile: children's ages, duties, live-in or live-out |
| **Not knowing the legal obligations**: ₱7,800 minimum in Metro Manila (from Feb 7, 2026), SSS / PhilHealth / Pag-IBIG, written contract, 13th-month pay, rest days | Pinoyaya guide citing Wage Order NCR-DW-06 | Salary input blocks amounts below the regional minimum; benefits checklist; contract generator |
| **Discriminatory job posts.** A domestic helper ad drew public backlash for appearance requirements ("Mukhang nurse, hindi kasambahay") | Interaksyon / Philstar, 2023 | Job posts can't specify looks, age or gender (RA 10911); admins moderate posts |

## 3. Problems nannies and kasambahay run into

| Problem | Evidence | What askmynanny does about it |
|---|---|---|
| **Underpayment.** DOLE says underpayment is the usual complaint; a labor federation cited pay as low as ₱2,000 a month | Philstar (Jan 2025); BusinessWorld (Jan 2026) | Offers below the regional minimum are blocked |
| **Low awareness of rights.** Only 41% of domestic workers knew about the Kasambahay Law (2019 DOLE–PSA survey) | IDWF Philippine mapping, 2025 | A "Know your rights" page in plain Filipino and English, shown at registration |
| **Long hours and no rest days.** 36% of live-in workers work 7 days a week **(unverified)** | News report citing the 2019 survey | Job posts must state rest days, and a weekly day off is shown on every offer |
| **Abuse** (verbal and physical) and unpaid wages, 13th-month pay and government contributions | ILO analysis; Respicio DOLE case guides | Report button, admin moderation, verified employers, links to the DOLE hotline |
| **Fake job offers that charge placement fees**, often on Facebook. RA 10361 bans charging recruitment or finder's fees to kasambahay | Respicio; ManpowerGroup warning (Inquirer); DMW takedowns | "Never pay to apply" warning in chat; employers are verified; offers asking for fees can be reported |

## 4. Social media signals

- Social media has become a common place for viral stories about bad experiences with helpers, while yayas themselves remain under-appreciated (Mommy Mundo commentary).
- Creator content shows strong public interest in the yaya relationship: Kryz Uy's "Yaya Q&A" vlog, and Ivana Alawi's "Maid for a day" vlog (1.4 million YouTube views at the time of reporting).
- A Filipina nanny's post drew over 11 million views (Khaleej Times), and a domestic worker in Lebanon used TikTok to show what a good employer relationship looks like (CS Monitor).
- **Takeaway:** trust and fair treatment are emotional, public topics. A platform that visibly protects both sides has a clear story for marketing and for the "why now".

## 5. Additional inputs to add to the app

### Nanny registration
| Field | Required | Why |
|---|---|---|
| Profile photo | Yes | Anti-fraud; employers expect a face |
| Live photo holding a government ID (camera only, no upload) | Yes | Anti-fraud. Admin compares it with the ID |
| ID type (PhilSys National ID, UMID, passport, driver's license, postal ID) | Yes | Admin review; the ID image is deleted after verification |
| Email (OTP) and mobile number | Yes | Account security. The number stays hidden until the nanny shares it |
| City (Metro Manila, Cebu, Davao and others) | Yes | Location search |
| **NBI clearance** (upload, with expiry date) | Optional, but needed for a "Background Checked" badge | ID is not a background check. This closes the gap Pinoyaya itself admits |
| Barangay clearance | Optional | A local reference |
| **TESDA NC II** (Household Services or Caregiving), first aid or CPR | Optional | Proof of skills |
| Childcare experience by age: newborn, toddler, school-age, special needs | Yes | Better matching |
| Languages: Filipino, English, Cebuano/Bisaya, Ilocano, Hiligaynon, others | Yes | Families in Cebu and Davao need Bisaya |
| Live-in or live-out; preferred rest day | Yes | Avoids mismatches |
| Expected salary in ₱ | Yes | Must be at or above the regional minimum |
| Available start date | Yes | Avoids no-shows |
| Work history with **past employer's email for confirmation** | At least one entry | Employer-confirmed history is the main differentiator |
| Emergency contact | Yes | Safety |
| Consent: Data Privacy Act notice, terms, "I am 18 or older" | Yes | RA 10173 and RA 10911 (age kept private) |

### Employer registration
| Field | Required | Why |
|---|---|---|
| Email (OTP), name, mobile number, city | Yes | Account security |
| Live photo with ID ("Verified Employer") | Yes, before contacting nannies | Protects nannies from fake offers; two-way trust |
| Household: number and ages of children, pets, other household members | Yes | Matching and safety |
| Job details: duties, live-in or live-out, own room, schedule, rest day | Yes | Matches RA 10361 terms |
| Offered salary in ₱ | Yes | Blocked below the regional minimum |
| Benefits: SSS, PhilHealth, Pag-IBIG, 13th-month pay | Yes (checklist) | Legally required; shown to nannies |

### Platform features
- Contact only fully verified nannies, through in-app chat, with "Never pay to apply" and "Don't send money" warnings.
- Interview scheduling with reminders; repeated no-shows lower a reliability indicator.
- Kasambahay Law contract generator, including the cash-advance clause.
- Reviews on both sides after a hire, moderated by admins and open to reply.
- Report a user; admins can suspend accounts.
- Job posts can't include age, gender or appearance requirements.
- v2: payroll and cash-advance log, Bisaya interface, NBI clearance check, licensed agency partners for overseas jobs.

## 6. Collecting first-hand evidence

Aim for **5 families and 5 nannies**. Record answers anonymously (first name or initials only) and with their permission.

### Interview script: families
1. How did you find your current or last yaya? (Facebook group, agency, referral, app)
2. What was the hardest part of hiring?
3. Have you ever had a bad experience? What happened? (no-show, left without notice, cash advance, theft, false experience)
4. How did you check her identity and references?
5. Did you know the minimum wage and the benefits you owe (SSS, PhilHealth, Pag-IBIG, 13th-month pay)?
6. Would you use an app where every nanny is ID-verified and her past employers have confirmed her history? What would you pay for it?

### Interview script: nannies and kasambahay
1. How did you find your current or last job?
2. Have you seen a job offer that was fake, or that asked you to pay a fee?
3. Were you paid at least the minimum wage, on time, with a weekly rest day?
4. What would make you trust a new employer?
5. Would you be willing to verify your ID with a live photo if it got you more job offers?
6. What would stop you from using an app like this? (phone, data, language, fear of sharing ID)

### Quick survey (Google Forms)
1. I am a: family hiring / nanny or kasambahay
2. City
3. How I find help or work: Facebook / agency / referral / app / other
4. Biggest problem when hiring or job hunting (pick up to 2)
5. How much do you trust Facebook groups for hiring? (1–5)
6. Would ID verification make you more likely to use an app? (yes / no / maybe)

## Sources

- [How to hire a yaya in the Philippines, Pinoyaya](https://pinoyaya.com/blog/how-to-hire-a-yaya-philippines)
- [Hiring a yaya from abroad, Pinoyaya](https://pinoyaya.com/blog/hiring-a-yaya-from-abroad-ofw-guide)
- [Kasambahay app vs maid agency, MaidProvider](https://www.maidprovider.ph/humanplus/kasambahay-app-vs-maid-agency-philippines)
- [Kazam connects homeowners with "right" helpers, BusinessWorld](https://www.bworldonline.com/?p=676913)
- [Kazam PH: connecting homeowners and kasambahay, Ateneo](https://arete.ateneo.edu/connect/kazam-ph-connecting-homeowners-and-kasambahay)
- [HelperPlace reviews, Trustpilot](https://uk.trustpilot.com/review/www.helperplace.com)
- [Are applicants' profiles moderated by HelperChoice?](https://intercom.help/helperchoice-6a6e12dc0fe0/en/articles/11013114-are-the-applicants-profiles-moderated-and-selected-by-helperchoice)
- [Housekeeper.com reviews, Trustpilot](https://nz.trustpilot.com/review/housekeeper.com)
- [Unpaid cash advance to household helper, Respicio](https://www.respicio.ph/commentaries/unpaid-cash-advance-to-household-helper-legal-options-philippines)
- [Kasambahay wage claims, Respicio](https://www.respicio.ph/commentaries/kasambahay-wage-claims-in-the-philippines-employer-rights-and-records-explained)
- [Hiring a helper or yaya in Cebu, LiveInPH](https://liveinph.com/hiring-helper-yaya-cebu-expat-kasambahay)
- [Yaya problems, Tina in Manila](https://tinainmanilasitebackup.wordpress.com/category/yaya-problems/)
- [DOLE to assist underpaid household helpers, Philstar](https://www.philstar.com/nation/2025/01/05/2411917/dole-assist-underpaid-household-helpers)
- [Wage hike for domestic workers eyed, BusinessWorld](https://bworldonline.com/top-stories/2026/01/13/723758/wage-hike-for-domestic-workers-eyed/)
- [IDWF Philippine mapping for care work (PDF)](https://idwfed.org/wp-content/uploads/2025/05/IDWF-Philippine-Mapping-for-Care-Work.pdf)
- [ILO: analysis of the situation of Filipino domestic workers](https://www.ilo.org/media/324291/download)
- [DOLE cases involving kasambahay, Respicio](https://www.respicio.ph/commentaries/dole-cases-involving-kasambahays-rights-of-household-workers-explained)
- [How to spot a fake job offer asking for placement fees, Respicio](https://www.respicio.ph/commentaries/how-to-spot-and-report-a-fake-job-offer-asking-for-placement-fees-1)
- [HR firm warns of Facebook page using its credentials, Inquirer](https://newsinfo.inquirer.net/?p=1422158)
- ["Mukhang nurse, hindi kasambahay": job posting draws flak, Interaksyon](https://interaksyon.philstar.com/trends-spotlights/2023/03/03/244534/job-posting-domestic-helper-flak/)
- [Kryz Uy reacts to yaya Q&A vlog, Cebu Daily News](https://cebudailynews.inquirer.net/394481/kryz-uy-reacts-to-yaya-qa-vlog)
- [Ivana Alawi "maid for a day", GMA](https://www.gmanetwork.com/entertainment/showbiznews/ivana-alawi-naging-maid-for-a-day-nina-viy-cortez-at-cong-tv/135282)
- [Why a Filipina nanny's post got over 11 million views, Khaleej Times](https://khaleejtimes.com/world/gulf/video-why-a-filipina-nannys-post-got-over-11-million-views?amp=1)
- [Using TikTok, a domestic worker in Lebanon inspires kindness, CS Monitor](https://proof.csmonitor.com/World/2021/0305/Using-TikTok-a-domestic-worker-in-Lebanon-inspires-kindness)
- [Yayas and social media, Mommy Mundo](https://mommymundo.com/?p=1821)
- [Where to find a kasambahay, Modern Parenting](https://modernparenting.onemega.com/where-to-find-kasambahay/)
