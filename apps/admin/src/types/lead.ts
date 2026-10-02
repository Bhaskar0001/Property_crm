export interface LeadCustomer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  preferences?: {
    minBudget?: number;
    maxBudget?: number;
    bedrooms?: number;
  };
}

export interface LeadStage {
  _id: string;
  name: string;
  code: string;
  color?: string;
  sortOrder: number;
  isFinal?: boolean;
}

export interface LeadSource {
  _id: string;
  name: string;
  slug: string;
}

export interface LeadStaff {
  _id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
}

export interface LeadProperty {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  price?: number;
  city?: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  berRating?: string;
}

export interface Lead {
  _id: string;
  customer?: LeadCustomer;
  property?: LeadProperty;
  source?: LeadSource;
  stage?: LeadStage;
  assignedTo?: LeadStaff;
  priority: 'low' | 'medium' | 'high';
  requirements?: {
    minBudget?: number;
    maxBudget?: number;
    bedrooms?: number;
    bathrooms?: number;
    country?: string;
    city?: string;
    propertyType?: string;
    notes?: string;
  };
  interestedProperties?: LeadProperty[];
  matchedProperties?: LeadProperty[];
  notes?: string;
  lastContactedAt?: string;
  convertedAt?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivity {
  _id: string;
  lead: string;
  type: string;
  description: string;
  metadata?: any;
  performedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface LeadTask {
  _id: string;
  lead: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  completedAt?: string;
  createdAt: string;
}

export interface LeadQueryParams {
  search?: string;
  stage?: string;
  source?: string;
  priority?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}
