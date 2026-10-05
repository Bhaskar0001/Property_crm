import { useLocation, Link } from 'react-router-dom';
import { Shield, FileText, CheckCircle2 } from 'lucide-react';

export function LegalPage() {
  const location = useLocation();
  const path = location.pathname;

  let activeTab: 'privacy' | 'terms' | 'regulatory' = 'privacy';
  if (path.includes('terms')) activeTab = 'terms';
  else if (path.includes('regulatory')) activeTab = 'regulatory';

  return (
    <div className="bg-[#fcfdfd] min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 space-x-6 text-sm font-semibold">
          <Link
            to="/privacy"
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'privacy'
                ? 'border-[#004274] text-[#004274]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy Policy</span>
          </Link>
          <Link
            to="/terms"
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'terms'
                ? 'border-[#004274] text-[#004274]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Business</span>
          </Link>
          <Link
            to="/regulatory"
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'regulatory'
                ? 'border-[#004274] text-[#004274]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Regulatory Information</span>
          </Link>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 shadow-sm text-slate-700 leading-relaxed text-sm space-y-6">
          {activeTab === 'privacy' && (
            <>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#004274] mb-2">Privacy & Data Protection Policy</h1>
                <p className="text-xs text-slate-400">Last updated: October 2026 | In accordance with GDPR (EU Regulation 2016/679)</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">1. Data Controller Overview</h2>
                <p>
                  AbroadAccommodation Real Estate Advisory Group (&quot;AbroadAccommodation&quot;, &quot;we&quot;, &quot;our&quot;) is committed to protecting the privacy and confidentiality of personal data entrusted to us by clients, applicants, vendors, and website visitors.
                </p>

                <h2 className="text-base font-bold text-slate-900">2. Personal Information Collected</h2>
                <p>We collect and process the following categories of information when you interact with our services:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Identity Information:</strong> Name, title, date of birth, government-issued photo ID (for statutory AML compliance).</li>
                  <li><strong>Contact Details:</strong> Verified email address, telephone numbers, postal and residential addresses.</li>
                  <li><strong>Property Search & Transaction Preferences:</strong> Budget parameters, desired locations, viewing histories, offer submissions.</li>
                  <li><strong>Financial & Due Diligence:</strong> Proof of funds, source of wealth confirmation, mortgage approval in principle documents.</li>
                </ul>

                <h2 className="text-base font-bold text-slate-900">3. Legal Bases for Processing</h2>
                <p>We process your personal information strictly under the following lawful grounds:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Contractual Performance:</strong> To deliver property viewing, agency, leasing, and customer portal services.</li>
                  <li><strong>Legal & Regulatory Mandates:</strong> Criminal Justice (Money Laundering and Terrorist Financing) statutory record-keeping.</li>
                  <li><strong>Legitimate Interests:</strong> Improving platform responsiveness, cybersecurity, and preventing fraudulent enquiries.</li>
                </ul>

                <h2 className="text-base font-bold text-slate-900">4. Your Rights Under GDPR</h2>
                <p>You have the absolute right to request access to your personal data, request correction of inaccurate records, request erasure where statutory retention obligations have elapsed, and object to direct communications at any time by contacting <a href="mailto:privacy@AbroadAccommodation.com" className="text-[#004274] font-semibold underline">privacy@AbroadAccommodation.com</a>.</p>
              </div>
            </>
          )}

          {activeTab === 'terms' && (
            <>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#004274] mb-2">Terms of Business & Engagement</h1>
                <p className="text-xs text-slate-400">Effective Date: October 2026 | Governing Law: Republic of Ireland</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">1. Nature of Services</h2>
                <p>
                  AbroadAccommodation provides real estate marketing, client representation, property acquisitions, and asset management advisory. All particulars, brochures, floor plans, virtual tours, and dimensions published on this platform are produced for guidance only and do not constitute an offer, warranty, or contractual representation.
                </p>

                <h2 className="text-base font-bold text-slate-900">2. Accuracy of Particulars & Due Diligence</h2>
                <p>
                  While every reasonable effort is made to maintain accurate listings, intending purchasers and tenants must satisfy themselves by physical inspection, independent architectural survey, and formal legal due diligence through their appointed solicitor.
                </p>

                <h2 className="text-base font-bold text-slate-900">3. Anti-Money Laundering (AML) Requirements</h2>
                <p>
                  In compliance with statutory AML regulations, AbroadAccommodation requires verified photographic identification, verified proof of address dated within three months, and documented proof of funds prior to finalising any sales agreed or tenancy contracts.
                </p>

                <h2 className="text-base font-bold text-slate-900">4. Offer Submissions & Reservation Deposits</h2>
                <p>
                  Offers recorded through the AbroadAccommodation digital platform are submitted subject to contract, title verification, and vacant possession unless expressly stated otherwise in writing.
                </p>
              </div>
            </>
          )}

          {activeTab === 'regulatory' && (
            <>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#004274] mb-2">Professional Standards & Compliance</h1>
                <p className="text-xs text-slate-400">International Real Estate Operations & Standards</p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-[#004274] mb-1">Professional Property Services Provider</h3>
                  <p className="text-xs text-slate-700">
                    AbroadAccommodation operates according to international real estate best practices, anti-money laundering (AML) directives, and consumer protection regulations.
                  </p>
                </div>

                <h2 className="text-base font-bold text-slate-900">Core Advisory Operations</h2>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Acquisitions & Sales:</strong> Facilitation of private treaty residential and commercial real estate transactions</li>
                  <li><strong>Prime Lettings:</strong> Tenancy curation, student accommodations, and executive relocations</li>
                  <li><strong>Property Management:</strong> Asset maintenance coordination and tenant management services</li>
                  <li><strong>Investment Advisory:</strong> Cross-border portfolio allocation and yield advisory</li>
                </ul>

                <h2 className="text-base font-bold text-slate-900">Professional Indemnity & Client Protection</h2>
                <p>
                  AbroadAccommodation maintains professional standards and operational insurance in accordance with statutory requirements across regions of operation. All client reservation deposits and funds are handled through secure, audited financial accounts at regulated banking institutions.
                </p>

                <h2 className="text-base font-bold text-slate-900">Dispute Resolution & Client Care</h2>
                <p>
                  We operate a dedicated internal client care and dispute resolution procedure. Inquiries and feedback can be lodged directly with our senior management desk at legal@abroadaccommodation.com.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
