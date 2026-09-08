<<<<<<< HEAD
# S.P. AGRO

Next.js application for S.P. AGRO's agricultural machinery, laser-cutting portfolio, enquiries, and protected content administration, backed by InsForge.

## Run locally

1. Copy `.env.example` to `.env.local` and add the InsForge base URL, anonymous key, and server-only admin key.
2. Authenticate and link an InsForge project with `npx @insforge/cli login` and `npx @insforge/cli link`, then run `npx @insforge/cli db import database/schema.sql`.
3. Create public Storage buckets `product-images`, `laser-images`, and `gallery-images`; create `enquiry-files` as private.
4. Create an Auth user in InsForge, then add an admin profile (replace the UUID):

```sql
insert into public.profiles (id, role) values ('AUTH_USER_UUID', 'admin');
```

5. For Google admin login, enable the Google provider in InsForge and register this callback URL:

```text
http://localhost:3000/api/auth/callback
```

Use the production site URL with the same path after deployment. A Google account must also have an `admin` row in `public.profiles` before it can open the dashboard.

6. Run `npm install`, then `npm run dev`.

## Content workflow

- Sign in at `/admin/login`.
- Add product categories first, then products, descriptions, features and specifications. Keep products unpublished until ready.
- Upload actual S.P. AGRO photography to InsForge Storage, create corresponding product, gallery or laser-project image records, then publish the parent record.
- Update the single `site_settings` row with the verified telephone, WhatsApp number, email, business hours and Google Maps URL. No contact facts are hardcoded.

## InsForge security

Public users can read only published public content. Admin operations require an InsForge Auth user with an `admin` entry in `profiles`. Public enquiries are accepted only through the server-side route, which uses `INSFORGE_ADMIN_KEY`; that key is never sent to the browser. File requests validate size and type before entering the private `enquiry-files` bucket.

## Deployment

Create a Vercel project, add every environment variable from `.env.example` in Vercel's Environment Variables settings, and deploy. Set `NEXT_PUBLIC_SITE_URL` to the production canonical URL. Run the InsForge SQL schema and configure Storage before accepting public enquiries.

## Assets

The supplied machinery photographs were not available inside this workspace at build time. Add them through the configured Storage workflow; the public cards and product detail presentation automatically use image records without substituting fabricated machinery images.
=======
# spagro
>>>>>>> 32e2a301fed5c80402e85931c1d708dca554adf8
