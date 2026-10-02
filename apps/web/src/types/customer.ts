import { PublicProperty } from './index';

export interface CustomerUser {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  preferences?: {
    countries?: string[];
    propertyTypes?: string[];
    minBudget?: number;
    maxBudget?: number;
    bedrooms?: number;
  };
}

export interface CustomerViewing {
  _id: string;
  property: PublicProperty;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  createdAt: string;
}

export interface CustomerLead {
  _id: string;
  property?: PublicProperty;
  stage?: {
    name: string;
    code: string;
    color?: string;
  };
  priority: string;
  notes?: string;
  createdAt: string;
}

export interface CustomerEnquiriesResponse {
  viewings: CustomerViewing[];
  leads: CustomerLead[];
}
