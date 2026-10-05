import { config } from '../config';
import { PropertyModel } from '../models/Property';
import { CurrencyModel } from '../models/Currency';
import { PropertyTypeModel } from '../models/PropertyType';
import { CountryModel } from '../models/Country';
import { SettingModel } from '../models/Setting';
import { logger } from '../utils/logger';

// Reference models to prevent tree-shaking
const _models = [CurrencyModel, PropertyTypeModel, CountryModel];

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface MatchedPropertyDTO {
  id: string;
  title: string;
  slug: string;
  price?: number;
  currencySymbol: string;
  city?: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  coverImage?: string;
  propertyType?: string;
}

export class ChatService {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = config.gemini.apiKey || '';
    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
  }

  private isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async getAdvisoryContactInfo() {
    try {
      const doc = await SettingModel.findOne({ key: 'agency_advisory_contact' }).lean();
      const val = doc?.value || {};
      const phone = val.phone || config.agency.phone;
      const whatsapp = val.whatsapp || config.agency.whatsapp;
      return {
        phone,
        whatsapp,
        whatsappClean: (whatsapp || '').replace(/[^0-9]/g, ''),
        email: val.email || config.agency.email,
        officeHours: val.officeHours || config.agency.officeHours,
        videoConsultationUrl: val.videoConsultationUrl || config.agency.videoConsultationUrl,
        companyName: val.companyName || config.agency.name,
        address: val.address || config.agency.address,
      };
    } catch {
      return {
        phone: config.agency.phone,
        whatsapp: config.agency.whatsapp,
        whatsappClean: (config.agency.whatsapp || '').replace(/[^0-9]/g, ''),
        email: config.agency.email,
        officeHours: config.agency.officeHours,
        videoConsultationUrl: config.agency.videoConsultationUrl,
        companyName: config.agency.name,
        address: config.agency.address,
      };
    }
  }

  async updateAdvisoryContactInfo(data: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    officeHours?: string;
    videoConsultationUrl?: string;
    companyName?: string;
    address?: string;
  }) {
    const existing = await SettingModel.findOne({ key: 'agency_advisory_contact' });
    const currentValue = existing?.value || {};
    const updatedValue = { ...currentValue, ...data };

    await SettingModel.findOneAndUpdate(
      { key: 'agency_advisory_contact' },
      {
        key: 'agency_advisory_contact',
        value: updatedValue,
        group: 'communication',
        description: 'Advisory desk contact numbers and consultation links',
      },
      { upsert: true, new: true }
    );

    return this.getAdvisoryContactInfo();
  }

  async processPublicChat(userMessage: string, history: ChatMessage[] = []): Promise<{
    reply: string;
    matchedProperties: MatchedPropertyDTO[];
  }> {
    const cleanMessage = (userMessage || '').trim();
    if (!cleanMessage) {
      return {
        reply: "Hello! Welcome to AbroadAccommodation. How may I assist your property search, viewing, or acquisition plans today?",
        matchedProperties: [],
      };
    }

    // 1. Fetch available published properties for grounding context
    const properties = await PropertyModel.find({
      isPublished: true,
      isVisibleInSearch: true,
      isDeleted: { $ne: true },
    })
      .populate('currency', 'code symbol')
      .populate('propertyType', 'name')
      .populate('country', 'name')
      .limit(30)
      .lean();

    // 2. Identify potential property matches based on query terms
    const matchedProperties = this.filterMatchingProperties(cleanMessage, properties);

    // 3. Check if Gemini AI is available
    if (this.isConfigured()) {
      try {
        const geminiReply = await this.callGemini(cleanMessage, history, properties);
        if (geminiReply) {
          return {
            reply: geminiReply,
            matchedProperties: matchedProperties.slice(0, 4),
          };
        }
      } catch (err) {
        logger.warn({ err }, 'Gemini chat generation failed, falling back to intelligent concierge response');
      }
    }

    // 4. Intelligent concierge fallback logic
    const fallbackReply = this.generateConciergeFallbackReply(cleanMessage, matchedProperties, properties);
    return {
      reply: fallbackReply,
      matchedProperties: matchedProperties.slice(0, 4),
    };
  }

  private filterMatchingProperties(message: string, properties: any[]): MatchedPropertyDTO[] {
    const lower = message.toLowerCase();
    const words = lower.split(/[\s,?.!]+/).filter(w => w.length > 2);

    // Extract price criteria if any
    let maxBudget: number | null = null;
    let minBudget: number | null = null;

    if (lower.includes('under 500k') || lower.includes('below 500k')) maxBudget = 500000;
    else if (lower.includes('under 750k') || lower.includes('below 750k')) maxBudget = 750000;
    else if (lower.includes('under 1m') || lower.includes('below 1m') || lower.includes('under 1 million') || lower.includes('1,000,000')) maxBudget = 1000000;
    else if (lower.includes('under 1.5m') || lower.includes('below 1.5m') || lower.includes('1,500,000')) maxBudget = 1500000;
    else if (lower.includes('under 2m') || lower.includes('below 2m') || lower.includes('under 2 million') || lower.includes('2,000,000')) maxBudget = 2000000;
    else if (lower.includes('under 3m') || lower.includes('below 3m') || lower.includes('under 3 million') || lower.includes('3,000,000')) maxBudget = 3000000;
    else if (lower.includes('under 5m') || lower.includes('below 5m') || lower.includes('under 5 million') || lower.includes('5,000,000')) maxBudget = 5000000;
    else if (lower.includes('under 7m') || lower.includes('below 7m') || lower.includes('under 7 million') || lower.includes('7,000,000')) maxBudget = 7000000;

    if (lower.includes('over 2m') || lower.includes('above 2m') || lower.includes('> 2m')) minBudget = 2000000;
    else if (lower.includes('over 1m') || lower.includes('above 1m') || lower.includes('> 1m')) minBudget = 1000000;

    const scored = properties.map((p) => {
      let score = 0;
      const title = (p.title || '').toLowerCase();
      const city = (p.city || '').toLowerCase();
      const area = (p.area || '').toLowerCase();
      const desc = (p.description || '').toLowerCase() + ' ' + (p.shortDescription || '').toLowerCase();
      const type = (p.propertyType?.name || '').toLowerCase();
      const country = (p.country?.name || '').toLowerCase();

      // Check location matches
      if ((lower.includes('dublin') || lower.includes('ireland')) && (city.includes('dublin') || country.includes('ireland'))) score += 6;
      if ((lower.includes('london') || lower.includes('uk') || lower.includes('united kingdom') || lower.includes('mayfair')) && (city.includes('london') || country.includes('kingdom') || country.includes('uk'))) score += 6;
      if ((lower.includes('dubai') || lower.includes('uae') || lower.includes('emirates') || lower.includes('jumeirah')) && (city.includes('dubai') || country.includes('emirates') || country.includes('uae'))) score += 6;
      if ((lower.includes('marbella') || lower.includes('spain') || lower.includes('costa del sol')) && (city.includes('marbella') || country.includes('spain'))) score += 6;
      if ((lower.includes('paris') || lower.includes('france') || lower.includes('marais')) && (city.includes('paris') || country.includes('france'))) score += 6;
      if ((lower.includes('amsterdam') || lower.includes('netherlands') || lower.includes('holland')) && (city.includes('amsterdam') || country.includes('netherlands'))) score += 6;
      if ((lower.includes('berlin') || lower.includes('germany') || lower.includes('mitte')) && (city.includes('berlin') || country.includes('germany'))) score += 6;
      if (lower.includes('rotterdam') && city.includes('rotterdam')) score += 6;
      if ((lower.includes('normandy') || lower.includes('caen')) && (city.includes('caen') || desc.includes('normandy'))) score += 6;

      // Check property types
      if ((lower.includes('villa') || lower.includes('villas')) && (type.includes('villa') || title.includes('villa'))) score += 5;
      if ((lower.includes('penthouse') || lower.includes('penthouses')) && (type.includes('penthouse') || title.includes('penthouse'))) score += 5;
      if ((lower.includes('apartment') || lower.includes('apartments') || lower.includes('flat') || lower.includes('studio') || lower.includes('loft')) && (type.includes('apartment') || title.includes('apartment') || title.includes('studio') || title.includes('loft'))) score += 4;
      if ((lower.includes('townhouse') || lower.includes('house') || lower.includes('residence') || lower.includes('cottage')) && (type.includes('house') || title.includes('townhouse') || title.includes('cottage'))) score += 4;

      // Check luxury / lifestyle terms
      if ((lower.includes('beach') || lower.includes('beachfront') || lower.includes('sea') || lower.includes('ocean')) && (desc.includes('beach') || desc.includes('sea') || title.includes('beach'))) score += 4;
      if ((lower.includes('waterfront') || lower.includes('canal') || lower.includes('river')) && (desc.includes('canal') || desc.includes('water') || desc.includes('amstel') || title.includes('canal'))) score += 4;
      if ((lower.includes('terrace') || lower.includes('rooftop')) && (desc.includes('terrace') || desc.includes('rooftop'))) score += 3;
      if (lower.includes('pool') && desc.includes('pool')) score += 3;

      // Check bedroom mentions
      if (lower.includes('1 bed') && p.bedrooms === 1) score += 4;
      if (lower.includes('2 bed') && p.bedrooms === 2) score += 4;
      if (lower.includes('3 bed') && p.bedrooms === 3) score += 4;
      if (lower.includes('4 bed') && p.bedrooms === 4) score += 4;
      if (lower.includes('5 bed') && p.bedrooms === 5) score += 4;

      // Check price budget constraint
      if (maxBudget && p.price) {
        if (p.price <= maxBudget) score += 4;
        else score -= 4;
      }
      if (minBudget && p.price) {
        if (p.price >= minBudget) score += 3;
        else score -= 3;
      }

      // Exact title match bonus
      for (const w of words) {
        if (w.length > 3 && title.includes(w)) score += 3;
        if (city.includes(w) || area.includes(w)) score += 2;
        if (desc.includes(w)) score += 1;
      }

      return { p, score };
    });

    const filtered = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.p);

    // If query was specific and found matches, return them; otherwise return signature luxury flagships
    const candidates = filtered.length > 0 ? filtered : properties.slice(0, 4);

    return candidates.map((p) => ({
      id: String(p._id),
      title: p.title,
      slug: p.slug,
      price: p.price,
      currencySymbol: p.currency?.symbol || '€',
      city: p.city || '',
      area: p.area || '',
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      coverImage: p.coverImage || '',
      propertyType: p.propertyType?.name || 'Exclusive Listing',
    }));
  }

  private async callGemini(message: string, history: ChatMessage[], properties: any[]): Promise<string> {
    const inventorySummary = properties.map((p, idx) => {
      const curr = p.currency?.symbol || '€';
      const priceStr = p.price ? `${curr}${Number(p.price).toLocaleString('en-US')}` : 'Price on Application';
      return `${idx + 1}. "${p.title}" | Price: ${priceStr} | City: ${p.city || ''} | Area: ${p.area || ''} | Country: ${p.country?.name || ''} | Beds: ${p.bedrooms || 'N/A'}, Baths: ${p.bathrooms || 'N/A'} | Type: ${p.propertyType?.name || 'Property'} | Slug: /properties/${p.slug} | Desc: ${p.shortDescription || ''}`;
    }).join('\n');

    const systemPrompt = `You are the Senior Property Advisor and Private Client Director for AbroadAccommodation, an ultra-luxury international real estate practice.
Your tone is sophisticated, welcoming, discreet, authoritative, and grounded in concrete property facts.
You have direct, real-time access to our verified published portfolio:

VERIFIED ACTIVE INVENTORY:
${inventorySummary}

STRICT ADVISORY RULES:
1. Ground every answer strictly in the inventory provided above. Never invent, hallucinate, or approximate fake properties or nonexistent prices.
2. When answering inquiries about locations, budgets, penthouses, villas, or apartments, quote real property titles, verified prices (including currency symbol), and locations from the active inventory.
3. For viewings, walkthroughs, or scheduling, explain our private on-site inspection services, WhatsApp live video tours, and direct callback desk.
4. STRICT PERSONA: NEVER describe yourself as an "AI", "language model", "algorithm", or "bot". Speak with the voice of a seasoned luxury property director. If asked if you are AI, answer: "I am your AbroadAccommodation private client advisor, dedicated to managing your acquisitions across our global portfolio."
5. Format your answers clearly with concise bullet points and bold highlights for property names and prices.`;

    const contents: any[] = [];

    // Add recent history (up to last 6 turns)
    const recentHistory = history.slice(-6);
    for (const h of recentHistory) {
      contents.push({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }],
      });
    }

    // Add current user prompt with system context
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nClient Inquiry: ${message}` }],
    });

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      logger.warn({ err }, 'Gemini API call returned non-200');
      return '';
    }

    const json: any = await response.json();
    return json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private generateConciergeFallbackReply(
    message: string,
    matches: MatchedPropertyDTO[],
    allProperties: any[]
  ): string {
    const lower = message.toLowerCase();

    // Helper: format property bullet
    const fmt = (p: any) => {
      const symbol = p.currencySymbol || p.currency?.symbol || '€';
      const priceStr = p.price ? `${symbol}${Number(p.price).toLocaleString('en-US')}` : 'Price on Application';
      const bedStr = p.bedrooms ? ` • ${p.bedrooms} Beds` : '';
      const bathStr = p.bathrooms ? ` • ${p.bathrooms} Baths` : '';
      const location = [p.area, p.city].filter(Boolean).join(', ') || p.city || 'Prime Location';
      return `• **${p.title}** (${location})\n  **${priceStr}**${bedStr}${bathStr}`;
    };

    // 1. Viewing / Consultation / Video tour intent
    if (
      lower.includes('viewing') ||
      lower.includes('book') ||
      lower.includes('visit') ||
      lower.includes('tour') ||
      lower.includes('video call') ||
      lower.includes('walkthrough') ||
      lower.includes('appointment')
    ) {
      const propTitles = matches.slice(0, 2).map(m => m.title);
      const targetText = propTitles.length > 0 ? ` for **${propTitles.join('** or **')}**` : '';

      return `We would be delighted to coordinate a private viewing${targetText} for you.

