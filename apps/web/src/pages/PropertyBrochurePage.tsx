import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicProperty, useContactInfo } from '../hooks/usePublicData';
import {
  Printer,
  ArrowLeft,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Shield,
  Building,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Car,
} from 'lucide-react';

export function PropertyBrochurePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = usePublicProperty(slug || '');
  const { data: contact } = useContactInfo();

  // Auto trigger print if query param ?autoPrint=1 is set
  useEffect(() => {
    if (data && new URLSearchParams(window.location.search).get('autoPrint') === 'true') {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#004274] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Generating Property Brochure...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <p className="text-red-600 font-semibold mb-2">Property Not Found</p>
          <p className="text-slate-500 text-sm mb-6">Unable to generate brochure for this property.</p>
          <Link
            to="/properties"
            className="inline-flex items-center px-4 py-2 bg-[#004274] text-white rounded-lg text-sm font-semibold hover:bg-[#003156] transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  const { property, media = [] } = data;
  const currencySymbol = property.currency?.symbol || '€';
  const priceDisplay = property.priceOnRequest
    ? 'Price on Request'
    : `${currencySymbol}${property.price?.toLocaleString() || 'N/A'}`;

  const coverImg = property.coverImage || (media.length > 0 ? media[0].originalUrl : null);
  const galleryImages = media
    .filter((m) => m.originalUrl !== coverImg)
    .slice(0, 3)
    .map((m) => m.originalUrl);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 print:bg-white print:p-0">
      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .brochure-sheet {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .page-break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Floating Action Bar (Hidden when printing) */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Link
          to={`/properties/${property.slug}`}
          className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-[#004274] transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Listing
        </Link>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Tip: In print preview, select <strong>Save as PDF</strong>
          </span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 bg-[#004274] text-white rounded-lg text-sm font-semibold hover:bg-[#003156] shadow-sm transition"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Brochure Sheet */}
      <article className="brochure-sheet max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden p-8 sm:p-12 space-y-8">
        {/* Header Branding */}
        <header className="flex items-start justify-between border-b-2 border-[#004274] pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-[#004274]">{contact?.companyName?.toUpperCase() || 'AbroadAccommodation'}</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#004274]/10 text-[#004274] rounded">ESTATE ADVISORY</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Prime International Real Estate & Property Advisory</p>
          </div>
          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <p className="font-semibold text-slate-800">Reference: {property.internalReference || property.slug.substring(0, 10).toUpperCase()}</p>
            <p>Generated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p className="text-[#004274] font-medium">AbroadAccommodation.com</p>
          </div>
        </header>

        {/* Property Title & Price Banner */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center space-x-2">
              {property.listingType && (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-[#004274] text-white rounded">
                  {property.listingType.name}
                </span>
              )}
              {property.propertyType && (
                <span className="text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded">
                  {property.propertyType.name}
                </span>
              )}
              {property.status && (
                <span className="text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded">
                  {property.status.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {property.title}
            </h1>
            <p className="text-sm text-slate-600 flex items-center">
              <MapPin className="w-4 h-4 text-[#004274] mr-1.5 shrink-0" />
              {[property.address, property.area, property.city, property.country?.name].filter(Boolean).join(', ')}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Guide Price</span>
            <div className="text-2xl sm:text-3xl font-black text-[#004274]">{priceDisplay}</div>
            {property.tenureType && (
              <span className="text-xs text-slate-500 font-medium">Tenure: {property.tenureType.name}</span>
            )}
          </div>
        </div>

        {/* Image Showcase Grid */}
        <div className="space-y-3">
          {coverImg && (
            <div className="h-80 sm:h-96 w-full rounded-xl overflow-hidden bg-slate-100 relative">
              <img
                src={coverImg}
                alt={property.title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
          )}
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {galleryImages.map((url, i) => (
                <div key={i} className="h-32 sm:h-36 rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={url}
                    alt={`Property view ${i + 1}`}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Key Specifications Grid */}
        <div className="page-break-inside-avoid bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Key Specifications & Details
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {property.bedrooms !== undefined && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-2xs border border-slate-200 text-[#004274]">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Bedrooms</div>
                  <div className="text-base font-bold text-slate-900">{property.bedrooms} Beds</div>
                </div>
              </div>
            )}

            {property.bathrooms !== undefined && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-2xs border border-slate-200 text-[#004274]">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Bathrooms</div>
                  <div className="text-base font-bold text-slate-900">{property.bathrooms} Baths</div>
                </div>
              </div>
            )}

            {property.livingArea && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-2xs border border-slate-200 text-[#004274]">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Internal Area</div>
                  <div className="text-base font-bold text-slate-900">{property.livingArea.toLocaleString()} sq ft</div>
                </div>
              </div>
            )}

            {property.parking !== undefined && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-2xs border border-slate-200 text-[#004274]">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Parking</div>
                  <div className="text-base font-bold text-slate-900">
                    {property.parking ? `${property.parkingSpaces || 1} Space(s)` : 'Street'}
                  </div>
                </div>
              </div>
            )}

            {property.yearBuilt && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-2xs border border-slate-200 text-[#004274]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Year Built</div>
                  <div className="text-base font-bold text-slate-900">{property.yearBuilt}</div>
                </div>
              </div>
            )}

            {property.berRating && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-2xs border border-slate-200 text-[#004274]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Energy Rating</div>
                  <div className="text-base font-bold text-slate-900">BER {property.berRating}</div>
                </div>
              </div>
            )}

            {property.totalFloors && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-2xs border border-slate-200 text-[#004274]">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Floor Level</div>
                  <div className="text-base font-bold text-slate-900">
                    {property.floor !== undefined ? `${property.floor} / ${property.totalFloors}` : `${property.totalFloors} Floors`}
                  </div>
                </div>
              </div>
            )}

            {property.furnished && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-2xs border border-slate-200 text-[#004274]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Furnishing</div>
                  <div className="text-base font-bold text-slate-900 capitalize">{property.furnished.replace('_', ' ')}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Executive Summary / Description */}
        {property.description && (
          <div className="page-break-inside-avoid space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
              Property Description & Overview
            </h2>
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {property.description}
            </div>
          </div>
        )}

        {/* Features & Amenities */}
        {property.features && property.features.length > 0 && (
          <div className="page-break-inside-avoid space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
              Key Features & Amenities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {property.features.map((feat) => (
                <div
                  key={feat._id}
                  className="flex items-center space-x-2 text-xs text-slate-800 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-lg"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{feat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent / Agency Contact Footer Card */}
        <footer className="page-break-inside-avoid mt-8 pt-6 border-t-2 border-slate-200 bg-slate-50 -mx-8 -mb-8 sm:-mx-12 sm:-mb-12 p-8 sm:p-10 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="text-sm font-bold text-slate-900">{contact?.companyName?.toUpperCase() || 'AbroadAccommodation'} — PRIME REAL ESTATE</div>
            <p className="text-xs text-slate-600 max-w-md">
              To arrange an in-person viewing, request floorplans, or inquire regarding legal conveyance, contact our advisory desk directly.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-700">
              {contact?.phone && (
                <span className="flex items-center">
                  <Phone className="w-3.5 h-3.5 text-[#004274] mr-1.5" />
                  {contact.phone}
                </span>
              )}
              {contact?.email && (
                <span className="flex items-center">
                  <Mail className="w-3.5 h-3.5 text-[#004274] mr-1.5" />
                  {contact.email}
                </span>
              )}
              <span className="flex items-center">
                <Globe className="w-3.5 h-3.5 text-[#004274] mr-1.5" />
                AbroadAccommodation.com
              </span>
            </div>
          </div>

          <div className="text-center sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Online Listing URL</p>
            <p className="text-xs font-mono font-semibold text-[#004274]">
              /properties/{property.slug}
            </p>
            <p className="text-[10px] text-slate-400 mt-2">
              Disclaimer: Details are prepared in good faith and do not form part of any binding contract.
            </p>
          </div>
        </footer>
      </article>
    </div>
  );
}
