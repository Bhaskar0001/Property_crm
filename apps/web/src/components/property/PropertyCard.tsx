import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize2, MapPin, MessageSquare, Zap, Heart } from 'lucide-react';
import { PublicProperty } from '../../types';
import { useFavorites, useToggleFavorite } from '../../hooks/useCustomerData';
import { useCurrency } from '../../context/CurrencyContext';

interface PropertyCardProps {
  property: PublicProperty;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { formatPrice } = useCurrency();
  const { data: favorites = [] } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const isFavorited = favorites.some((fav) => fav._id === property._id);

  const fallbackImage =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

  const coverUrl = property.coverImage || fallbackImage;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate({
      propertyId: property._id,
      isCurrentlyFavorited: isFavorited,
    });
  };

  // Format WhatsApp link
  const propertyUrl = `${window.location.origin}/properties/${property.slug}`;
  const whatsappText = encodeURIComponent(
    `Hello, I would like to enquire about this property: ${property.title} (Ref: ${
      property.internalReference || property.slug
    })\n${propertyUrl}`
  );
  const whatsappHref = `https://wa.me/?text=${whatsappText}`;

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={coverUrl}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Left Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {property.isFeatured && (
            <span className="bg-[#004274] text-white text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded shadow-sm">
              Featured
            </span>
          )}
          {property.listingType && (
            <span className="bg-white/95 backdrop-blur-sm text-slate-800 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded shadow-sm">
              {property.listingType.name}
            </span>
          )}
        </div>

        {/* Top Right: BER / Status / Favorite */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
          {property.berRating && (
            <span className="inline-flex items-center space-x-1 bg-emerald-700 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
              <Zap className="w-3 h-3 fill-current" />
              <span>BER {property.berRating}</span>
            </span>
          )}
          {property.status && property.status.code !== 'ACTIVE' && (
            <span
              className="text-white text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded shadow-sm"
              style={{ backgroundColor: property.status.color || '#e11d48' }}
            >
              {property.status.name}
            </span>
          )}

          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-full backdrop-blur-md shadow-md transition-all ${
              isFavorited
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
            }`}
            title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Price Tag overlay */}
        <div className="absolute bottom-3 left-3 bg-[#002544]/90 backdrop-blur-sm px-3 py-1.5 rounded text-white shadow-md">
          <span className="text-base font-bold tracking-tight">
            {formatPrice(property.price)}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center text-xs font-medium text-slate-500 mb-1.5">
            <MapPin className="w-3.5 h-3.5 mr-1 text-[#6fabca] shrink-0" />
            <span className="truncate">
              {[property.area, property.city, property.country?.name]
                .filter(Boolean)
                .join(', ') || 'Prime Location'}
            </span>
          </div>

          {/* Title */}
          <Link to={`/properties/${property.slug}`}>
            <h3 className="text-base font-bold text-[#004274] hover:text-[#002544] line-clamp-2 leading-snug transition-colors">
              {property.title}
            </h3>
          </Link>
        </div>

        {/* Specifications & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          {/* Specs */}
          <div className="flex items-center justify-between text-xs text-slate-600 mb-4 font-medium">
            <div className="flex items-center space-x-1.5">
              <Bed className="w-4 h-4 text-slate-400" />
              <span>{property.bedrooms ? `${property.bedrooms} Beds` : '—'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Bath className="w-4 h-4 text-slate-400" />
              <span>{property.bathrooms ? `${property.bathrooms} Baths` : '—'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Maximize2 className="w-4 h-4 text-slate-400" />
              <span>{property.livingArea ? `${property.livingArea} m²` : '—'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Link
              to={`/properties/${property.slug}`}
              className="flex-1 text-center py-2 px-3 bg-[#004274] hover:bg-[#00335a] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors"
            >
              View Property
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
              title="Chat on WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
