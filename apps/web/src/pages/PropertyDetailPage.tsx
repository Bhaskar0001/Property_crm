import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Home,
  CheckCircle,
  FileText,
  Share2,
  Phone,
  Mail,
  Zap,
  Clock,
  Car,
  AlertCircle,
  MessageSquare,
  X,
  Heart,
} from 'lucide-react';
import { usePublicProperty } from '../hooks/usePublicData';
import { formatCurrency } from '../../src/lib/utils';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useFavorites, useToggleFavorite, useSubmitEnquiry } from '../hooks/useCustomerData';

export function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = usePublicProperty(slug || '');

  const { customer } = useCustomerAuth();
  const { data: favorites = [] } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const submitEnquiry = useSubmitEnquiry();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [viewingForm, setViewingForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    preferredDate: '',
    preferredTime: 'morning',
    notes: '',
  });
  const [viewingSubmitted, setViewingSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-96 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-64 bg-slate-200 rounded-xl" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  // PRD Rule: If property is unavailable (delisted / off-market / sold), display friendly fallback banner
  if (data?.isUnavailable) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-2">
          Listing Status Notice
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
          {data.title || 'Property No Longer Available'}
        </h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-8">
          This property has been sold, let, or archived from active marketing. Our portfolio updates daily with comparable prime acquisitions.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/properties"
            className="px-6 py-2.5 bg-[#004274] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#00335a]"
          >
            Explore Active Listings
          </Link>
          <Link
            to="/contact"
            className="px-6 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-slate-50"
          >
            Contact Advisory Desk
          </Link>
        </div>
      </div>
    );
  }

  if (error || !data || !data.property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Property Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">The requested listing could not be found.</p>
        <Link
          to="/properties"
          className="px-4 py-2 bg-[#004274] text-white text-xs font-bold uppercase tracking-wider rounded-md"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  const { property, media = [], documents = [] } = data;
  const currencyCode = property.currency?.code || 'EUR';

  // Images list
  const fallbackImage =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80';
  const images = media.length > 0 ? media.map((m) => m.originalUrl) : [fallbackImage];
  const activeImage = images[activeImageIndex] || fallbackImage;

  // WhatsApp link
  const currentUrl = window.location.href;
  const whatsappMsg = encodeURIComponent(
    `Hello, I would like to enquire about ${property.title} (Ref: ${
      property.internalReference || property.slug
    }).\n${currentUrl}`
  );
  const whatsappHref = `https://wa.me/?text=${whatsappMsg}`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const isFavorited = favorites.some((fav) => fav._id === property?._id);

  const handleToggleFavorite = () => {
    if (!property) return;
    toggleFavorite.mutate({
      propertyId: property._id,
      isCurrentlyFavorited: isFavorited,
    });
  };

  const handleViewingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    try {
      await submitEnquiry.mutateAsync({
        name: viewingForm.name,
        email: viewingForm.email,
        phone: viewingForm.phone,
        propertyId: property._id,
        type: 'viewing',
        scheduledDate: viewingForm.preferredDate || undefined,
        scheduledTime: viewingForm.preferredTime || undefined,
        notes: viewingForm.notes || undefined,
      });
      setViewingSubmitted(true);
    } catch (err) {
      console.error('Failed to submit viewing:', err);
    }
  };

  return (
    <div className="bg-[#fcfdfd] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-[#004274] flex items-center">
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-[#004274]">
            Properties
          </Link>
          <span>/</span>
          {property.country && (
            <>
              <Link to={`/properties?country=${property.country._id}`} className="hover:text-[#004274]">
                {property.country.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="font-semibold text-slate-800 truncate max-w-xs">{property.title}</span>
        </nav>

        {/* Property Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {property.isFeatured && (
                <span className="bg-[#004274] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  Featured
                </span>
              )}
              {property.listingType && (
                <span className="bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border border-slate-200">
                  {property.listingType.name}
                </span>
              )}
              {property.internalReference && (
                <span className="text-slate-400 text-xs font-mono">
                  Ref: {property.internalReference}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {property.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {[property.address, property.area, property.city, property.country?.name]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>

          <div className="flex flex-col md:items-end">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#004274]">
              {property.priceOnRequest
                ? 'Price on Request'
                : formatCurrency(property.price, currencyCode)}
            </span>
            <div className="flex items-center space-x-2 mt-2">
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isFavorited
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                <span>{isFavorited ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Photo Gallery */}
        <div className="space-y-3 mb-10">
          <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-900 shadow-md">
            <img
              src={activeImage}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-24 h-16 sm:w-32 sm:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    idx === activeImageIndex ? 'border-[#004274] ring-2 ring-[#004274]/20' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Specs, Description, Features */}
          <div className="lg:col-span-2 space-y-10">
            {/* Key Specifications Grid */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Property Overview
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#004274] flex items-center justify-center shrink-0">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Bedrooms</span>
                    <span className="text-base font-bold text-slate-800">{property.bedrooms ?? '—'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#004274] flex items-center justify-center shrink-0">
                    <Bath className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Bathrooms</span>
                    <span className="text-base font-bold text-slate-800">{property.bathrooms ?? '—'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#004274] flex items-center justify-center shrink-0">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Living Area</span>
                    <span className="text-base font-bold text-slate-800">
                      {property.livingArea ? `${property.livingArea} m²` : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#004274] flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Parking</span>
                    <span className="text-base font-bold text-slate-800">
                      {property.parking ? `${property.parkingSpaces || 1} Spaces` : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional specs row */}
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Property Type</span>
                  <span className="font-semibold text-slate-800">{property.propertyType?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Year Built</span>
                  <span className="font-semibold text-slate-800">{property.yearBuilt || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Furnished</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {property.furnished ? property.furnished.replace('_', ' ') : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Views Logged</span>
                  <span className="font-semibold text-slate-800">{property.viewCount || 1}</span>
                </div>
              </div>
            </div>

            {/* Ireland BER Energy Rating Box */}
            {property.berRating && (
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-700 text-white flex flex-col items-center justify-center shadow-md shrink-0">
                    <Zap className="w-5 h-5" />
                    <span className="text-xs font-black">BER</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Building Energy Rating: {property.berRating}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Complies with the Irish Energy Performance of Buildings Directive (EPBD).
                      {property.berNumber && ` Certificate No: ${property.berNumber}`}
                    </p>
                  </div>
                </div>
                {property.berCertificateUrl && (
                  <a
                    href={property.berCertificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-emerald-800 hover:underline"
                  >
                    View Certificate
                  </a>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Description</h2>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description ||
                  'No detailed description has been provided for this listing yet. Contact our designated property manager for complete architectural specifications.'}
              </div>
            </div>

            {/* Features & Amenities */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Features & Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.features.map((feat) => (
                    <div key={feat._id} className="flex items-center space-x-2 text-xs font-medium text-slate-700">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Floor Plans & Public Documents */}
            {documents.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Brochures & Floor Plans</h2>
                <div className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <div key={doc._id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-[#004274]" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                          <span className="text-[10px] text-slate-400 uppercase">{doc.type}</span>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact & Viewing Action Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg sticky top-28 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#004274] block mb-1">
                  Representation & Sales
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {formatCurrency(property.price, currencyCode)}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Guideline Price • Exclusive Instruction
                </p>
              </div>

              {/* Agent card */}
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-11 h-11 rounded-full bg-[#004274] text-white flex items-center justify-center font-bold text-sm">
                  {property.createdBy?.name?.[0] || 'A'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {property.createdBy?.name || 'Senior Property Advisor'}
                  </h4>
                  <p className="text-[11px] text-slate-500">Property Advisory Desk</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enquire On WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowViewingModal(true)}
                  className="w-full py-3 bg-[#004274] hover:bg-[#00335a] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request Private Viewing</span>
                </button>
              </div>

              {/* Quick direct contact info */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <a
                  href="tel:+35312345678"
                  className="flex items-center space-x-2 hover:text-[#004274]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#6fabca]" />
                  <span>+353 1 234 5678</span>
                </a>
                <a
                  href="mailto:info@propertyos.com"
                  className="flex items-center space-x-2 hover:text-[#004274]"
                >
                  <Mail className="w-3.5 h-3.5 text-[#6fabca]" />
                  <span>info@propertyos.com</span>
                </a>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Mon - Sat 08:30 - 18:30 GMT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Viewing Request Modal */}
      {showViewingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowViewingModal(false);
                setViewingSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {viewingSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Viewing Request Received</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you, {viewingForm.name}. A designated agent will contact you shortly to confirm access times for {property.title}.
                </p>
                <button
                  onClick={() => {
                    setShowViewingModal(false);
                    setViewingSubmitted(false);
                  }}
                  className="px-6 py-2 bg-[#004274] text-white text-xs font-bold uppercase tracking-wider rounded-md"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleViewingSubmit} className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#004274]">
                    Private Appointment
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Schedule a Viewing
                  </h3>
                  <p className="text-xs text-slate-500">
                    For {property.title}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={viewingForm.name}
                    onChange={(e) => setViewingForm({ ...viewingForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    placeholder="e.g. Eleanor Vance"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={viewingForm.email}
                      onChange={(e) => setViewingForm({ ...viewingForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      placeholder="eleanor@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={viewingForm.phone}
                      onChange={(e) => setViewingForm({ ...viewingForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      placeholder="+353 87 123 4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={viewingForm.preferredDate}
                      onChange={(e) => setViewingForm({ ...viewingForm, preferredDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Time Window
                    </label>
                    <select
                      value={viewingForm.preferredTime}
                      onChange={(e) => setViewingForm({ ...viewingForm, preferredTime: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="morning">Morning (09:00 - 12:00)</option>
                      <option value="afternoon">Afternoon (12:00 - 16:00)</option>
                      <option value="evening">Late Afternoon (16:00 - 19:00)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Specific Requirements or Questions
                  </label>
                  <textarea
                    rows={2}
                    value={viewingForm.notes}
                    onChange={(e) => setViewingForm({ ...viewingForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    placeholder="Cash purchaser / mortgage approved / relocation..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#004274] hover:bg-[#00335a] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                >
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
