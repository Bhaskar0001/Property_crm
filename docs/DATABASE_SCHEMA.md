# Database Schema

Detailed MongoDB collections for the Real Estate Property OS project.

## Core Admin & System

### 1. `staff`
*   **Fields**: `_id`, `name` (String), `email` (String, Unique), `passwordHash` (String), `role` (String), `permissions` (Array), `isActive` (Boolean), `forcePasswordChange` (Boolean)
*   **Required**: `name`, `email`, `passwordHash`, `role`
*   **Indexes**: `email` (unique)

### 2. `countries`
*   **Fields**: `_id`, `name` (String), `code` (String, Unique), `currency` (ObjectId -> `currencies`), `isActive` (Boolean)
*   **Required**: `name`, `code`

### 3. `currencies`
*   **Fields**: `_id`, `code` (String, Unique), `symbol` (String), `exchangeRate` (Number)
*   **Required**: `code`, `exchangeRate`

### 4. `property_types`
*   **Fields**: `_id`, `name` (String, Unique)
*   **Required**: `name`

### 5. `listing_types`
*   **Fields**: `_id`, `name` (String, Unique) - e.g., Sale, Rent

### 6. `tenure_types`
*   **Fields**: `_id`, `name` (String, Unique) - e.g., Freehold, Leasehold

### 7. `property_statuses`
*   **Fields**: `_id`, `name` (String, Unique) - e.g., Available, Under Offer, Sold

### 8. `property_features`
*   **Fields**: `_id`, `name` (String, Unique), `icon` (String)

### 9. `lead_sources`
*   **Fields**: `_id`, `name` (String, Unique)

### 10. `lead_stages`
*   **Fields**: `_id`, `name` (String, Unique), `order` (Number)

### 11. `settings`
*   **Fields**: `_id`, `key` (String, Unique), `value` (Mixed)

### 12. `audit_logs`
*   **Fields**: `_id`, `userId` (ObjectId -> `staff`), `action` (String), `collectionName` (String), `documentId` (ObjectId), `changes` (Object), `createdAt` (Date)
*   **Indexes**: `userId`, `createdAt`

### 13. `notifications`
*   **Fields**: `_id`, `userId` (ObjectId -> `staff`), `message` (String), `isRead` (Boolean), `type` (String), `link` (String), `createdAt` (Date)
*   **Indexes**: `userId`

## Properties & Content

### 14. `properties`
*   **Fields**: `_id`, `slug` (String, Unique), `title` (String), `description` (String), `countryId` (ObjectId -> `countries`), `propertyTypeId` (ObjectId -> `property_types`), `listingTypeId` (ObjectId -> `listing_types`), `statusId` (ObjectId -> `property_statuses`), `price` (Number), `currencyId` (ObjectId -> `currencies`), `bedrooms` (Number), `bathrooms` (Number), `area` (Number), `features` (Array of ObjectId -> `property_features`), `isPublished` (Boolean), `agentId` (ObjectId -> `staff`), `createdAt`, `updatedAt`
*   **Required**: `title`, `countryId`, `propertyTypeId`, `price`
*   **Indexes**: `slug` (unique), `countryId`, `isPublished`

### 15. `property_media`
*   **Fields**: `_id`, `propertyId` (ObjectId -> `properties`), `url` (String), `type` (String), `isCover` (Boolean), `order` (Number)
*   **Indexes**: `propertyId`

### 16. `property_documents`
*   **Fields**: `_id`, `propertyId` (ObjectId -> `properties`), `title` (String), `url` (String)
*   **Indexes**: `propertyId`

## Customers & CRM

### 17. `customers`
*   **Fields**: `_id`, `firstName` (String), `lastName` (String), `email` (String, Unique), `phone` (String), `otpHash` (String), `favorites` (Array of ObjectId -> `properties`)
*   **Required**: `email`
*   **Indexes**: `email` (unique)

### 18. `leads`
*   **Fields**: `_id`, `customerId` (ObjectId -> `customers`), `assignedTo` (ObjectId -> `staff`), `stageId` (ObjectId -> `lead_stages`), `sourceId` (ObjectId -> `lead_sources`), `budget` (Number), `requirements` (String), `createdAt`, `updatedAt`
*   **Indexes**: `customerId`, `assignedTo`, `stageId`

### 19. `lead_activities`
*   **Fields**: `_id`, `leadId` (ObjectId -> `leads`), `type` (String), `description` (String), `createdBy` (ObjectId -> `staff`), `createdAt` (Date)
*   **Indexes**: `leadId`

### 20. `lead_notes`
*   **Fields**: `_id`, `leadId` (ObjectId -> `leads`), `content` (String), `createdBy` (ObjectId -> `staff`), `createdAt` (Date)
*   **Indexes**: `leadId`

### 21. `tasks`
*   **Fields**: `_id`, `leadId` (ObjectId -> `leads`), `title` (String), `dueDate` (Date), `assignedTo` (ObjectId -> `staff`), `isCompleted` (Boolean)
*   **Indexes**: `leadId`, `assignedTo`

### 22. `viewings`
*   **Fields**: `_id`, `propertyId` (ObjectId -> `properties`), `leadId` (ObjectId -> `leads`), `assignedTo` (ObjectId -> `staff`), `scheduledAt` (Date), `status` (String - Scheduled, Completed, Cancelled), `feedback` (String)
*   **Indexes**: `propertyId`, `leadId`, `assignedTo`

### 23. `offers`
*   **Fields**: `_id`, `propertyId` (ObjectId -> `properties`), `leadId` (ObjectId -> `leads`), `amount` (Number), `status` (String - Pending, Accepted, Rejected), `submittedBy` (ObjectId -> `staff`)
*   **Indexes**: `propertyId`, `leadId`

## Communications

### 24. `whatsapp_conversations`
*   **Fields**: `_id`, `leadId` (ObjectId -> `leads`), `phone` (String), `lastMessageAt` (Date)
*   **Indexes**: `leadId`, `phone`

### 25. `whatsapp_messages`
*   **Fields**: `_id`, `conversationId` (ObjectId -> `whatsapp_conversations`), `direction` (String - inbound, outbound), `content` (String), `status` (String), `sentAt` (Date)
*   **Indexes**: `conversationId`

### 26. `whatsapp_templates`
*   **Fields**: `_id`, `name` (String), `content` (String), `variables` (Array)

### 27. `email_templates`
*   **Fields**: `_id`, `name` (String), `subject` (String), `body` (String)

## Public Interactions

### 28. `enquiries`
*   **Fields**: `_id`, `propertyId` (ObjectId -> `properties`), `name` (String), `email` (String), `phone` (String), `message` (String), `status` (String), `createdAt` (Date)
*   **Indexes**: `propertyId`, `email`
