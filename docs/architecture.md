# LocalEdge Architecture v1.0

## Vision

LocalEdge is India's AI-powered hyperlocal business growth platform. It enables small and medium businesses
to compete with large chains by automating customer engagement, review management, WhatsApp marketing,
loyalty programs, and analytics — all powered by AI and delivered through a multi-tenant SaaS model.

**Target**: 100 businesses in Year 1 → 1M+ businesses by Year 5

---

## System Architecture (ASCII)

```
┌────────────────────────────────────────────────────────────────────┐
│                        LOCALEDGE PLATFORM                          │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │  apps/web    │  │  apps/admin  │  │  External Webhooks   │    │
│  │  Next.js 15  │  │  Next.js 15  │  │  (WA/Payment/GBP)    │    │
│  │  Port 3000   │  │  Port 3002   │  └──────────┬───────────┘    │
│  └──────┬───────┘  └──────┬───────┘             │                 │
│         │                 │                     │                 │
│         └────────┬────────┘                     │                 │
│                  │                              │                 │
│         ┌────────▼──────────────────────────────▼──────────┐     │
│         │              apps/api (NestJS)                    │     │
│         │                                                   │     │
│         │  Auth  Business  Reviews  WhatsApp  AI  Payments  │     │
│         │  CRM   Offers    QR       Analytics  Webhooks     │     │
│         │  FeatureFlags   ProviderConfig  CrossPromotion    │     │
│         └──────────────────────┬────────────────────────────┘     │
│                                │                                   │
│         ┌──────────────────────┼──────────────────────────┐       │
│         │                      │                          │       │
│  ┌──────▼──────┐  ┌────────────▼────┐  ┌────────────────▼──┐    │
│  │  PostgreSQL │  │     Redis       │  │   BullMQ Queues    │    │
│  │  (Prisma)   │  │  (Cache/Queues) │  │  Review/WA/Pay     │    │
│  └─────────────┘  └─────────────────┘  └────────────────────┘    │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    PROVIDER LAYER (Plugin Architecture)      │  │
│  │                                                             │  │
│  │  WhatsApp: Meta Cloud | Gupshup | Twilio | Interakt | AiSensy│ │
│  │  AI/LLM:   OpenAI | Anthropic | Gemini | Groq | Ollama       │ │
│  │  Payment:  Razorpay | Cashfree | PhonePe | Stripe            │ │
│  │  SMS:      MSG91 | Twilio | Fast2SMS                         │ │
│  │  Email:    Resend | Mailgun | SendGrid                       │ │
│  │  Storage:  Cloudflare R2 | AWS S3 | GCS                     │ │
│  │  Maps:     Google Maps | Mapbox | OpenStreetMap              │ │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
localedge/
├── apps/
│   ├── web/          # Next.js 15 - Business dashboard (dark theme, orange accent)
│   ├── api/          # NestJS - Main REST API with Socket.IO
│   └── admin/        # Next.js 15 - Super admin panel
├── packages/
│   ├── shared/       # TypeScript types, DTOs, enums, constants
│   ├── database/     # Prisma schema + client
│   ├── ui/           # Shared ShadCN-style components
│   ├── ai-gateway/   # Multi-provider AI abstraction
│   └── config/       # Shared ESLint, TypeScript configs
├── infrastructure/
│   ├── k8s/          # Kubernetes manifests
│   ├── docker/       # Docker configs
│   └── terraform/    # IaC for cloud infra
└── docs/             # Architecture docs
```

---

## Multi-Tenancy

LocalEdge uses a **shared database, row-level multi-tenancy** model:

- Every table has a `tenant_id` foreign key
- JWT tokens include `tenantId` claim
- All queries are automatically scoped: `WHERE tenant_id = $tenantId`
- Tenant settings stored in `tenants.settings JSONB`
- Provider configs (WhatsApp, AI, Payment) are per-tenant, stored encrypted in DB

**Tenant Isolation Layers:**
1. JWT middleware validates tenant context on every request
2. Service layer enforces tenant scoping on all DB queries
3. Provider configs are isolated per tenant — different tenants can use different WhatsApp providers

---

## Database Schema Overview

**Core**: tenants → users → businesses → branches → staff
**CRM**: customers (per business), loyalty programs, loyalty transactions
**Reviews**: reviews (multi-platform), review campaigns
**WhatsApp**: configs, templates, conversations, messages, campaigns, flows
**AI**: provider configs, routing rules, usage logs
**Providers**: generic provider_configs table for any integration
**Commerce**: offers, coupons, payments, payment configs, QR codes
**Platform**: feature flags, webhooks, subscriptions, plans, events

