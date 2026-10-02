# Permission Matrix

This document outlines the granular permission scopes and example staff configurations.

## Permissions Map

| Feature | Permission String | Description |
|---------|-------------------|-------------|
| Admin | `admin.view` | View core settings, lists, audit logs |
| Admin | `admin.edit` | Edit core settings, manage global lists |
| Staff | `staff.view` | View staff members |
| Staff | `staff.create` | Create new staff members |
| Staff | `staff.edit` | Edit basic staff details |
| Staff | `staff.permissions` | Manage staff permissions |
| Staff | `staff.delete` | Remove staff members |
| Properties | `properties.view` | View property details and lists |
| Properties | `properties.create` | Add new properties |
| Properties | `properties.edit` | Edit property details |
| Properties | `properties.delete` | Delete properties |
| Properties | `properties.publish` | Change publish status of property |
| Customers | `customers.view` | View customer records |
| Customers | `customers.edit` | Edit customer records |
| Leads | `leads.view` | View leads |
| Leads | `leads.create` | Add new leads |
| Leads | `leads.edit` | Update lead stages, add notes/tasks |
| Leads | `leads.delete` | Remove leads |
| Leads | `leads.assign` | Assign leads to staff members |
| Viewings | `viewings.view` | View scheduled viewings |
| Viewings | `viewings.create` | Schedule new viewings |
| Viewings | `viewings.edit` | Update viewing details/status |
| Viewings | `viewings.delete` | Cancel/Remove viewings |
| Offers | `offers.view` | View property offers |
| Offers | `offers.create` | Submit new offers |
| Offers | `offers.edit` | Update offer terms/status |
| Offers | `offers.delete` | Remove offers |
| WhatsApp | `whatsapp.view` | View WhatsApp conversations |
| WhatsApp | `whatsapp.send` | Send WhatsApp messages |
| WhatsApp | `whatsapp.bulk` | Send bulk WhatsApp campaigns |
| WhatsApp | `whatsapp.templates`| Manage WhatsApp templates |
| Email | `email.send` | Send emails |
| Email | `email.templates` | Manage email templates |
| Analytics | `analytics.view` | View analytics dashboards |
| Analytics | `analytics.export` | Export analytics data |
| Import | `import.properties` | Import properties via CSV/Excel |
| Import | `import.leads` | Import leads via CSV/Excel |
| AI | `ai.use` | Access AI generation and querying tools |

## Default Configurations

**Admin / Super User**: All permissions by default.

### Example: Sales Agent
*   `leads.view`, `leads.create`, `leads.edit`
*   `properties.view`
*   `viewings.view`, `viewings.create`
*   `offers.view`, `offers.create`
*   `whatsapp.view`, `whatsapp.send`

### Example: Telecaller
*   `leads.view`, `leads.edit`
*   `properties.view`
*   `whatsapp.view`, `whatsapp.send`

### Example: Marketing
*   `properties.view`
*   `analytics.view`
*   `whatsapp.view`, `whatsapp.send`, `whatsapp.bulk_send` (Note: `whatsapp.bulk`)

## Scopes
*   **Country Scope**: Control access at a regional level (e.g., specific user only accesses UAE properties and leads).
*   **Property Scope**: Control access for specific assigned properties (e.g., property managers).
*   **Feature Scope**: Toggling major modules per role (e.g., completely disabling WhatsApp access for external contractors).
