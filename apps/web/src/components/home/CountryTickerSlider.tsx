import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicCountries } from '../../hooks/usePublicData';
import { WORLD_COUNTRIES } from '@repo/shared';
import { ArrowUpRight } from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

interface CountryTickerSliderProps {
  className?: string;
  onSelectCountry?: (isoCode: string) => void;
}

export const CountryTickerSlider: React.FC<CountryTickerSliderProps> = ({ className = '', onSelectCountry }) => {
  const navigate = useNavigate();
  const { data: dbCountries = [] } = usePublicCountries();

  // Real database countries only - no mock or hardcoded country fallback
  const displayCountries = React.useMemo(() => {
    if (!dbCountries || dbCountries.length === 0) {
      return [];
    }

    return dbCountries.map((c) => {
      const matched = WORLD_COUNTRIES.find(
        (wc) => wc.isoCode.toUpperCase() === (c.isoCode || '').toUpperCase() || wc.name.toLowerCase() === c.name.toLowerCase()
      );
      return {
        id: c._id,
        name: c.name,
        isoCode: c.isoCode || matched?.isoCode || 'GL',
        flag: c.flag || matched?.flag || '🌐',
        flagUrl: c.flagUrl || matched?.flagUrl,
        propertyCount: c.propertyCount || 0,
      };
    });
  }, [dbCountries]);

  if (displayCountries.length === 0) {
    return null;
  }

  // Duplicate seamlessly for infinite marquee loop
  const repeatCount = Math.max(3, Math.ceil(12 / displayCountries.length));
  const marqueeList = Array.from({ length: repeatCount }, () => displayCountries).flat();

  const handleCountryClick = (isoCode: string) => {
    if (onSelectCountry) {
      onSelectCountry(isoCode);
    } else {
      navigate(`/properties?country=${isoCode.toLowerCase()}`);
    }
  };

  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-r from-slate-900 via-[#002544] to-slate-900 border-y border-white/10 py-2.5 ${className}`}>
      {/* Side Vignettes for smooth fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

      {/* Fast Infinite Moving Ribbon */}
      <div className="flex w-max animate-fast-marquee hover:[animation-play-state:paused] py-1 cursor-pointer">
        {marqueeList.map((item, idx) => (
          <button
            key={`${item.isoCode}-${idx}`}
            type="button"
            onClick={() => handleCountryClick(item.isoCode)}
            className="group inline-flex items-center gap-2.5 mx-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 hover:border-[#6fabca] transition-all transform hover:-translate-y-0.5 shadow-sm text-left"
          >
            <CountryFlag code={item.isoCode} name={item.name} flagUrl={item.flagUrl} size="sm" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white group-hover:text-[#6fabca] transition-colors leading-tight">
                {item.name}
              </span>
              <span className="text-[9px] text-slate-300 font-medium leading-tight">
                {item.propertyCount > 0 ? `${item.propertyCount} Active Properties` : 'Prime Portfolio'}
              </span>
            </div>
            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        ))}
      </div>

      {/* Inline styles for fast smooth continuous marquee */}
      <style>{`
        @keyframes fastMarquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-fast-marquee {
          animation: fastMarquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
};
