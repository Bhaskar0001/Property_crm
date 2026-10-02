import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProperty, useCreateProperty, useUpdateProperty } from '../../hooks/useProperties';
import {
  useCountries,
  usePropertyTypes,
  useListingTypes,
  useTenureTypes,
  usePropertyStatuses,
  usePropertyFeatures,
  useCurrencies,
} from '../../hooks/useAdminConfig';
import { useGeneratePropertyDescription } from '../../hooks/useAI';
import { ArrowLeft, Check, Save, Sparkles } from 'lucide-react';

const STEPS = [
  'Identity & Location',
  'Listing & Pricing',
  'Specs & Energy',
  'Features',
  'Description & SEO',
  'Publication',
];

export function PropertyFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const { data: property, isLoading: isPropertyLoading } = useProperty(id || '');
  const { data: countries } = useCountries();
  const { data: propertyTypes } = usePropertyTypes();
  const { data: listingTypes } = useListingTypes();
  const { data: tenureTypes } = useTenureTypes();
  const { data: statuses } = usePropertyStatuses();
  const { data: features } = usePropertyFeatures();
  const { data: currencies } = useCurrencies();

  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const generateDescMutation = useGeneratePropertyDescription();

  // Form State
  const [formData, setFormData] = useState<any>({
    title: '',
    internalReference: '',
    country: '',
    region: '',
    city: '',
    area: '',
    address: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    propertyType: '',
    listingType: '',
    tenure: '',
    status: '',
    price: '',
    currency: '',
    priceOnRequest: false,
    bedrooms: '',
    bathrooms: '',
    livingArea: '',
    plotArea: '',
    floor: '',
    totalFloors: '',
    parking: false,
    parkingSpaces: '',
    yearBuilt: '',
    furnished: 'unfurnished',
    condition: 'good',
    heating: '',
    berRating: '',
    berNumber: '',
    features: [] as string[],
    shortDescription: '',
    description: '',
    seoTitle: '',
    metaDescription: '',
    isPublished: false,
    isFeatured: false,
    isVisibleInSearch: true,
    showPrice: true,
    showAddress: true,
    showMap: true,
    showWhatsApp: true,
    showEnquiry: true,
  });

  useEffect(() => {
    if (property && isEdit) {
      setFormData({
        title: property.title || '',
        internalReference: property.internalReference || '',
        country: property.country?._id || property.country || '',
        region: property.region || '',
        city: property.city || '',
        area: property.area || '',
        address: property.address || '',
        postalCode: property.postalCode || '',
        latitude: property.latitude || '',
        longitude: property.longitude || '',
        propertyType: property.propertyType?._id || property.propertyType || '',
        listingType: property.listingType?._id || property.listingType || '',
        tenure: property.tenure?._id || property.tenure || '',
        status: property.status?._id || property.status || '',
        price: property.price || '',
        currency: property.currency?._id || property.currency || '',
        priceOnRequest: property.priceOnRequest || false,
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        livingArea: property.livingArea || '',
        plotArea: property.plotArea || '',
        floor: property.floor || '',
        totalFloors: property.totalFloors || '',
        parking: property.parking || false,
        parkingSpaces: property.parkingSpaces || '',
        yearBuilt: property.yearBuilt || '',
        furnished: property.furnished || 'unfurnished',
        condition: property.condition || 'good',
        heating: property.heating || '',
        berRating: property.berRating || '',
        berNumber: property.berNumber || '',
        features: (property.features || []).map((f: any) => f._id || f),
        shortDescription: property.shortDescription || '',
        description: property.description || '',
        seoTitle: property.seoTitle || '',
        metaDescription: property.metaDescription || '',
        isPublished: property.isPublished || false,
        isFeatured: property.isFeatured || false,
        isVisibleInSearch: property.isVisibleInSearch ?? true,
        showPrice: property.showPrice ?? true,
        showAddress: property.showAddress ?? true,
        showMap: property.showMap ?? true,
        showWhatsApp: property.showWhatsApp ?? true,
        showEnquiry: property.showEnquiry ?? true,
      });
    }
  }, [property, isEdit]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (featureId: string) => {
    setFormData((prev: any) => {
      const exists = prev.features.includes(featureId);
      return {
        ...prev,
        features: exists
          ? prev.features.filter((id: string) => id !== featureId)
          : [...prev.features, featureId],
      };
    });
  };

  const handleSubmit = async (publishImmediately?: boolean) => {
    const payload = {
      ...formData,
      price: formData.price ? Number(formData.price) : undefined,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      livingArea: formData.livingArea ? Number(formData.livingArea) : undefined,
      plotArea: formData.plotArea ? Number(formData.plotArea) : undefined,
      floor: formData.floor ? Number(formData.floor) : undefined,
      totalFloors: formData.totalFloors ? Number(formData.totalFloors) : undefined,
      parkingSpaces: formData.parkingSpaces ? Number(formData.parkingSpaces) : undefined,
      yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
      isPublished: publishImmediately !== undefined ? publishImmediately : formData.isPublished,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: id!, payload });
      } else {
        const created = await createMutation.mutateAsync(payload);
        navigate(`/properties/${created.data._id}/media`);
        return;
      }
      navigate('/properties');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save property');
    }
  };

  if (isEdit && isPropertyLoading) {
    return <div className="p-12 text-center text-gray-500">Loading property details...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/properties" className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? `Edit: ${formData.title || 'Property'}` : 'New Property Listing'}
            </h1>
            <p className="text-sm text-gray-500">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#004274] hover:bg-[#00335a] shadow-sm"
          >
            <Check className="mr-2 h-4 w-4" />
            Publish
          </button>
        </div>
      </div>

      {/* Wizard Step Navigation */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto divide-x divide-gray-100">
          {STEPS.map((step, idx) => (
            <button
              key={step}
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 py-2.5 px-3 text-xs font-semibold text-center whitespace-nowrap transition ${
                currentStep === idx
                  ? 'text-[#004274] border-b-2 border-[#004274] bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {idx + 1}. {step}
            </button>
          ))}
        </div>
      </div>

      {/* Step Panels */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        {/* Step 1: Identity & Location */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Basic Identity & Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Property Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luxury 3-Bed Penthouse overlooking Grand Canal"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Reference / MLS ID</label>
                <input
                  type="text"
                  placeholder="e.g. DUB-APT-0492"
                  value={formData.internalReference}
                  onChange={(e) => handleChange('internalReference', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Country *</label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
                >
                  <option value="">Select Country</option>
                  {(countries || []).map((c: any) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.isoCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City / Town</label>
                <input
                  type="text"
                  placeholder="e.g. Dublin"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Region / County</label>
                <input
                  type="text"
                  placeholder="e.g. Co. Dublin"
                  value={formData.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Area / Neighborhood</label>
                <input
                  type="text"
                  placeholder="e.g. Grand Canal Dock"
                  value={formData.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 14 Hanover Quay, Grand Canal Dock"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Postal Code / Eircode</label>
                <input
                  type="text"
                  placeholder="e.g. D02 Y049"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="53.344"
                    value={formData.latitude}
                    onChange={(e) => handleChange('latitude', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="-6.237"
                    value={formData.longitude}
                    onChange={(e) => handleChange('longitude', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Listing & Pricing */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Listing & Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Property Type *</label>
                <select
                  required
                  value={formData.propertyType}
                  onChange={(e) => handleChange('propertyType', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
                >
                  <option value="">Select Type</option>
                  {(propertyTypes || []).map((t: any) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Listing Type *</label>
                <select
                  required
                  value={formData.listingType}
                  onChange={(e) => handleChange('listingType', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
                >
                  <option value="">Select Listing Type</option>
                  {(listingTypes || []).map((lt: any) => (
                    <option key={lt._id} value={lt._id}>{lt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tenure</label>
                <select
                  value={formData.tenure}
                  onChange={(e) => handleChange('tenure', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
                >
                  <option value="">Select Tenure</option>
                  {(tenureTypes || []).map((tt: any) => (
                    <option key={tt._id} value={tt._id}>{tt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Listing Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
                >
                  <option value="">Select Status</option>
                  {(statuses || []).map((s: any) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  disabled={formData.priceOnRequest}
                  placeholder="e.g. 750000"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
                >
                  <option value="">Select Currency</option>
                  {(currencies || []).map((c: any) => (
                    <option key={c._id} value={c._id}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.priceOnRequest}
                    onChange={(e) => handleChange('priceOnRequest', e.target.checked)}
                    className="h-4 w-4 text-[#004274] rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 font-medium">Price on Request (hides exact numeric price from public)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Specs & Energy */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Specifications & Ireland BER</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  placeholder="3"
                  value={formData.bedrooms}
                  onChange={(e) => handleChange('bedrooms', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  placeholder="2"
                  value={formData.bathrooms}
                  onChange={(e) => handleChange('bathrooms', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Living Area (m²)</label>
                <input
                  type="number"
                  placeholder="120"
                  value={formData.livingArea}
                  onChange={(e) => handleChange('livingArea', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Plot Area (m²)</label>
                <input
                  type="number"
                  placeholder="350"
                  value={formData.plotArea}
                  onChange={(e) => handleChange('plotArea', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Floor Level</label>
                <input
                  type="number"
                  placeholder="4"
                  value={formData.floor}
                  onChange={(e) => handleChange('floor', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Total Floors</label>
                <input
                  type="number"
                  placeholder="6"
                  value={formData.totalFloors}
                  onChange={(e) => handleChange('totalFloors', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Furnishing</label>
                <select
                  value={formData.furnished}
                  onChange={(e) => handleChange('furnished', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
                >
                  <option value="unfurnished">Unfurnished</option>
                  <option value="partly_furnished">Partly Furnished</option>
                  <option value="fully_furnished">Fully Furnished</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Year Built</label>
                <input
                  type="number"
                  placeholder="2021"
                  value={formData.yearBuilt}
                  onChange={(e) => handleChange('yearBuilt', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              {/* Ireland BER Rating */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ireland BER Rating</label>
                <select
                  value={formData.berRating}
                  onChange={(e) => handleChange('berRating', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none font-semibold text-green-700"
                >
                  <option value="">Exempt / Pending</option>
                  {['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'E1', 'E2', 'F', 'G'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">BER Number</label>
                <input
                  type="text"
                  placeholder="109283746"
                  value={formData.berNumber}
                  onChange={(e) => handleChange('berNumber', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Heating Type</label>
                <input
                  type="text"
                  placeholder="Heat Pump / Gas Central"
                  value={formData.heating}
                  onChange={(e) => handleChange('heating', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="parkingCheck"
                  checked={formData.parking}
                  onChange={(e) => handleChange('parking', e.target.checked)}
                  className="h-4 w-4 text-[#004274] rounded border-gray-300"
                />
                <label htmlFor="parkingCheck" className="text-sm font-medium text-gray-700">Dedicated Parking</label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Amenities & Features */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Amenities & Features</h3>
            <p className="text-sm text-gray-500 mb-4">Select all features and conveniences applicable to this property.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(features || []).map((feat: any) => {
                const isChecked = formData.features.includes(feat._id);
                return (
                  <button
                    type="button"
                    key={feat._id}
                    onClick={() => toggleFeature(feat._id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left text-sm font-medium transition ${
                      isChecked
                        ? 'border-[#004274] bg-blue-50/70 text-[#004274]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded flex items-center justify-center border ${
                      isChecked ? 'bg-[#004274] border-[#004274] text-white' : 'border-gray-300'
                    }`}>
                      {isChecked && <Check className="h-3 w-3" />}
                    </div>
                    <span>{feat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Description & SEO */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Description & SEO Metadata</h3>
                <p className="text-xs text-gray-500">Draft or generate compelling property copy.</p>
              </div>
              <button
                type="button"
                disabled={generateDescMutation.isPending}
                onClick={() => {
                  if (!formData.title || !formData.city) {
                    alert('Please enter at least a Property Title and City in Step 1 first.');
                    return;
                  }
                  generateDescMutation.mutate(
                    {
                      title: formData.title,
                      city: formData.city,
                      area: formData.area,
                      price: formData.price ? Number(formData.price) : undefined,
                      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
                      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
                      livingArea: formData.livingArea ? Number(formData.livingArea) : undefined,
                      berRating: formData.berRating,
                    },
                    {
                      onSuccess: (data) => {
                        handleChange('shortDescription', data.shortDescription);
                        handleChange('description', data.description);
                      },
                    }
                  );
                }}
                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white rounded-md text-xs font-semibold shadow-xs disabled:opacity-50 transition"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
                {generateDescMutation.isPending ? 'Generating Copy...' : 'Generate with AI'}
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Short Summary (Featured Snippet)</label>
              <textarea
                rows={2}
                placeholder="A brief 1-2 sentence compelling summary of the property..."
                value={formData.shortDescription}
                onChange={(e) => handleChange('shortDescription', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Detailed Description</label>
              <textarea
                rows={6}
                placeholder="Complete property overview, layout description, neighborhood features..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
              />
            </div>

            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">SEO Meta Title</label>
                <input
                  type="text"
                  placeholder="Defaults to Property Title if empty"
                  value={formData.seoTitle}
                  onChange={(e) => handleChange('seoTitle', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">SEO Meta Description</label>
                <input
                  type="text"
                  placeholder="Search engine summary text..."
                  value={formData.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Publication Controls */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Publication & Visibility Controls</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { field: 'isPublished', title: 'Live on Public Website', desc: 'Immediately publish this listing on the public site' },
                { field: 'isFeatured', title: 'Featured Property', desc: 'Display in hero carousel and homepage featured section' },
                { field: 'isVisibleInSearch', title: 'Visible in Search Results', desc: 'Allow indexing in public search and filter queries' },
                { field: 'showPrice', title: 'Show Price publicly', desc: 'Display price or show contact for price' },
                { field: 'showAddress', title: 'Show Street Address', desc: 'Show exact street address or area only' },
                { field: 'showMap', title: 'Show Interactive Map', desc: 'Render Google Map pin on property detail view' },
                { field: 'showWhatsApp', title: 'Show WhatsApp Button', desc: 'Allow instant WhatsApp enquiry on this property' },
                { field: 'showEnquiry', title: 'Show Enquiry Form', desc: 'Allow leads to register direct interest and schedule viewings' },
              ].map((item) => (
                <div key={item.field} className="flex items-center justify-between p-3.5 border border-gray-200 rounded-lg">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange(item.field, !formData[item.field])}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData[item.field] ? 'bg-[#004274]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData[item.field] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200">
          <button
            type="button"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Back
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="px-5 py-2 bg-[#004274] text-white rounded-lg text-sm font-semibold hover:bg-[#00335a]"
            >
              Continue to {STEPS[currentStep + 1]}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm"
            >
              Finish & Save Property
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
