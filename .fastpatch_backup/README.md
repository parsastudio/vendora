# ⚡ Vendora Multi-Tenant Commerce Engine

> **An enterprise-grade, multi-tenant headless commerce platform engineered with Next.js 16, React 19, Tailwind CSS v4, and PostgreSQL via Drizzle ORM.**  
> Built to run hundreds of isolated merchant storefronts with atomic inventory safety, visual event-driven automation pipelines, and zero-latency headless integration.

---

[![Next.js 16](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

---

## 🎯 What is Vendora & Why Build It?

Standard e-commerce engines like Shopify or WooCommerce come with severe tradeoffs: restrictive cloud vendor lock-in, recurring platform fees that scale with revenue, rigid database schemas, and clumsy integrations for multi-brand organizations. On the other hand, starting a custom multi-tenant commerce backend from scratch presents massive architectural hurdles: preventing inventory race conditions during flash sales, maintaining clean domain routing across merchant subdomains, and building flexible order event integrations.

**Vendora was engineered to answer a core architectural question:**  
_What if a single unified cluster could run completely isolated merchant storefronts with custom theme tokens, eliminate overselling through row-level transactional database locking, provide a visual canvas for automated webhooks, and expose hardened REST APIs without sacrificing raw speed or Core Web Vitals?_

The result is a headless commerce engine delivering sub-second TTFB, sub-millisecond edge routing, and a clean domain architecture capable of orchestrating enterprise-scale retail operations.

---

## 🏛️ Under the Hood: Architecture Highlights

Vendora is structured around strict software engineering patterns prioritizing isolation, transactional reliability, and raw execution velocity:

### 1. Symphony Multi-Tenant Routing Engine

Merchant spaces are strictly isolated across custom subdomains and custom domains. The routing proxy (`src/proxy.ts` / `src/middleware.ts`):

- Resolves tenant identities dynamically from hostname headers at the edge network boundary.
- Transparently rewrites inbound traffic to internal tenant directories (`/[domain]/...`) without client-side redirects or URL pollution.
- Injects immutable `x-tenant-domain` headers into API routes to enforce automated tenant boundaries on every single query.

### 2. Atomic Row-Level Stock Allocations

Flash-sales and high-concurrency checkouts are protected against overselling and race conditions:

- Stock verification and reservation transactions lock physical inventory rows using PostgreSQL's `SELECT ... FOR UPDATE`.
- Deductions execute atomically across multiple distributed fulfillment hubs.
- If payment verification fails or the transaction aborts, locks release automatically, guaranteeing zero phantom inventory or database inconsistencies.

### 3. Fluxio Visual Event Automation

Transactional lifecycle events trigger outbound webhook integrations configured visually on an interactive node canvas:

- Built on top of **React Flow**, allowing merchants to map triggers (`order.created`, `order.paid`, `product.created`) to external URLs.
- Outbound payloads are cryptographically sealed with an **HMAC-SHA256 signature** (`X-Vendora-Signature`) derived from a tenant-unique signing key to guarantee authenticity and prevent tampering.
- Complete execution history and HTTP response status codes are captured inside structured, append-only audit tables.

### 4. High-Precision Monetary Engine & BOGO Processor

Avoids JavaScript binary floating-point representation bugs by isolating financial math into dedicated domain services:

- All financial computations (gross volume, tax levies, discounts, logistics) execute via **Decimal.js** arbitrary-precision arithmetic.
- Dynamic Buy-One-Get-One-Free (BOGO) rules evaluate across multiple line-items in real-time, matching sorted price pairs deterministically.
- Guest cart states maintained in localStorage merge seamlessly with server-side persistent database carts upon customer authentication.

### 5. Hardened Security & RBAC Infrastructure

- **Hardware-Ready 2FA (RFC 6238 TOTP):** Native time-based one-time password generation and verification running directly via Node.js Web Crypto.
- **Hashed API Key Vault:** Developer access tokens (`vk_live_...`) are SHA-256 hashed in the database; only a 12-character preview is stored in plaintext.
- **Centralized Session Telemetry:** Real-time tracking of active user-agent tokens stored in Redis with remote, one-click session revocation.

---

## 🔥 Real Engineering Challenges & Battle Scars

Building a high-throughput multi-tenant engine required solving critical architectural and concurrency challenges:

### Challenge 1: The Flash-Sale Inventory Race Condition

> **The Problem:** In high-concurrency flash sales, multiple shoppers simultaneously checkout the last remaining stock of a variant. Traditional ORM find-and-update patterns caused negative warehouse quantities and order fulfillment crises.  
> **The Solution:** Engineered an **Atomic Allocation Service** within a PostgreSQL transaction. Using raw row-level locks (`.for('update')`) on target variant inventory, concurrent transactions are forced into a serialized evaluation queue. If stock dips below requested amounts, the transaction reverts cleanly with zero partial state commits.

### Challenge 2: Accidental Tenant Mutation Bleed in Nested Entities

> **The Problem:** When updating parent products and replacing variant arrays, an attacker could supply product IDs or variant IDs belonging to another tenant, overwriting foreign catalog data without triggering primary key constraints.  
> **The Solution:** Implemented strict **Dual-Predicate Enforcement** across all mutation handlers. Product transactions first verify ownership under the session's verified `tenantId`. Variant deletions and updates are constrained strictly within foreign-key sets confirmed to belong to that verified parent product.

### Challenge 3: Next.js App Router Hydration Mismatches in Cart Drawers

> **The Problem:** Cart states persisted in browser storage caused hydration mismatches when rendered alongside server-rendered storefront components, leading to layout shifts and UI flash.  
> **The Solution:** Implemented safe subscription barriers via `useSyncExternalStore` and deferred mounting boundaries. Dynamic cart calculations validate against remote catalog endpoints asynchronously, while pre-calculated loading skeletons completely eliminate Cumulative Layout Shift (CLS).

### Challenge 4: Webhook Signature Replay & Tampering

> **The Problem:** Outbound merchant webhooks sending financial event notifications could be intercepted, spoofed, or replayed by malicious actors.  
> **The Solution:** Built a **Cryptographic Outbound Dispatcher** (`WorkflowEventEmitter`). Each tenant generates an isolated signing secret derived from a workspace salt. Outbound HTTP requests carry an `X-Vendora-Signature` header computed via HMAC-SHA256 over the exact stringified payload, allowing receiving servers to verify authenticity down to the bit.

---

## 🧩 Architectural Modules Breakdown

| Module                 | Core Responsibility                                        | Key Technologies                               |
| :--------------------- | :--------------------------------------------------------- | :--------------------------------------------- |
| **Symphony Router**    | Edge tenant resolution & multi-tenant subdomain rewrites   | Next.js Edge Middleware, Hostname Headers      |
| **Stock Allocator**    | Zero-race inventory locking & multi-warehouse reservations | Drizzle ORM, PostgreSQL `FOR UPDATE`           |
| **Fluxio Pipelines**   | Visual automation canvas & signed outbound webhooks        | React Flow, HMAC-SHA256, Node EventEmitter     |
| **Monetary Engine**    | Currency math, BOGO campaigns & tax allocations            | Decimal.js, Arbitrary Precision                |
| **Security Vault**     | TOTP 2FA, session tracking & developer API keys            | RFC 6238, Redis TTL Sessions, SHA-256          |
| **Metricon Analytics** | Retention cohort grids & funnel drop-off analytics         | PostgreSQL Aggregations, Recharts, Redis Cache |

---

## 📂 Architecture & Directory Layout

src/
├── app/ # Next.js 16 App Router
│ ├── (admin)/ # Tenant admin console (Analytics, Products, Orders, Staff)
│ ├── (store)/ # Dynamic storefront routes resolved per merchant domain
│ ├── api/ # Secure REST APIs (Admin endpoints, V1 Headless API, Webhooks)
│ ├── globals.css # Design tokens & Tailwind CSS v4 configuration
│ └── middleware.ts # Edge routing proxy delegating multi-tenant rewrites
├── features/ # Feature-Driven Architecture (Vertical Slices)
│ ├── analytics/ # Cohort retention, sales velocity, and abandoned cart metrics
│ ├── api-keys/ # Cryptographic developer token generator and hash validators
│ ├── auth/ # NextAuth credentials provider, session vault, and TOTP 2FA
│ ├── cart/ # High-precision cart math, BOGO engine, and Zustand state
│ ├── checkout/ # Multi-step checkout orchestrator and Stripe payment actions
│ ├── developer/ # REST sandbox runner, API docs, and outbound webhook manager
│ ├── inventory/ # Warehouse allocation service with PostgreSQL row-level locks
│ ├── orders/ # Order tracking, customer self-service returns, and invoices
│ ├── products/ # Variant managers, SKU generators, and category tree taxonomy
│ ├── staff/ # Role-based access control (RBAC) and team invitation tokens
│ ├── tenant/ # Domain resolvers, theme style injectors, and demo seeders
│ └── workflows/ # React Flow visual builder, event bus, and webhook dispatcher
├── lib/ # Shared infrastructure & utilities
│ ├── db/ # Drizzle ORM PostgreSQL schema definitions and migrations
│ ├── logger.ts # Redacted enterprise Pino logging instance
│ ├── redis.ts # Pooled Redis client for caching and session management
│ ├── s3.ts # AWS S3 presigned URL generator for secure asset uploads
│ └── stripe.ts # Stripe client for secure payment sessions
└── types/ # Strict TypeScript entity schemas and session extensions

---

## 💭 Senior Architect's Note

Vendora is not a cosmetic dashboard template; every network boundary, database transaction, row-level lock, and cryptographic hash was built to satisfy the operational demands of high-load enterprise commerce. It proves that a headless retail platform can be built with complete multi-tenant isolation, clean architectural separation, and uncompromising speed.
