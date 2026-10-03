import { Link } from 'react-router-dom';
import { Building2, Key, TrendingUp, ShieldCheck, Briefcase, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export function ServicesPage() {
  const services = [
    {
      icon: <Building2 className="w-8 h-8 text-[#004274]" />,
      title: 'Prime Property Acquisition',
      description: 'Exclusive off-market and prime residential acquisitions tailored for private clients, family offices, and institutional investors across Dublin, London, and international markets.',
      features: [
        'Confidential off-market sourcing',
        'Comprehensive technical & legal due diligence',
        'Price negotiation & transaction structuring',
        'Turnkey handover & interior advisory',
      ],
    },
    {
      icon: <Key className="w-8 h-8 text-[#004274]" />,
      title: 'Premium Lettings & Tenancy Management',
      description: 'End-to-end luxury asset management protecting rental yields while delivering white-glove tenant placement and round-the-clock maintenance coordination.',
      features: [
        'Rigorous corporate & diplomat tenant vetting',
        'Automated rent collection & accounting',
        'Dedicated 24/7 emergency maintenance concierge',
        'Regulatory RTB compliance & deposit escrow',
      ],
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-[#004274]" />,
      title: 'New Developments & Master Planning',
      description: 'Consultancy and mandate representation for residential development schemes, from site acquisition through architectural appraisal to multi-unit global sales campaigns.',
      features: [
        'Gross development value (GDV) optimization',
        'Demographic targeting & marketing campaigns',
        'International roadshows & diaspora investor network',
        'Phased off-plan sales orchestration',
      ],
    },
    {
      icon: <Briefcase className="w-8 h-8 text-[#004274]" />,
      title: 'Commercial & Mixed-Use Advisory',
      description: 'Strategic asset repositioning, leasehold negotiations, and portfolio disposal advisory for boutique offices, retail flagships, and prime hospitality assets.',
      features: [
        'Lease renewals & rent review negotiations',
        'Yield analysis & capital market positioning',
        'Tenant mix strategy & covenant analysis',
        'Discreet portfolio acquisitions',
      ],
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#004274]" />,
      title: 'Valuation & Advisory Services',
      description: 'Red Book compliant market appraisals, probate valuations, capital gains tax advisory, and expert witness documentation for legal entities and financial institutions.',
      features: [
        'RICS & PSRA certified valuation reports',
        'Secured lending appraisals for Tier-1 banks',
        'Portfolio annual market value indexation',
        'Tax efficiency & succession structuring guidance',
      ],
    },
    {
      icon: <Award className="w-8 h-8 text-[#004274]" />,
      title: 'Corporate Relocation Concierge',
      description: 'Dedicated relocation service for multinational executives, diplomatic delegations, and tech leadership establishing residency.',
      features: [
        'Custom neighborhood & school catchment matching',
        'Accompanied VIP preview itineraries',
        'Utilities, telecom, and luxury concierge setup',
        'Short-to-long term lease transition support',
      ],
    },
  ];

  return (
    <div className="bg-[#fcfdfd] min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#002544] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-white/10 text-[#6fabca] text-xs font-bold tracking-widest uppercase rounded-full mb-4">
            Professional Real Estate Services
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Institutional Standards. Personal Discretion.
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            PropertyOS delivers full-spectrum real estate brokerage, asset management, and development advisory with complete transparency and regulatory integrity.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center mb-6">
                  {svc.icon}
                </div>
                <h3 className="text-xl font-bold text-[#004274] mb-3">{svc.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {svc.description}
                </p>
                <div className="space-y-2 mb-8 border-t border-slate-100 pt-6">
                  {svc.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center text-xs font-bold text-[#004274] hover:text-[#6fabca] transition-colors"
              >
                <span>Instruct our advisory team</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-100/80 border-t border-slate-200 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#004274] mb-4">
            Have a Specific Asset or Portfolio in Mind?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto mb-8">
            Speak directly with a senior partner for a strictly confidential consultation on your property requirements.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-3 bg-[#004274] text-white text-sm font-bold rounded-lg hover:bg-[#002f53] shadow transition-colors"
            >
              Request Confidential Consultation
            </Link>
            <Link
              to="/properties"
              className="w-full sm:w-auto px-8 py-3 bg-white text-slate-800 text-sm font-bold rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Browse Property Portfolio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
