# Vendora Multi-Tenant Headless Commerce Engine

Vendora is a next-generation headless commerce platform engineered on top of Next.js 16 (App Router), React 19, Tailwind CSS v4, and PostgreSQL using Drizzle ORM. Designed with an offline-first philosophy and a multi-tenant database core, it orchestrates multiple independent storefront subdomains, automated workflows, and robust inventory systems.

## Key Architectural Pillars

- **Multi-Tenant Core**: Isolation of independent merchant spaces through domain rewrites and unified PostgreSQL tables.
- **Symphony Router**: Dynamic middleware rewrites resolving subdomains and custom directories cleanly.
- **Fluxio Automation**: Real-time event-driven outbound pipelines triggering signatures-signed webhooks on order statuses.
- **Atomic Stock Allocation**: Safe and race-condition free inventory reservation using PostgreSQL row-level locks.
- **Robust Security**: Enforced multi-factor authentication (TOTP), secret API key management, and session monitoring.

## Stack & Prerequisites

- **Runtime**: Node.js v20+
- **Database**: PostgreSQL v15+
- **Cache**: Redis v6+
- **Package Manager**: pnpm

## Getting Started

First, configure your environment variables in `.env` then install dependencies:

```bash
pnpm install
```
