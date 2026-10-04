import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Calendar,
  User,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Tag,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import {
  useFavorites,
  useCustomerEnquiries,
  useCustomerOffers,
  useUpdateCustomerProfile,
} from '../hooks/useCustomerData';
import { PropertyCard } from '../components/property/PropertyCard';

export function CustomerPortalPage() {
  const { customer, openLoginModal, logout } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'enquiries' | 'offers' | 'profile'>('favorites');

  const { data: favorites = [], isLoading: loadingFavorites } = useFavorites();
  const { data: enquiries, isLoading: loadingEnquiries } = useCustomerEnquiries();
  const { data: offers = [], isLoading: loadingOffers } = useCustomerOffers();
  const updateProfile = useUpdateCustomerProfile();


  // Profile form state
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [minBudget, setMinBudget] = useState(customer?.preferences?.minBudget || '');
  const [maxBudget, setMaxBudget] = useState(customer?.preferences?.maxBudget || '');
  const [bedrooms, setBedrooms] = useState(customer?.preferences?.bedrooms || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!customer) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 py-16 px-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-lg border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-[#004274]/10 text-[#004274] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Client Advisory Portal
          </h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Sign in via your email to view your saved properties, track viewing requests, and manage personal acquisition criteria.
          </p>
          <button
            onClick={openLoginModal}
            className="w-full py-3 bg-[#004274] hover:bg-[#00335a] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md"
          >
            Sign In with Email Code
          </button>
        </div>
      </div>
    );
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({
      name,
      phone,
      preferences: {
        minBudget: minBudget ? Number(minBudget) : undefined,
        maxBudget: maxBudget ? Number(maxBudget) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
      },
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const viewings = enquiries?.viewings || [];
  const leads = enquiries?.leads || [];

  return (
    <div className="bg-[#fcfdfd] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#004274] block mb-1">
              Private Client Desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {customer.name || customer.email}
            </h1>
            <p className="text-xs text-slate-500 mt-1">{customer.email}</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={logout}
              className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-3 border-b border-slate-200 pb-3 mb-8">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
              activeTab === 'favorites'
                ? 'bg-[#004274] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#004274] bg-white border border-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Properties ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
              activeTab === 'enquiries'
                ? 'bg-[#004274] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#004274] bg-white border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Viewings & Requests ({viewings.length + leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
              activeTab === 'offers'
                ? 'bg-[#004274] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#004274] bg-white border border-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>My Offers & Deals ({offers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#004274] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#004274] bg-white border border-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Acquisition Criteria</span>
          </button>
        </div>

        {/* Tab 1: Saved Favorites */}
        {activeTab === 'favorites' && (
          <div>
            {loadingFavorites ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-80 bg-slate-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((prop) => (
                  <PropertyCard key={prop._id} property={prop} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Saved Properties</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                  Bookmark prime residences or commercial assets by clicking the heart button on any listing card.
                </p>
                <Link
                  to="/properties"
                  className="px-5 py-2.5 bg-[#004274] text-white text-xs font-bold uppercase tracking-wider rounded-lg"
                >
                  Explore Current Portfolio
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Viewings & Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="space-y-8">
            {/* Viewings List */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#004274]" />
                <span>Scheduled Viewing Appointments</span>
              </h2>

              {loadingEnquiries ? (
                <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
              ) : viewings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {viewings.map((viewing) => (
                    <div key={viewing._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#004274]">
                            {viewing.status}
                          </span>
                          <span className="text-xs text-slate-500">
                            Requested on {new Date(viewing.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {viewing.property?.title || 'Private Property Viewing'}
                        </h4>
                        <div className="flex items-center text-xs text-slate-500 space-x-3 mt-1">
                          <span>Date: {new Date(viewing.scheduledDate).toLocaleDateString()}</span>
                          <span>Window: {viewing.scheduledTime}</span>
                        </div>
                      </div>

                      {viewing.property?.slug && (
                        <Link
                          to={`/properties/${viewing.property.slug}`}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-[#004274] hover:underline"
                        >
                          <span>Listing Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">No active viewing appointments recorded.</p>
              )}
            </div>

            {/* General Lead Requests */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#004274]" />
                <span>General Enquiries & Briefings</span>
              </h2>

              {loadingEnquiries ? (
                <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
              ) : leads.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <div key={lead._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className="text-xs font-bold uppercase px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: lead.stage?.color || '#004274' }}
                          >
                            {lead.stage?.name || 'In Progress'}
                          </span>
                          <span className="text-xs text-slate-500">
                            Submitted {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1.5 line-clamp-2">
                          {lead.notes || 'General acquisition enquiry.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">No enquiries currently pending.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: My Offers & Deals */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-[#004274]" />
                  <span>Your Submitted Purchase Offers & Negotiations</span>
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {offers.length} {offers.length === 1 ? 'active offer' : 'active offers'}
                </span>
              </div>

              {loadingOffers ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : offers.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {offers.map((offer: any) => {
                    const status = (offer.status || 'SUBMITTED').toUpperCase();
                    const currencySymbol = offer.currency?.symbol || '€';
                    const isCounter = status === 'COUNTER_OFFER' || status === 'COUNTERED';
                    const isAccepted = status === 'ACCEPTED';
                    const isRejected = status === 'REJECTED';

                    return (
                      <div key={offer._id} className="py-5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-start space-x-3.5">
                            {offer.property?.coverImage && (
                              <img
                                src={offer.property.coverImage}
                                alt=""
                                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            )}
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                {isAccepted ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Offer Accepted
                                  </span>
                                ) : isCounter ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                                    <RotateCcw className="w-3 h-3 mr-1" /> Counter Offer Received
                                  </span>
                                ) : isRejected ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                                    Declined
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#004274]">
                                    <Clock className="w-3 h-3 mr-1" /> Under Review
                                  </span>
                                )}
                                <span className="text-xs text-slate-400">
                                  Submitted {new Date(offer.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              <h3 className="text-sm font-bold text-slate-900">
                                {offer.property?.title || 'Property Acquisition Instruction'}
                              </h3>
                              <p className="text-xs text-slate-500">
                                {[offer.property?.area, offer.property?.city].filter(Boolean).join(', ')}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                                <div>
                                  <span className="text-slate-400">Your Offer: </span>
                                  <span className="font-extrabold text-[#004274]">
                                    {currencySymbol}
                                    {Number(offer.amount || 0).toLocaleString()}
                                  </span>
                                </div>
                                {offer.purchasingPosition && (
                                  <div className="text-slate-500 font-medium">
                                    • {offer.purchasingPosition}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-end gap-2 shrink-0">
                            {offer.property?.slug && (
                              <Link
                                to={`/properties/${offer.property.slug}`}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                              >
                                <span>View Property</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                            <Link
                              to="/contact"
                              className="inline-flex items-center text-xs font-semibold text-[#004274] hover:underline"
                            >
                              Contact Agent
                            </Link>
                          </div>
                        </div>

                        {/* Counter-Offer Notification Box */}
                        {isCounter && (
                          <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-900">
                                Vendor Counter Offer Proposal:
                              </span>
                              {offer.counterAmount && (
                                <span className="text-sm font-extrabold text-amber-950">
                                  {currencySymbol}
                                  {Number(offer.counterAmount).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-amber-800 leading-relaxed">
                              {offer.notes ||
                                'The seller has proposed a counter-position on price or closing timeline. Please speak with your assigned advisor to progress negotiations.'}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <Tag className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-700">No Purchase Offers Submitted</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When you find an ideal prime residence, click "Make an Offer" on the listing page to lodge your proposal with our advisory desk.
                  </p>
                  <Link
                    to="/properties"
                    className="inline-block mt-2 px-4 py-2 bg-[#004274] text-white text-xs font-bold uppercase tracking-wider rounded-lg"
                  >
                    Browse Portfolios
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Acquisition Criteria & Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Personal Acquisition Parameters
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Our automated matching engine pairs these criteria with off-market instructions.
            </p>

            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Acquisition criteria updated successfully.</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Target Min Budget (€)
                  </label>
                  <input
                    type="number"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Target Max Budget (€)
                  </label>
                  <input
                    type="number"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder="e.g. 2500000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Preferred Minimum Bedrooms
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Any</option>
                  <option value="1">1+ Bedrooms</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                  <option value="5">5+ Bedrooms</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="py-2.5 px-6 bg-[#004274] hover:bg-[#00335a] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {updateProfile.isPending ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
