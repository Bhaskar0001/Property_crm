# API Map

This document outlines all API endpoints across all phases of the Real Estate Property OS project.

| Method | Endpoint | Description | Auth | Permission | Phase |
|--------|----------|-------------|------|------------|-------|
| POST | `/api/v1/auth/login` | Staff login | No | None | Phase 1 |
| POST | `/api/v1/auth/refresh` | Refresh token | Yes | None | Phase 1 |
| POST | `/api/v1/auth/logout` | Logout | Yes | None | Phase 1 |
| GET | `/api/v1/auth/me` | Get current user | Yes | None | Phase 1 |
| POST | `/api/v1/auth/change-password` | Change password | Yes | None | Phase 1 |
| POST | `/api/v1/auth/customer/request-otp` | Request customer OTP | No | None | Phase 4 |
| POST | `/api/v1/auth/customer/verify-otp` | Verify customer OTP | No | None | Phase 4 |
| GET | `/api/v1/health` | Health check | No | None | Phase 1 |
| GET | `/api/v1/admin/countries` | List countries | Yes | `admin.view` | Phase 2 |
| GET | `/api/v1/admin/countries/:id` | Get country | Yes | `admin.view` | Phase 2 |
| POST | `/api/v1/admin/countries` | Create country | Yes | `admin.edit` | Phase 2 |
| PUT | `/api/v1/admin/countries/:id` | Update country | Yes | `admin.edit` | Phase 2 |
| DELETE | `/api/v1/admin/countries/:id` | Delete country | Yes | `admin.edit` | Phase 2 |
| GET | `/api/v1/admin/currencies` | List currencies | Yes | `admin.view` | Phase 2 |
| GET | `/api/v1/admin/currencies/:id` | Get currency | Yes | `admin.view` | Phase 2 |
| POST | `/api/v1/admin/currencies` | Create currency | Yes | `admin.edit` | Phase 2 |
| PUT | `/api/v1/admin/currencies/:id` | Update currency | Yes | `admin.edit` | Phase 2 |
| DELETE | `/api/v1/admin/currencies/:id` | Delete currency | Yes | `admin.edit` | Phase 2 |
| GET | `/api/v1/admin/property-types` | List property types | Yes | `admin.view` | Phase 2 |
| GET | `/api/v1/admin/property-types/:id` | Get property type | Yes | `admin.view` | Phase 2 |
| POST | `/api/v1/admin/property-types` | Create property type | Yes | `admin.edit` | Phase 2 |
| PUT | `/api/v1/admin/property-types/:id` | Update property type | Yes | `admin.edit` | Phase 2 |
| DELETE | `/api/v1/admin/property-types/:id` | Delete property type | Yes | `admin.edit` | Phase 2 |
| GET | `/api/v1/admin/listing-types` | List listing types | Yes | `admin.view` | Phase 2 |
| GET | `/api/v1/admin/listing-types/:id` | Get listing type | Yes | `admin.view` | Phase 2 |
| POST | `/api/v1/admin/listing-types` | Create listing type | Yes | `admin.edit` | Phase 2 |
| PUT | `/api/v1/admin/listing-types/:id` | Update listing type | Yes | `admin.edit` | Phase 2 |
| DELETE | `/api/v1/admin/listing-types/:id` | Delete listing type | Yes | `admin.edit` | Phase 2 |
| GET | `/api/v1/admin/tenure-types` | List tenure types | Yes | `admin.view` | Phase 2 |
| GET | `/api/v1/admin/tenure-types/:id` | Get tenure type | Yes | `admin.view` | Phase 2 |
| POST | `/api/v1/admin/tenure-types` | Create tenure type | Yes | `admin.edit` | Phase 2 |
| PUT | `/api/v1/admin/tenure-types/:id` | Update tenure type | Yes | `admin.edit` | Phase 2 |
| DELETE | `/api/v1/admin/tenure-types/:id` | Delete tenure type | Yes | `admin.edit` | Phase 2 |
| GET | `/api/v1/admin/property-statuses` | List property statuses | Yes | `admin.view` | Phase 2 |
| GET | `/api/v1/admin/property-statuses/:id` | Get status | Yes | `admin.view` | Phase 2 |
| POST | `/api/v1/admin/property-statuses` | Create status | Yes | `admin.edit` | Phase 2 |
| PUT | `/api/v1/admin/property-statuses/:id` | Update status | Yes | `admin.edit` | Phase 2 |
| DELETE | `/api/v1/admin/property-statuses/:id` | Delete status | Yes | `admin.edit` | Phase 2 |
| GET | `/api/v1/admin/property-features` | List property features | Yes | `admin.view` | Phase 2 |
| GET | `/api/v1/admin/property-features/:id` | Get feature | Yes | `admin.view` | Phase 2 |
| POST | `/api/v1/admin/property-features` | Create feature | Yes | `admin.edit` | Phase 2 |
| PUT | `/api/v1/admin/property-features/:id` | Update feature | Yes | `admin.edit` | Phase 2 |
| DELETE | `/api/v1/admin/property-features/:id` | Delete feature | Yes | `admin.edit` | Phase 2 |
| GET | `/api/v1/admin/lead-sources` | List lead sources | Yes | `admin.view` | Phase 2 |
| GET | `/api/v1/admin/lead-sources/:id` | Get lead source | Yes | `admin.view` | Phase 2 |
| POST | `/api/v1/admin/lead-sources` | Create lead source | Yes | `admin.edit` | Phase 2 |
| PUT | `/api/v1/admin/lead-sources/:id` | Update lead source | Yes | `admin.edit` | Phase 2 |
| DELETE | `/api/v1/admin/lead-sources/:id` | Delete lead source | Yes | `admin.edit` | Phase 2 |
| GET | `/api/v1/admin/lead-stages` | List lead stages | Yes | `admin.view` | Phase 2 |
| GET | `/api/v1/admin/lead-stages/:id` | Get lead stage | Yes | `admin.view` | Phase 2 |
| POST | `/api/v1/admin/lead-stages` | Create lead stage | Yes | `admin.edit` | Phase 2 |
| PUT | `/api/v1/admin/lead-stages/:id` | Update lead stage | Yes | `admin.edit` | Phase 2 |
| DELETE | `/api/v1/admin/lead-stages/:id` | Delete lead stage | Yes | `admin.edit` | Phase 2 |
| GET | `/api/v1/staff` | List staff | Yes | `staff.view` | Phase 1 |
| GET | `/api/v1/staff/:id` | Get staff | Yes | `staff.view` | Phase 1 |
| POST | `/api/v1/staff` | Create staff | Yes | `staff.create` | Phase 1 |
| PUT | `/api/v1/staff/:id` | Update staff | Yes | `staff.edit` | Phase 1 |
| DELETE | `/api/v1/staff/:id` | Delete staff | Yes | `staff.delete` | Phase 1 |
| PUT | `/api/v1/staff/:id/permissions` | Update staff permissions | Yes | `staff.permissions` | Phase 1 |
| PATCH | `/api/v1/staff/:id/activate` | Activate staff | Yes | `staff.edit` | Phase 1 |
| PATCH | `/api/v1/staff/:id/deactivate` | Deactivate staff | Yes | `staff.edit` | Phase 1 |
| POST | `/api/v1/staff/:id/reset-password` | Reset staff password | Yes | `staff.edit` | Phase 1 |
| GET | `/api/v1/properties` | List properties | Yes | `properties.view` | Phase 3 |
| GET | `/api/v1/properties/:id` | Get property details | Yes | `properties.view` | Phase 3 |
| POST | `/api/v1/properties` | Create property | Yes | `properties.create` | Phase 3 |
| PUT | `/api/v1/properties/:id` | Update property | Yes | `properties.edit` | Phase 3 |
| DELETE | `/api/v1/properties/:id` | Delete property | Yes | `properties.delete` | Phase 3 |
| PATCH | `/api/v1/properties/:id/status` | Update status | Yes | `properties.edit` | Phase 3 |
| PATCH | `/api/v1/properties/:id/publish` | Publish property | Yes | `properties.publish` | Phase 3 |
| PATCH | `/api/v1/properties/:id/unpublish` | Unpublish property | Yes | `properties.publish` | Phase 3 |
| GET | `/api/v1/media/property/:propertyId` | Get property media | Yes | `properties.view` | Phase 3 |
| POST | `/api/v1/media/upload` | Upload media | Yes | `properties.edit` | Phase 3 |
| PATCH | `/api/v1/media/reorder` | Reorder media | Yes | `properties.edit` | Phase 3 |
| PATCH | `/api/v1/media/:id/cover` | Set cover image | Yes | `properties.edit` | Phase 3 |
| DELETE | `/api/v1/media/:id` | Delete media | Yes | `properties.edit` | Phase 3 |
| GET | `/api/v1/documents/property/:propertyId`| Get property docs | Yes | `properties.view` | Phase 3 |
| POST | `/api/v1/documents/upload` | Upload document | Yes | `properties.edit` | Phase 3 |
| GET | `/api/v1/documents/:id/download` | Download document | Yes | `properties.view` | Phase 3 |
| DELETE | `/api/v1/documents/:id` | Delete document | Yes | `properties.edit` | Phase 3 |
| GET | `/api/v1/public/properties` | List public properties | No | None | Phase 4 |
| GET | `/api/v1/public/properties/:slug` | Get public property | No | None | Phase 4 |
| GET | `/api/v1/public/countries` | List active countries | No | None | Phase 4 |
| GET | `/api/v1/public/property-types` | List active types | No | None | Phase 4 |
| GET | `/api/v1/public/featured` | List featured props | No | None | Phase 4 |
| GET | `/api/v1/public/sitemap` | Sitemap data | No | None | Phase 4 |
| POST | `/api/v1/public/enquiries` | Submit enquiry | No | None | Phase 4 |
| POST | `/api/v1/public/viewing-requests` | Submit viewing req | No | None | Phase 4 |
| POST | `/api/v1/public/contact` | Submit contact form | No | None | Phase 4 |
| GET | `/api/v1/customers` | List customers | Yes | `customers.view` | Phase 5 |
| GET | `/api/v1/customers/:id` | Get customer | Yes | `customers.view` | Phase 5 |
| GET | `/api/v1/customers/me` | Customer profile | Cust | None | Phase 5 |
| PUT | `/api/v1/customers/me` | Update profile | Cust | None | Phase 5 |
| GET | `/api/v1/customers/me/favorites` | Get fav properties | Cust | None | Phase 5 |
| POST | `/api/v1/customers/me/favorites/:id` | Add favorite | Cust | None | Phase 5 |
| DELETE| `/api/v1/customers/me/favorites/:id` | Remove favorite | Cust | None | Phase 5 |
| GET | `/api/v1/customers/me/enquiries` | Get enquiries | Cust | None | Phase 5 |
| GET | `/api/v1/customers/me/viewing-requests`| Get view requests | Cust | None | Phase 5 |
| GET | `/api/v1/leads` | List leads | Yes | `leads.view` | Phase 6 |
| GET | `/api/v1/leads/:id` | Get lead details | Yes | `leads.view` | Phase 6 |
| POST | `/api/v1/leads` | Create lead | Yes | `leads.create` | Phase 6 |
| PUT | `/api/v1/leads/:id` | Update lead | Yes | `leads.edit` | Phase 6 |
| DELETE| `/api/v1/leads/:id` | Delete lead | Yes | `leads.delete` | Phase 6 |
| PATCH | `/api/v1/leads/:id/stage` | Update lead stage | Yes | `leads.edit` | Phase 6 |
| PATCH | `/api/v1/leads/:id/assign` | Assign lead | Yes | `leads.assign` | Phase 6 |
| GET | `/api/v1/leads/:id/activities` | Get lead activities | Yes | `leads.view` | Phase 6 |
| POST | `/api/v1/leads/:id/notes` | Add lead note | Yes | `leads.edit` | Phase 6 |
| GET | `/api/v1/leads/:id/tasks` | List lead tasks | Yes | `leads.view` | Phase 6 |
| POST | `/api/v1/leads/:id/tasks` | Add lead task | Yes | `leads.edit` | Phase 6 |
| PUT | `/api/v1/leads/:id/tasks/:taskId` | Update lead task | Yes | `leads.edit` | Phase 6 |
| DELETE| `/api/v1/leads/:id/tasks/:taskId` | Delete lead task | Yes | `leads.edit` | Phase 6 |
| GET | `/api/v1/leads/:id/matching-properties`| Get matched props | Yes | `leads.view` | Phase 6 |
| GET | `/api/v1/viewings` | List viewings | Yes | `viewings.view` | Phase 7 |
| GET | `/api/v1/viewings/:id` | Get viewing | Yes | `viewings.view` | Phase 7 |
| POST | `/api/v1/viewings` | Create viewing | Yes | `viewings.create` | Phase 7 |
| PUT | `/api/v1/viewings/:id` | Update viewing | Yes | `viewings.edit` | Phase 7 |
| DELETE| `/api/v1/viewings/:id` | Delete viewing | Yes | `viewings.delete` | Phase 7 |
| PATCH | `/api/v1/viewings/:id/status` | Update status | Yes | `viewings.edit` | Phase 7 |
| GET | `/api/v1/viewings/calendar` | Get calendar events | Yes | `viewings.view` | Phase 7 |
| GET | `/api/v1/offers` | List offers | Yes | `offers.view` | Phase 8 |
| GET | `/api/v1/offers/:id` | Get offer | Yes | `offers.view` | Phase 8 |
| POST | `/api/v1/offers` | Create offer | Yes | `offers.create` | Phase 8 |
| PUT | `/api/v1/offers/:id` | Update offer | Yes | `offers.edit` | Phase 8 |
| DELETE| `/api/v1/offers/:id` | Delete offer | Yes | `offers.delete` | Phase 8 |
| PATCH | `/api/v1/offers/:id/status` | Update offer status | Yes | `offers.edit` | Phase 8 |
| POST | `/api/v1/whatsapp/send` | Send WhatsApp | Yes | `whatsapp.send` | Phase 9 |
| POST | `/api/v1/whatsapp/send-property` | Send property via WA | Yes | `whatsapp.send` | Phase 9 |
| POST | `/api/v1/whatsapp/bulk` | Bulk WhatsApp | Yes | `whatsapp.bulk` | Phase 9 |
| GET | `/api/v1/whatsapp/conversations` | List conversations | Yes | `whatsapp.view` | Phase 9 |
| GET | `/api/v1/whatsapp/conversations/:id` | Get WA conversation | Yes | `whatsapp.view` | Phase 9 |
| POST | `/api/v1/webhooks/whatsapp` | WhatsApp Webhook | No | None | Phase 9 |
| GET | `/api/v1/whatsapp/templates` | List WA templates | Yes | `whatsapp.templates`| Phase 9 |
| POST | `/api/v1/whatsapp/templates` | Create WA template | Yes | `whatsapp.templates`| Phase 9 |
| PUT | `/api/v1/whatsapp/templates/:id` | Update WA template | Yes | `whatsapp.templates`| Phase 9 |
| DELETE| `/api/v1/whatsapp/templates/:id` | Delete WA template | Yes | `whatsapp.templates`| Phase 9 |
| POST | `/api/v1/email/send` | Send Email | Yes | `email.send` | Phase 10 |
| GET | `/api/v1/email/templates` | List Email templates| Yes | `email.templates` | Phase 10 |
| POST | `/api/v1/email/templates` | Create Email temp | Yes | `email.templates` | Phase 10 |
| PUT | `/api/v1/email/templates/:id`| Update Email temp | Yes | `email.templates` | Phase 10 |
| DELETE| `/api/v1/email/templates/:id`| Delete Email temp | Yes | `email.templates` | Phase 10 |
| GET | `/api/v1/analytics/dashboard` | Main dashboard | Yes | `analytics.view` | Phase 11 |
| GET | `/api/v1/analytics/properties` | Property analytics | Yes | `analytics.view` | Phase 11 |
| GET | `/api/v1/analytics/leads` | Lead analytics | Yes | `analytics.view` | Phase 11 |
| GET | `/api/v1/analytics/staff` | Staff analytics | Yes | `analytics.view` | Phase 11 |
| GET | `/api/v1/analytics/export/:type` | Export analytics | Yes | `analytics.export` | Phase 11 |
| POST | `/api/v1/import/properties` | Import properties | Yes | `import.properties`| Phase 12 |
| POST | `/api/v1/import/leads` | Import leads | Yes | `import.leads` | Phase 12 |
| POST | `/api/v1/ai/generate-description` | AI desc generation | Yes | `ai.use` | Phase 13 |
| POST | `/api/v1/ai/extract-requirements` | AI requirement extr | Yes | `ai.use` | Phase 13 |
| POST | `/api/v1/ai/summarize-conversation`| AI chat summarizer | Yes | `ai.use` | Phase 13 |
| POST | `/api/v1/ai/search` | AI search | Yes | `ai.use` | Phase 13 |
| POST | `/api/v1/ai/dashboard-query` | AI dashboard query | Yes | `ai.use` | Phase 13 |
| GET | `/api/v1/audit-logs` | Get audit logs | Yes | `admin.view` | Phase 2 |
| GET | `/api/v1/notifications` | List notifications | Yes | None | Phase 1 |
| PATCH | `/api/v1/notifications/:id/read` | Mark read | Yes | None | Phase 1 |
| PATCH | `/api/v1/notifications/read-all` | Mark all read | Yes | None | Phase 1 |
| GET | `/api/v1/settings` | Get settings | Yes | `admin.view` | Phase 2 |
| PUT | `/api/v1/settings/:key` | Update settings | Yes | `admin.edit` | Phase 2 |
| GET | `/api/v1/currencies/rates` | Currency rates | No | None | Phase 2 |
| GET | `/api/v1/currencies/convert` | Currency convert | No | None | Phase 2 |
