# Avyora

Premium jewellery e-commerce storefront for the Avyora PRD — a mobile-first, editorial shopping experience with catalogue, cart, checkout, account and a back-office console.

## Run locally

```bash
cd avyora
npm install
npm run dev:all
```

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin portal: [http://localhost:3001/admin](http://localhost:3001/admin)

`npm run dev` starts only the storefront on 3000. `npm run dev:admin` starts only the admin host on 3001. Visiting `/admin` on 3000 redirects to 3001.

## Demo accounts

- Customer: any email + password (min 4 characters) on port 3000
- Admin: `admin@avyora.com` / `avyora123` — opens the portal on port 3001

Coupons: `AVYORA10`, `FESTIVE15`, `WELCOME500`

## What this MVP includes

- Home with hero, collections, bestsellers, campaign and new arrivals
- Shop with jewellery facets (category, metal, price, stock, sort)
- Collection and product pages (variants, certificates, care, reviews)
- Search, wishlist, persistent bag
- Guest checkout with simulated Razorpay payment
- Order confirmation, tracking id and admin order lifecycle
- SEO: metadata, sitemap, robots, canonical product URLs

## Production target (from the PRD)

Next.js storefront → NestJS + PostgreSQL/Prisma → Redis/BullMQ, Sanity CMS, Cloudinary, Meilisearch, Razorpay (server-side order + webhook verification). This app is the visual commerce layer you can extend into that modular monolith.