**Key design decisions:**
- Provider API keys stored encrypted (AES-256-GCM) in JSONB columns
- `provider_configs` table allows adding new provider types without schema changes
- `ai_routing_rules` enables per-use-case provider routing
- `events` table for event sourcing / audit trail

---

## API Design

```
Base URL: /api/v1

Auth:
  POST /auth/otp/send
  POST /auth/otp/verify
  POST /auth/refresh
  GET  /auth/me

Businesses:
  CRUD /businesses
  GET  /businesses/:id/stats

Reviews:
  GET  /businesses/:id/reviews
  GET  /businesses/:id/reviews/analytics
  PUT  /businesses/:id/reviews/:rid/reply
  POST /businesses/:id/reviews/:rid/ai-reply
  POST /businesses/:id/reviews/:rid/analyze-sentiment

WhatsApp:
  POST /whatsapp/send/text
  POST /whatsapp/send/template
  GET  /whatsapp/conversations
  GET  /whatsapp/conversations/:id/messages
  POST /whatsapp/campaigns/:id/launch
  POST /whatsapp/webhook/:tenantId  (public - from WA provider)

AI:
  POST /ai/complete
  GET  /ai/usage

Payments:
  POST /payments/order
  POST /payments/verify
  POST /payments/webhook/:tenantId  (public)

Admin:
  POST /admin/provider-config/ai
  POST /admin/provider-config/whatsapp
  POST /admin/provider-config/payment
  POST /admin/provider-config/ai/routing
  GET  /admin/provider-config/*
  POST /feature-flags
  GET  /feature-flags/check?flag=xyz
```

---

## AI Gateway Design

The AI Gateway (`packages/ai-gateway`) provides a unified interface over multiple LLM providers:

```typescript
// Usage: just call complete() with tenantId + useCase
const response = await aiService.complete({
  tenantId: 'abc',
  useCase: 'review_reply',    // Routes based on ai_routing_rules table
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: reviewContent },
  ],
});

// Gateway:
// 1. Looks up ai_routing_rules for tenant + use_case
// 2. Decrypts API key from ai_provider_configs
// 3. Calls the right provider (OpenAI/Anthropic/Gemini/etc.)
// 4. Falls back to fallback_provider on failure
// 5. Logs usage to ai_usage_logs (cost tracking)
```

**Supported Providers**: OpenAI, Anthropic Claude, Google Gemini, Groq, Ollama (local), DeepSeek, Mistral, Azure OpenAI

**Routing rules are per-use-case:**
- `review_reply` → Claude claude-3-5-haiku (best for empathetic writing)
- `sentiment_analysis` → GPT-4o-mini (fast + cheap)
- `chat` → Groq llama-3.3-70b (fast response)
- `content_generation` → GPT-4o (high quality)

---

## WhatsApp Engine

**Provider Factory Pattern** — zero code changes to switch providers:

```typescript
// Factory reads from DB at runtime
const { provider, config } = await factory.getProviderForTenant(tenantId);

// All providers implement the same interface
await provider.sendTextMessage(to, text, config);
await provider.sendTemplateMessage(to, template, language, components, config);
await provider.handleWebhook(payload, config);
await provider.validateWebhookSignature(rawBody, signature, config);
```

**Supported Providers**: Meta Cloud API, Gupshup, Twilio, Interakt, AiSensy, 360Dialog

**Campaign System** (BullMQ backed):
1. Admin creates campaign with template + audience filter
2. Campaign queued to BullMQ `whatsapp-campaign` queue
3. Processor fetches matching customers from DB
4. Sends template messages with rate limiting (80 msg/sec)
5. Updates campaign stats in real-time

---

## Provider Plugin System

**Critical principle**: No provider is hardcoded. All integrations follow this pattern:

1. **Interface** — defines the contract (e.g., `IWhatsAppProvider`)
2. **Implementations** — one class per provider, implementing the interface
3. **Factory** — reads active provider from `provider_configs` table, returns correct implementation
4. **Config encryption** — provider API keys encrypted with AES-256-GCM before DB storage
5. **Admin UI** — tenant admins set providers via `/admin/provider-config` endpoints

**Adding a new provider** (e.g., new WhatsApp provider "AiSensy"):
1. Create `aisensy.provider.ts` implementing `IWhatsAppProvider`
2. Register in `WhatsAppProviderFactory`
3. Zero other changes needed

---

## Security Model

