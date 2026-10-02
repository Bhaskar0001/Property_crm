import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0b192c] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#004274] flex items-center justify-center text-white">
                <Building2 className="w-6 h-6 text-[#6fabca]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white uppercase">
                Property<span className="text-[#6fabca]">OS</span>
              </span>
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

          {/* Territories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Territories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/properties?city=Dublin" className="hover:text-white transition-colors">
                  Dublin City & County
                </Link>
              </li>
              <li>
                <Link to="/properties?city=London" className="hover:text-white transition-colors">
                  Greater London
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Dubai" className="hover:text-white transition-colors">
                  Dubai & Palm Jumeirah
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Cork" className="hover:text-white transition-colors">
                  Cork & Munster
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  International Desk
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
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#6fabca] shrink-0 mt-0.5" />
                <span className="text-slate-400">
                  24-26 Fitzwilliam Place, Dublin 2, D02 T928, Ireland
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#6fabca] shrink-0" />
                <span className="text-slate-400">+353 1 234 5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#6fabca] shrink-0" />
                <span className="text-slate-400">info@propertyos.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PropertyOS Group. All rights reserved.</p>
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