Here are the immediate ways we can arrange this:
1. **Direct Call / Tour Desk**: Click the **Call / Tour** button on the bottom bar to speak with a property director or request an immediate callback.
2. **On-Site Live Video Walkthrough**: Connect via WhatsApp (${config.agency.whatsapp || config.agency.phone}) for a scheduled high-definition video tour conducted directly by our agent on-site.
3. **In-Person Inspection**: Select any property card below to submit your preferred date, and our private office will confirm access credentials within 2 hours.`;
    }

    // 2. Valuation or Selling intent
    if (
      lower.includes('sell') ||
      lower.includes('valuation') ||
      lower.includes('appraisal') ||
      lower.includes('market value') ||
      lower.includes('worth')
    ) {
      return `AbroadAccommodation Private Advisory provides confidential, market-grounded property valuations across residential and commercial prime assets.

Our valuation directors conduct comprehensive comparative market analyses evaluating recent registered prime transactions, current yield rates, and international buyer interest.

• **Complimentary Valuation**: You can submit your property details via our **Free Property Valuation** portal.
• **Private Consultation**: You may also reach our senior valuation director directly via WhatsApp or phone (${config.agency.phone}) for an off-market consultation.`;
    }

    // Zero properties state
    if (allProperties.length === 0) {
      return `Welcome to AbroadAccommodation. I am your private client concierge and advisor.