1. **Authentication**: JWT (7d) + Refresh Token (30d) + OTP via phone
2. **Authorization**: Role-based (SUPER_ADMIN, TENANT_ADMIN, BUSINESS_OWNER, MANAGER, STAFF)
3. **Multi-tenancy**: All queries scoped by `tenantId` from JWT
4. **Encryption**: Provider API keys encrypted with AES-256-GCM (key from env)
5. **Webhook security**: HMAC-SHA256 signature validation per provider
6. **Rate limiting**: ThrottlerModule — 100 req/min per IP
7. **CORS**: Configured to allow only known frontend origins
8. **Helmet**: Security headers on all responses

---

## Queue System (BullMQ + Redis)

| Queue | Purpose | Concurrency |
|-------|---------|-------------|
| `review-reply` | AI reply generation + GBP posting | 10 |
| `whatsapp-campaign` | Bulk WA campaign sending | 5 |
| `whatsapp-message` | Individual WA messages (retry) | 20 |
| `analytics` | Metric aggregation | 5 |
| `webhook-delivery` | Outbound webhook delivery (3 retries) | 10 |
| `payment-trigger` | Post-payment automation (loyalty, review, WA) | 10 |
| `email` | Transactional email | 20 |
| `sms` | OTP + transactional SMS | 20 |
| `gbp-sync` | Google Business Profile sync | 3 |

---

## Scaling Strategy

### 100 Businesses (MVP)
- Single region: Mumbai (ap-south-1)
- 2x API pods, 2x Web pods
- Single PostgreSQL RDS instance
- Redis ElastiCache (single node)
- Elasticsearch for search

### 10,000 Businesses
- Read replicas for PostgreSQL
- Redis Cluster
- API pods: 5-10 (HPA on CPU)
- Separate queue workers (dedicated pods)
- CDN for static assets (Cloudflare)

### 100,000 Businesses
- Database sharding by tenant_id
- Multi-region: Mumbai + Hyderabad
- Separate microservices for high-load modules (WhatsApp engine, AI gateway)
- Message broker migration: Kafka for event streaming
- Elasticsearch cluster (3+ nodes)

### 1,000,000 Businesses
- Full microservices architecture
- Global CDN
- Multi-region active-active
- Separate AI inference clusters
- Real-time analytics pipeline (Kafka → ClickHouse)
- WhatsApp: dedicated server per 100k businesses

---

## Development Roadmap

### Phase 1 (Months 1-3): Foundation ✅
- Monorepo setup (Turborepo + pnpm)
- Database schema (PostgreSQL + Prisma)
- NestJS API with all core modules
- Next.js web dashboard
- Provider plugin system
- AI gateway (OpenAI + Anthropic + Gemini + Groq)
- WhatsApp integration (Meta Cloud + Gupshup)
- Review management + AI replies
- Razorpay + Cashfree payments
- Loyalty programs
- QR codes
- Docker + Kubernetes

### Phase 2 (Months 4-6): Growth Features
- Google Business Profile sync (GBP API)
- WhatsApp Flows (interactive journeys)
- Advanced campaign analytics
- Cross-promotion network
- Multi-language support (Hindi, Marathi, Tamil, Telugu)
- Mobile app (React Native)
- Elasticsearch-powered search

### Phase 3 (Months 7-12): Scale & Intelligence
- AI-powered customer segmentation
- Predictive analytics
- Auto-reply WhatsApp bot with NLP
- Integration marketplace
- Franchise/chain management
- B2B API for partners
- ISO 27001 certification

---

## Team Structure

```
Engineering:
  Backend Lead (NestJS/PostgreSQL)
  2x Backend Engineers
  Frontend Lead (Next.js)
  1x Frontend Engineer
  DevOps/Platform Engineer
  AI/ML Engineer

Product:
  Product Manager
  UI/UX Designer

Business:
  CEO/Founder
  Sales (2x)
  Customer Success
```

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Monorepo | Turborepo + pnpm | Fast builds, workspace management |
| Backend API | NestJS + TypeScript | Type-safe, decorator-based, modular |
| Frontend | Next.js 15 + React 19 | SSR, App Router, fast |
| Database | PostgreSQL + Prisma | Relational, type-safe ORM |
| Cache/Queue | Redis + BullMQ | Reliable job processing |
| Search | Elasticsearch | Full-text, geo search |
| Auth | JWT + OTP | Mobile-first India market |
| AI | Multi-provider gateway | No vendor lock-in |
| WhatsApp | Multi-provider | Business continuity |
| Container | Docker + Kubernetes | Scale from 100 to 1M |
| CI/CD | GitHub Actions | Automated deployments |
| Monitoring | Prometheus + Grafana | Observability |
| APM | Sentry | Error tracking |
