# Screen Map

This document catalogs all the user interfaces for the Public Website and Admin/CRM application.

## 1. Public Website (`apps/web`)

| Screen | Route Path | Parent Section | Auth Required | Permissions Required | Phase |
|--------|------------|----------------|---------------|----------------------|-------|
| Home | `/` | Root | No | None | Phase 4 |
| Property Search / Listing | `/properties` | Properties | No | None | Phase 4 |
| Property Detail | `/properties/:slug` | Properties | No | None | Phase 4 |
| Country Page | `/country/:country-slug`| Countries | No | None | Phase 4 |
| Category Page | `/category/:slug` | Categories | No | None | Phase 4 |
| Customer Login (OTP) | `/login` | Auth | No | None | Phase 4 |
| Customer Dashboard | `/dashboard` | Dashboard | Yes (Cust) | None | Phase 5 |
| Customer Profile | `/dashboard/profile` | Dashboard | Yes (Cust) | None | Phase 5 |
| My Favorites | `/dashboard/favorites` | Dashboard | Yes (Cust) | None | Phase 5 |
| My Enquiries | `/dashboard/enquiries` | Dashboard | Yes (Cust) | None | Phase 5 |
| My Viewing Requests | `/dashboard/viewings` | Dashboard | Yes (Cust) | None | Phase 5 |
| Contact | `/contact` | Root | No | None | Phase 4 |
| 404 Not Found | `*` (Catch-all) | Root | No | None | Phase 4 |
| Property No Longer Available | `/properties/unavailable`| Properties | No | None | Phase 4 |


## 2. Admin/CRM (`apps/admin`)

| Screen | Route Path | Parent Section | Auth Required | Permissions Required | Phase |
|--------|------------|----------------|---------------|----------------------|-------|
| Login | `/login` | Auth | No | None | Phase 1 |
| Force Password Change | `/change-password` | Auth | Yes | None | Phase 1 |
| Dashboard | `/dashboard` | Dashboard | Yes | None | Phase 1 |
| Properties List | `/properties` | Properties | Yes | `properties.view` | Phase 3 |
| Property Create | `/properties/create` | Properties | Yes | `properties.create` | Phase 3 |
| Property Edit | `/properties/:id/edit` | Properties | Yes | `properties.edit` | Phase 3 |
| Property Detail | `/properties/:id` | Properties | Yes | `properties.view` | Phase 3 |
| Media Manager | `/properties/:id/media`| Properties | Yes | `properties.edit` | Phase 3 |
| Document Manager | `/properties/:id/docs` | Properties | Yes | `properties.edit` | Phase 3 |
| Leads List | `/leads` | Leads | Yes | `leads.view` | Phase 6 |
| Lead Detail (Tabbed) | `/leads/:id` | Leads | Yes | `leads.view` | Phase 6 |
| Leads Pipeline (Kanban) | `/leads/pipeline` | Leads | Yes | `leads.view` | Phase 6 |
| Customers List | `/customers` | Customers | Yes | `customers.view` | Phase 5 |
| Customer Detail | `/customers/:id` | Customers | Yes | `customers.view` | Phase 5 |
| WhatsApp Inbox | `/whatsapp` | WhatsApp | Yes | `whatsapp.view` | Phase 9 |
| WhatsApp Conversation | `/whatsapp/:id` | WhatsApp | Yes | `whatsapp.view` | Phase 9 |
| WhatsApp Templates | `/whatsapp/templates`| WhatsApp | Yes | `whatsapp.templates`| Phase 9 |
| WhatsApp Bulk Campaign | `/whatsapp/bulk` | WhatsApp | Yes | `whatsapp.bulk` | Phase 9 |
| Viewings List | `/viewings` | Viewings | Yes | `viewings.view` | Phase 7 |
| Viewing Calendar | `/viewings/calendar` | Viewings | Yes | `viewings.view` | Phase 7 |
| Viewing Detail | `/viewings/:id` | Viewings | Yes | `viewings.view` | Phase 7 |
| Offers List | `/offers` | Offers | Yes | `offers.view` | Phase 8 |
| Offer Detail | `/offers/:id` | Offers | Yes | `offers.view` | Phase 8 |
| Tasks / Follow-ups | `/tasks` | CRM | Yes | `leads.view` | Phase 6 |
| Staff List | `/staff` | Staff | Yes | `staff.view` | Phase 1 |
| Staff Create/Edit | `/staff/:id` | Staff | Yes | `staff.create`/`edit`| Phase 1 |
| Staff Permissions | `/staff/:id/permissions`| Staff | Yes | `staff.permissions` | Phase 1 |
| Countries Management | `/admin/countries` | Admin | Yes | `admin.view` | Phase 2 |
| Currencies Management | `/admin/currencies` | Admin | Yes | `admin.view` | Phase 2 |
| Property Types Mgt | `/admin/property-types`| Admin | Yes | `admin.view` | Phase 2 |
| Listing Types Mgt | `/admin/listing-types` | Admin | Yes | `admin.view` | Phase 2 |
| Tenure Types Mgt | `/admin/tenure-types` | Admin | Yes | `admin.view` | Phase 2 |
| Property Statuses Mgt | `/admin/statuses` | Admin | Yes | `admin.view` | Phase 2 |
| Property Features Mgt | `/admin/features` | Admin | Yes | `admin.view` | Phase 2 |
| Lead Sources Mgt | `/admin/lead-sources` | Admin | Yes | `admin.view` | Phase 2 |
| Lead Stages Mgt | `/admin/lead-stages` | Admin | Yes | `admin.view` | Phase 2 |
| Analytics Dashboard | `/analytics` | Analytics | Yes | `analytics.view` | Phase 11 |
| Property Analytics | `/analytics/properties`| Analytics | Yes | `analytics.view` | Phase 11 |
| Lead Analytics | `/analytics/leads` | Analytics | Yes | `analytics.view` | Phase 11 |
| Staff Analytics | `/analytics/staff` | Analytics | Yes | `analytics.view` | Phase 11 |
| Import (CSV/Excel) | `/import` | Tools | Yes | `import.properties` | Phase 12 |
| Export | `/export` | Tools | Yes | `analytics.export` | Phase 11 |
| Audit Logs | `/audit-logs` | Admin | Yes | `admin.view` | Phase 2 |
| Settings | `/settings` | Admin | Yes | `admin.view` | Phase 2 |
| Notifications Center | `/notifications` | Root | Yes | None | Phase 1 |
| Profile | `/profile` | Auth | Yes | None | Phase 1 |
