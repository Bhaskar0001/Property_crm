# 📖 Real Estate Property OS — Comprehensive API Reference

Base URL: `https://your-domain.com/api/v1`

---

## 1. Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/login` | Staff email/password login (returns JWT cookie & user) | No |
| `POST` | `/auth/logout` | Clears staff session cookie | Yes |
| `GET` | `/auth/me` | Fetch active authenticated staff user details | Yes |
| `POST` | `/auth/change-password` | Force password reset on initial credential change | Yes |
| `POST` | `/auth/refresh` | Refresh expired access token | No |

---

## 2. Customer Portal & OTP Auth (`/api/v1/customer`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/customer/auth/send-otp` | Generate & dispatch 6-digit cryptographic OTP via Resend | No |
| `POST` | `/customer/auth/verify-otp` | Verify OTP code and return customer JWT session | No |
| `POST` | `/customer/auth/logout` | Terminate customer portal session | Yes (Customer) |
| `GET` | `/customer/me` | Customer profile, acquisition criteria, and preferences | Yes (Customer) |
| `PUT` | `/customer/me` | Update customer criteria (budget, bedrooms, locations) | Yes (Customer) |
| `GET` | `/customer/favorites` | Saved properties list with full populated metadata | Yes (Customer) |
| `POST` | `/customer/favorites/:id` | Add property to saved favorites | Yes (Customer) |
| `DELETE` | `/customer/favorites/:id` | Remove property from saved favorites | Yes (Customer) |
| `GET` | `/customer/enquiries` | Customer's active inquiries and viewing appointments | Yes (Customer) |
| `POST` | `/customer/enquiries` | Submit inquiry / viewing request (Auto-creates CRM Lead) | Optional |

---

## 3. Public Website API (`/api/v1/public`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/public/properties` | Search & filter published properties (Zero 404 rule) | No |
| `GET` | `/public/properties/:slug` | Full public property details, specs, BER rating, images | No |
| `GET` | `/public/featured` | Curated featured listings for homepage hero carousel | No |
| `GET` | `/public/countries` | Active country destinations | No |
| `GET` | `/public/property-types` | Active property categories (Apartments, Villas, etc.) | No |
| `GET` | `/public/sitemap` | Dynamic XML/JSON sitemap for Google indexing | No |

---

## 4. Property Management (`/api/v1/properties`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/properties` | Filterable, paginated property catalog for CRM/Admin | Staff |
| `GET` | `/properties/:id` | Full admin property record with internal notes | Staff |
| `POST` | `/properties` | Create new listing draft | Staff |
| `PUT` | `/properties/:id` | Update property attributes, pricing, specs, and SEO | Staff |
| `DELETE` | `/properties/:id` | Soft-delete property | Admin |

---

## 5. Media & Documents (`/api/v1/media`, `/api/v1/documents`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/media/upload` | Multipart image upload → WebP compression → Cloudflare R2 | Staff |
| `PUT` | `/media/reorder` | Drag-and-drop sort order update | Staff |
| `DELETE` | `/media/:id` | Delete media asset from R2 and database | Staff |
| `POST` | `/documents/upload` | Upload floor plans, brochures, and legal deeds | Staff |
| `GET` | `/documents/property/:id` | Fetch documents by visibility (public, internal, legal) | Staff |

---

## 6. CRM & Lead Management (`/api/v1/leads`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/leads` | Filterable lead pipeline table with stage and source filters | Staff |
| `GET` | `/leads/:id` | Full lead view with audit timeline and tasks | Staff |
| `POST` | `/leads` | Create lead manually | Staff |
| `PATCH` | `/leads/:id/stage` | Transition lead stage (Kanban drag-and-drop) | Staff |
| `PATCH` | `/leads/:id/assign` | Assign lead to sales advisor or telecaller | Staff |
| `GET` | `/leads/:id/matching` | Deterministic property matching against requirements | Staff |
| `POST` | `/leads/:id/tasks` | Create follow-up reminder task with due date | Staff |
| `PATCH` | `/leads/:id/tasks/:taskId` | Mark follow-up task completed or update | Staff |

---

## 7. Calling Desk / Telecaller Workflow (`/api/v1/telecaller`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/telecaller/queue` | Priority-ranked calling queue based on urgency and SLA | Staff |
| `POST` | `/telecaller/disposition` | Record call disposition, outcome, notes, and auto-update stage | Staff |

---

## 8. Viewings & Appointments (`/api/v1/viewings`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/viewings` | Filterable list of viewing appointments | Staff |
| `GET` | `/viewings/calendar` | Date-ranged calendar schedule for Month/Week views | Staff |
| `POST` | `/viewings` | Book new viewing with client, property, and assigned advisor | Staff |
| `PATCH` | `/viewings/:id/status` | Confirm, Complete, Reschedule, Cancel, or mark No-Show | Staff |

---

## 9. Offers & Deal Pipeline (`/api/v1/offers`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/offers` | Filterable offers table with asking price variance calculation | Staff |
| `POST` | `/offers` | Register formal purchase offer with terms & conditions | Staff |
| `PATCH` | `/offers/:id/status` | Issue counter offer, accept offer, reject, or withdraw | Staff |
| `GET` | `/offers/deals` | Conveyancing pipeline for accepted offers (Milestone stages) | Staff |
| `PATCH` | `/offers/:id/deal-stage` | Advance legal conveyancing stage | Staff |

---

## 10. WhatsApp Business Cloud API (`/api/v1/whatsapp`, `/api/v1/webhooks`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/whatsapp/conversations` | Multi-agent conversation list with unread counters | Staff |
| `GET` | `/whatsapp/conversations/:id/messages` | Message bubble history with delivery & read receipts | Staff |
| `POST` | `/whatsapp/send` | Transmit text message to customer via Meta API | Staff |
| `POST` | `/whatsapp/send-property` | Dispatch rich property card with image & preview link | Staff |
| `GET` | `/whatsapp/templates` | Approved WhatsApp message templates | Staff |
| `POST` | `/whatsapp/campaigns` | Bulk broadcast campaign to filtered customer segments | Staff |
| `GET` | `/webhooks/whatsapp` | Meta webhook verification endpoint | No |
| `POST` | `/webhooks/whatsapp` | Inbound message listener & delivery receipt webhook | No |

---

## 11. Analytics & Bulk Import/Export (`/api/v1/analytics`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/analytics/dashboard` | Real MongoDB aggregation metrics and 6-month trends | Staff |
| `GET` | `/analytics/properties` | Property breakdown by status, country, price brackets | Staff |
| `GET` | `/analytics/leads` | Lead funnel conversion rates and velocity | Staff |
| `GET` | `/analytics/staff` | Staff leaderboard (deals won, sales volume, viewings) | Staff |
| `GET` | `/analytics/export/:type` | Download CSV export of properties or leads | Staff |
| `POST` | `/analytics/import/properties` | Batch import properties with duplicate validation | Staff |
| `POST` | `/analytics/import/leads` | Batch import leads and contacts | Staff |

---

## 12. AI Intelligence Engine (`/api/v1/ai`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/ai/generate-description` | Generate high-end editorial copy via Google Gemini | Staff |
| `POST` | `/ai/extract-requirements` | Extract structured budget, bedrooms, locations from notes | Staff |
| `POST` | `/ai/summarize-conversation` | Generate concise summary and action points from chat | Staff |
| `POST` | `/ai/search` | Natural language property search ("3 bed near Dublin under 800k") | Staff |
| `POST` | `/ai/dashboard-query` | Plain-English Q&A answering metrics questions from DB | Staff |
