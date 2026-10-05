import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { LuxuryEmblem } from '../common/LuxuryEmblem';
import { useContactInfo } from '../../hooks/usePublicData';

export function Footer() {
  const { data: contact } = useContactInfo();
  return (
    <footer className="bg-[#0b192c] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="AbroadAccommodation"
                className="w-11 h-11 object-contain rounded-xl bg-white p-1 shadow-md"
              />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Abroad<span className="text-amber-400">Accommodation</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium -mt-0.5">
                  International Living & Real Estate
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Premier real estate advisory specializing in prime residential sales, luxury lettings,
              and institutional property investments across Ireland, the United Kingdom, and the UAE.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-[#6fabca]" />
              <span>Licensed Real Estate Practice • PSRA Licence No. 004128</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Properties
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/properties?listingType=sale" className="hover:text-white transition-colors">
                  Properties For Sale
                </Link>
              </li>
              <li>
                <Link to="/properties?listingType=rent" className="hover:text-white transition-colors">
                  Properties To Let
                </Link>
              </li>
              <li>
                <Link to="/properties?isFeatured=true" className="hover:text-white transition-colors">
                  Featured Portfolios
                </Link>
              </li>
              <li>
                <Link to="/properties?propertyType=new_homes" className="hover:text-white transition-colors">
                  New Developments
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-white transition-colors">
                  All Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/properties" className="hover:text-white transition-colors">
                  All Properties
                </Link>
              </li>
              <li>
                <Link to="/properties?isFeatured=true" className="hover:text-white transition-colors">
                  Featured Portfolios
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Advisory Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Private Advisory Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Headquarters
            </h4>
            <ul className="space-y-3 text-sm">
              {contact?.address && (
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-[#6fabca] shrink-0 mt-0.5" />
                  <span className="text-slate-400">{contact.address}</span>
                </li>
              )}
              {contact?.phone && (
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-[#6fabca] shrink-0" />
                  <a href={`tel:${contact.phone}`} className="text-slate-400 hover:text-white transition">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact?.email && (
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-[#6fabca] shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-slate-400 hover:text-white transition">
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {contact?.companyName || 'AbroadAccommodation'}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-slate-400">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-400">
              Terms of Business
            </Link>
            <Link to="/regulatory" className="hover:text-slate-400">
              Regulatory Information
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
