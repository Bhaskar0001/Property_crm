export interface PublicProperty {
  _id: string;
  internalReference?: string;
  title: string;
  slug: string;
  country?: { _id: string; name: string; isoCode: string; currency?: string; phoneCode?: string };
  region?: string;
  city?: string;
  area?: string;
  address?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  propertyType?: { _id: string; name: string; slug: string; icon?: string };
  listingType?: { _id: string; name: string; slug: string };
  tenureType?: { _id: string; name: string; slug: string };
  status?: { _id: string; name: string; code: string; color?: string };
  price?: number;
  currency?: { _id: string; code: string; symbol: string; name: string };
  priceOnRequest?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  plotArea?: number;
  floor?: number;
  totalFloors?: number;
  parking?: boolean;
  parkingSpaces?: number;
  yearBuilt?: number;
  furnished?: string;
  condition?: string;
  heating?: string;
  berRating?: string;
  berNumber?: string;
  berCertificateUrl?: string;
  description?: string;
  shortDescription?: string;
  features?: Array<{ _id: string; name: string; slug: string; icon?: string }>;
  coverImage?: string;
  imageCount?: number;
  videoUrl?: string;
  virtualTourUrl?: string;
  floorPlanUrl?: string;
  brochureUrl?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewsCount?: number;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: { name: string; email: string; phone?: string };
}

export interface PublicMedia {
  _id: string;
  property: string;
  type: string;
  originalUrl: string;
  thumbnailUrl?: string;
  webUrl?: string;
  fileName: string;
  isCover: boolean;
  sortOrder: number;
  altText?: string;
}

export interface PublicDocument {
  _id: string;
  property: string;
  name: string;
  type: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

export interface PropertyDetailResponse {
  isUnavailable: boolean;
  title?: string;
  slug?: string;
  message?: string;
  property?: PublicProperty;
  media?: PublicMedia[];
  documents?: PublicDocument[];
}

export interface PublicCountry {
  _id: string;
  name: string;
  isoCode: string;
  currency?: any;
  phoneCode?: string;
  flag?: string;
  flagUrl?: string;
  imageUrl?: string;
  propertyCount: number;
}

export interface PublicPropertyType {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  propertyCount: number;
}

export interface PublicListingType {
  _id: string;
  name: string;
  slug: string;
  propertyCount: number;
}

export interface PublicPropertiesFilter {
  search?: string;
  country?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  features?: string;
  city?: string;
  berRating?: string;
  isFeatured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  neLat?: number;
  neLng?: number;
  swLat?: number;
  swLng?: number;
  page?: number;
  limit?: number;
}