Our portfolio is currently being updated with new prime acquisitions. You can submit your acquisition requirements or schedule a confidential advisory call with our team.

How may I assist you with your property search or valuation today?`;
    }

    // 3. Penthouses & Luxury Villas
    if (lower.includes('penthouse') || lower.includes('villa') || lower.includes('prime residences')) {
      const penthousesAndVillas = allProperties.filter(p => {
        const typeName = (p.propertyType?.name || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        return typeName.includes('penthouse') || typeName.includes('villa') || title.includes('penthouse') || title.includes('villa');
      });

      const list = (penthousesAndVillas.length > 0 ? penthousesAndVillas : matches).slice(0, 4);

      if (list.length > 0) {
        return `AbroadAccommodation represents signature residences and villas across our active portfolio:

${list.map(fmt).join('\n\n')}

Click any listing to review specifications, floor plans, or to request a private inspection.`;
      }
    }

    // 4. Specific location search
    if (matches.length > 0) {
      return `Based on your inquiry, here are verified listings from our active portfolio:

${matches.slice(0, 4).map(fmt).join('\n\n')}

You can select any listing to view detailed floor plans, photo galleries, or coordinate a viewing appointment.`;
    }

    // 5. Default response with top current listings
    const flagships = allProperties.slice(0, 4);
    return `Welcome to AbroadAccommodation. I am your personal real estate concierge and advisor.

Here is a selection of current opportunities from our portfolio:

${flagships.map(fmt).join('\n\n')}

How may I assist you today? You can select any topic above, inquire about specific locations or budgets, or connect with our advisory desk.`;
  }
}

export const chatService = new ChatService();
