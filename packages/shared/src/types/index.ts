// ============================================
// REAL ESTATE PROPERTY OS - Shared Types
// ============================================

// --- Base Types ---
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// --- Auth ---
export type UserRole = 'admin' | 'staff';

export type StaffTeam = 'sales' | 'telecaller' | 'marketing' | 'property_operations' | 'other';

export interface User extends BaseEntity {
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  team?: StaffTeam;
  isActive: boolean;
  mustChangePassword: boolean;
  permissions: string[];
  countryAccess: string[];  // country IDs
  propertyTypeAccess: string[];  // property type IDs
  featureAccess: string[];  // feature keys
  propertyAccessScope: PropertyAccessScope;
  lastLogin?: string;
}

export type PropertyAccessScope = 
  | { type: 'all' }
  | { type: 'countries'; countries: string[] }
  | { type: 'cities'; cities: string[] }
  | { type: 'property_types'; propertyTypes: string[] }
  | { type: 'assigned' };

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// --- Permissions ---
export const PERMISSIONS = {
  PROPERTIES_VIEW: 'properties.view',
  PROPERTIES_CREATE: 'properties.create',
  PROPERTIES_EDIT: 'properties.edit',
  PROPERTIES_PUBLISH: 'properties.publish',
  PROPERTIES_ARCHIVE: 'properties.archive',
  PROPERTIES_DELETE: 'properties.delete',
  PROPERTIES_MEDIA_UPLOAD: 'properties.media.upload',
  PROPERTIES_DOCUMENTS_VIEW: 'properties.documents.view',
  PROPERTIES_DOCUMENTS_UPLOAD: 'properties.documents.upload',
  LEADS_VIEW: 'leads.view',
  LEADS_CREATE: 'leads.create',
  LEADS_EDIT: 'leads.edit',
  LEADS_ASSIGN: 'leads.assign',
  LEADS_EXPORT: 'leads.export',
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_EDIT: 'customers.edit',
  WHATSAPP_VIEW: 'whatsapp.view',
  WHATSAPP_SEND: 'whatsapp.send',
  WHATSAPP_BULK_SEND: 'whatsapp.bulk_send',
  VIEWINGS_VIEW: 'viewings.view',
  VIEWINGS_CREATE: 'viewings.create',
  VIEWINGS_EDIT: 'viewings.edit',
  OFFERS_VIEW: 'offers.view',
  OFFERS_CREATE: 'offers.create',
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  STAFF_MANAGE: 'staff.manage',
  SETTINGS_MANAGE: 'settings.manage',
  AUDIT_VIEW: 'audit.view',
  IMPORT: 'import',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const FEATURE_KEYS = [
  'properties',
  'leads',
  'customers',
  'whatsapp',
  'viewings',
  'offers',
  'analytics',
  'staff',
  'settings',
  'import',
  'ai',
] as const;

export type FeatureKey = typeof FEATURE_KEYS[number];

// --- Country ---
export interface Country extends BaseEntity {
  name: string;
  isoCode: string;
  currency: string;  // currency ID
  timezone: string;
  phoneCode: string;
  isActive: boolean;
}

// --- Currency ---
export interface Currency extends BaseEntity {
  code: string;
  symbol: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface ExchangeRate {
  provider: string;
  timestamp: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
}

// --- Property Types ---
export interface PropertyType extends BaseEntity {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ListingType extends BaseEntity {
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

export interface TenureType extends BaseEntity {
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

// --- Property Status ---
export type PropertyStatusCode = 
  | 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'UNDER_OFFER'
  | 'SOLD' | 'LET' | 'OFF_MARKET' | 'ARCHIVED';

export interface PropertyStatus extends BaseEntity {
  name: string;
  code: PropertyStatusCode | string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
}

// --- Property Feature ---
export interface PropertyFeature extends BaseEntity {
  name: string;
  slug: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
}

// --- Property ---
export interface Property extends BaseEntity {
  // Identity
  internalReference?: string;
  title: string;
  slug: string;
  country: string;  // country ID
  region?: string;
  city?: string;
  area?: string;
  address?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;

  // Transaction
  propertyType: string;  // propertyType ID
  listingType: string;  // listingType ID
  tenure?: string;  // tenureType ID
  status: string;  // propertyStatus ID
  price?: number;
  currency?: string;  // currency ID
  priceOnRequest: boolean;

  // Specifications
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;  // sq meters or sq feet
  plotArea?: number;
  floor?: number;
  totalFloors?: number;
  parking: boolean;
  parkingSpaces?: number;
  yearBuilt?: number;
  furnished?: 'unfurnished' | 'partly_furnished' | 'fully_furnished';
  condition?: string;
  heating?: string;

  // Ireland-specific (optional)
  berRating?: string;
  berNumber?: string;
  berCertificateUrl?: string;
  propertyRegistration?: string;

  // Description
  description?: string;
  shortDescription?: string;

  // Features
  features: string[];  // propertyFeature IDs

  // Media counts (for quick access)
  imageCount: number;
  coverImage?: string;  // media ID

  // Publication
  isPublished: boolean;
  isFeatured: boolean;
  isVisibleInSearch: boolean;
  showPrice: boolean;
  showAddress: boolean;
  showMap: boolean;
  showWhatsApp: boolean;
  showEnquiry: boolean;
  showViewingRequest: boolean;
  publishedAt?: string;

  // SEO
  seoTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  includedInSitemap: boolean;

  // Metadata
  createdBy: string;  // user ID
  updatedBy?: string;  // user ID
  viewCount: number;
  enquiryCount: number;
}

// --- Media ---
export type MediaType = 'image' | 'video' | 'floor_plan' | 'virtual_tour' | '360_tour' | 'map' | 'brochure';

export interface Media extends BaseEntity {
  property: string;  // property ID
  type: MediaType;
  originalUrl: string;
  thumbnailUrl?: string;
  webUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  sortOrder: number;
  isCover: boolean;
  altText?: string;
  uploadedBy: string;  // user ID
}

// --- Document ---
export type DocumentVisibility = 'public' | 'internal' | 'admin_only';

export type DocumentType = 
  | 'brochure' | 'floor_plan' | 'specification' | 'energy_certificate'
  | 'legal' | 'contract' | 'agreement' | 'owner_document'
  | 'internal_note' | 'certificate' | 'other';

export interface PropertyDocument extends BaseEntity {
  property: string;  // property ID
  name: string;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  visibility: DocumentVisibility;
  version: number;
  expiryDate?: string;
  uploadedBy: string;  // user ID
}

// --- Customer ---
export interface Customer extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  preferences?: CustomerPreferences;
  consentGiven: boolean;
  consentDate?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface CustomerPreferences {
  countries?: string[];
  propertyTypes?: string[];
  listingTypes?: string[];
  minBudget?: number;
  maxBudget?: number;
  currency?: string;
  bedrooms?: number;
  features?: string[];
}

// --- Lead ---
export type LeadStageCode = 
  | 'NEW' | 'CONTACTED' | 'INTERESTED' | 'QUALIFIED'
  | 'PROPERTY_MATCHED' | 'VIEWING' | 'OFFER' | 'NEGOTIATION'
  | 'CONVERTED' | 'LOST' | 'NOT_INTERESTED' | 'INVALID' | 'DUPLICATE';

export interface Lead extends BaseEntity {
  customer: string;  // customer ID
  property?: string;  // property ID (if enquiry-based)
  source: string;  // leadSource ID
  stage: string;  // leadStage ID
  assignedTo?: string;  // user ID (staff)
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requirements?: LeadRequirements;
  interestedProperties: string[];  // property IDs
  matchedProperties: string[];  // property IDs
  notes?: string;
  lastContactedAt?: string;
  convertedAt?: string;
  lostReason?: string;
}

export interface LeadRequirements {
  budget?: number;
  currency?: string;
  country?: string;
  city?: string;
  area?: string;
  propertyType?: string;
  listingType?: string;
  bedrooms?: number;
  bathrooms?: number;
  minimumArea?: number;
  requiredFeatures?: string[];
  moveInDate?: string;
  otherRequirements?: string;
}

// --- Lead Source ---
export interface LeadSource extends BaseEntity {
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

// --- Lead Stage ---
export interface LeadStage extends BaseEntity {
  name: string;
  code: LeadStageCode | string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  isFinal: boolean;
}

// --- Lead Activity ---
export type ActivityType = 
  | 'created' | 'status_changed' | 'assigned' | 'note_added'
  | 'task_created' | 'task_completed' | 'call' | 'email_sent'
  | 'whatsapp_sent' | 'whatsapp_received' | 'viewing_scheduled'
  | 'viewing_completed' | 'offer_submitted' | 'property_shared'
  | 'requirement_updated' | 'property_matched';

export interface LeadActivity extends BaseEntity {
  lead: string;  // lead ID
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  performedBy?: string;  // user ID
}

// --- Task / Follow-up ---
export type TaskStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

export interface Task extends BaseEntity {
  lead: string;  // lead ID
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: TaskStatus;
  assignedTo: string;  // user ID
  completedAt?: string;
  completedBy?: string;  // user ID
}

// --- Viewing ---
export type ViewingStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';

export interface Viewing extends BaseEntity {
  property: string;  // property ID
  lead: string;  // lead ID
  customer: string;  // customer ID
  scheduledDate: string;
  scheduledTime: string;
  duration?: number;  // minutes
  status: ViewingStatus;
  assignedTo?: string;  // user ID (staff)
  notes?: string;
  feedback?: string;
  cancelReason?: string;
  rescheduledFrom?: string;  // viewing ID
  confirmedAt?: string;
  completedAt?: string;
}

// --- Offer ---
export type OfferStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'COUNTER_OFFER' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Offer extends BaseEntity {
  property: string;  // property ID
  lead: string;  // lead ID
  amount: number;
  currency: string;  // currency ID
  status: OfferStatus;
  submittedBy: string;  // user or customer ID
  notes?: string;
  counterAmount?: number;
  respondedAt?: string;
  respondedBy?: string;  // user ID
}

// --- WhatsApp ---
export type MessageDirection = 'incoming' | 'outgoing';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Conversation extends BaseEntity {
  lead?: string;  // lead ID
  customer: string;  // customer ID
  phoneNumber: string;
  lastMessageAt: string;
  lastMessagePreview?: string;
  unreadCount: number;
  assignedTo?: string;  // user ID
  isOptedOut: boolean;
}

export interface Message extends BaseEntity {
  conversation: string;  // conversation ID
  direction: MessageDirection;
  type: 'text' | 'image' | 'document' | 'template';
  content?: string;
  mediaUrl?: string;
  templateName?: string;
  templateParams?: string[];
  whatsappMessageId?: string;
  status: MessageStatus;
  sentBy?: string;  // user ID (for outgoing)
  deliveredAt?: string;
  readAt?: string;
  failedReason?: string;
}

export interface MessageTemplate extends BaseEntity {
  name: string;
  language: string;
  category: string;
  body: string;
  headerType?: 'text' | 'image' | 'document';
  headerContent?: string;
  footerText?: string;
  buttons?: TemplateButton[];
  whatsappTemplateId?: string;
  isApproved: boolean;
  isActive: boolean;
}

export interface TemplateButton {
  type: 'url' | 'phone' | 'quick_reply';
  text: string;
  value: string;
}

// --- Campaign ---
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'CANCELLED';

export interface Campaign extends BaseEntity {
  name: string;
  template: string;  // template ID
  status: CampaignStatus;
  audience: CampaignAudience;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;  // user ID
}

export interface CampaignAudience {
  type: 'all' | 'filter' | 'manual';
  filters?: Record<string, unknown>;
  recipientIds?: string[];
}

// --- Notification ---
export type NotificationType = 
  | 'new_lead' | 'new_enquiry' | 'new_whatsapp' | 'lead_assigned'
  | 'follow_up_due' | 'follow_up_overdue' | 'viewing_created'
  | 'viewing_changed' | 'offer_created' | 'staff_activity'
  | 'property_status_change';

export interface Notification extends BaseEntity {
  recipient: string;  // user ID
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
}

// --- Audit Log ---
export interface AuditLog extends BaseEntity {
  user: string;  // user ID
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  ip?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

// --- OTP ---
export interface OtpRecord extends BaseEntity {
  email: string;
  otpHash: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  isUsed: boolean;
  usedAt?: string;
}

// --- Favorite ---
export interface Favorite extends BaseEntity {
  customer: string;  // customer ID
  property: string;  // property ID
}

// --- Settings ---
export interface Setting extends BaseEntity {
  key: string;
  value: unknown;
  group: string;
  description?: string;
}

// --- API Response Types ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
