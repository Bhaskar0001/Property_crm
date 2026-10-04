import { config } from '../config';
import { PropertyModel } from '../models/Property';
import { LeadModel } from '../models/Lead';
import { OfferModel } from '../models/Offer';
import { ViewingModel } from '../models/Viewing';
import { logger } from '../utils/logger';

export class AIService {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = config.gemini.apiKey;
    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
  }

  private isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private async callGemini(systemPrompt: string, userPrompt: string, temperature = 0.4): Promise<string> {
    if (!this.isConfigured()) {
      return '';
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ errorText }, 'Gemini API call returned non-200');
        return '';
      }

      const json: any = await response.json();
      return json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (err) {
      logger.error({ err }, 'Error querying Gemini API');
      return '';
    }
  }

  // 1. Generate Editorial Property Descriptions
  async generatePropertyDescription(data: {
    title: string;
    city: string;
    area?: string;
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    livingArea?: number;
    features?: string[];
    propertyType?: string;
    berRating?: string;
  }): Promise<{ shortDescription: string; description: string; keyHighlights: string[] }> {
    const symbol = '€';
    const featuresList = (data.features || []).join(', ') || 'High-specification finishes, double glazing';

    if (this.isConfigured()) {
      const systemPrompt = `You are a senior real estate copywriter for high-end properties in Dublin, London, and international prime markets.
Write elegant, captivating, and accurate property descriptions without cheesy clichés, exclamation marks, or robotic adjectives.
Respond STRICTLY with valid JSON in this exact structure:
{
  "shortDescription": "string (1-2 sentences)",
  "description": "string (2-3 paragraphs with tasteful architectural commentary)",
  "keyHighlights": ["string", "string", "string", "string"]
}`;

      const userPrompt = `Property Details:
Title: ${data.title}
Location: ${data.area ? `${data.area}, ` : ''}${data.city}
Asking Price: ${data.price ? `${symbol}${data.price.toLocaleString()}` : 'Price on Application'}
Bedrooms: ${data.bedrooms || 'Generous configuration'}
Bathrooms: ${data.bathrooms || 'En-suite & family'}
Living Area: ${data.livingArea ? `${data.livingArea} sq m` : 'Spacious footprint'}
Type: ${data.propertyType || 'Residential'}
BER Rating: ${data.berRating || 'Not specified'}
Features: ${featuresList}`;

      const result = await this.callGemini(systemPrompt, userPrompt, 0.7);
      try {
        const cleanJson = result.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.description) return parsed;
      } catch {
        // Fallback to template if JSON parsing failed
      }
    }

    // High quality deterministic fallback
    const shortDescription = `Exquisitely presented ${data.bedrooms || 3}-bedroom ${data.propertyType?.toLowerCase() || 'residence'} situated in the sought-after enclave of ${data.area || data.city}.`;
    const description = `EstateElite is delighted to present this impressive ${data.bedrooms || 3}-bedroom ${data.propertyType?.toLowerCase() || 'home'} located in the prime district of ${data.city}.\n\nLight-filled interiors spanning ${data.livingArea ? `${data.livingArea} sq m` : 'generous proportions'} seamlessly connect refined living zones with modern convenience. The master suite features expansive storage, while additional bedrooms provide peaceful versatility for family living or a dedicated home workspace.\n\nPositioned within moments of premium lifestyle amenities, esteemed schools, and rapid transport links, this residence offers an exceptional opportunity for discerning purchasers seeking lasting value.`;
    const keyHighlights = [
      `Prime address in ${data.area || data.city}`,
      `${data.bedrooms || 3} Generous Bedrooms & ${data.bathrooms || 2} Bathrooms`,
      data.berRating ? `Energy Efficient: Rated ${data.berRating}` : 'Impeccable structural condition',
      'Private viewing strictly by appointment',
    ];

    return { shortDescription, description, keyHighlights };
  }

  // 2. Extract Lead Acquisition Requirements from Notes / Inquiry text
  async extractRequirements(text: string): Promise<{
    minBudget?: number;
    maxBudget?: number;
    bedrooms?: number;
    preferredLocations: string[];
    propertyType?: string;
    timeline?: string;
    summary: string;
  }> {
    if (this.isConfigured()) {
      const systemPrompt = `You are a real estate CRM assistant. Extract customer requirements from text.
Output STRICTLY a JSON object with:
{
  "minBudget": number or null,
  "maxBudget": number or null,
  "bedrooms": number or null,
  "preferredLocations": ["city or area names"],
  "propertyType": "string or null",
  "timeline": "immediate" | "1-3 months" | "3-6 months" | "flexible",
  "summary": "1 sentence recap"
}`;
      const res = await this.callGemini(systemPrompt, `Analyze this message:\n"${text}"`, 0.2);
      try {
        const clean = res.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        return {
          minBudget: parsed.minBudget || undefined,
          maxBudget: parsed.maxBudget || undefined,
          bedrooms: parsed.bedrooms || undefined,
          preferredLocations: parsed.preferredLocations || [],
          propertyType: parsed.propertyType || undefined,
          timeline: parsed.timeline || 'flexible',
          summary: parsed.summary || 'Lead requirements extracted.',
        };
      } catch {
        // Fallback
      }
    }

    // Deterministic extraction
    const budgetMatch = text.match(/(?:budget|up to|around|max)?\s*(?:€|\$|£)?\s*(\d{2,3}(?:,\d{3})+|\d{5,7})\s*(?:k|thousand)?/i);
    const bedMatch = text.match(/(\d+)\s*(?:bed|bedroom)/i);
    const locs: string[] = [];
    if (/dublin/i.test(text)) locs.push('Dublin');
    if (/london/i.test(text)) locs.push('London');
    if (/cork/i.test(text)) locs.push('Cork');
    if (/galway/i.test(text)) locs.push('Galway');

    let maxBudget: number | undefined;
    if (budgetMatch) {
      let raw = budgetMatch[1].replace(/,/g, '');
      maxBudget = Number(raw);
      if (maxBudget < 2000) maxBudget *= 1000;
    }

    return {
      maxBudget,
      bedrooms: bedMatch ? Number(bedMatch[1]) : undefined,
      preferredLocations: locs.length > 0 ? locs : ['Dublin'],
      timeline: /asap|immediately|urgent/i.test(text) ? 'immediate' : '1-3 months',
      summary: `Client seeking ${bedMatch ? `${bedMatch[1]}-bed ` : ''}property${maxBudget ? ` with budget up to €${maxBudget.toLocaleString()}` : ''}.`,
    };
  }

  // 3. Summarize WhatsApp Conversation
  async summarizeConversation(messages: { direction: string; content: string; createdAt?: string }[]): Promise<{
    summary: string;
    keyPoints: string[];
    actionItems: string[];
    sentiment: 'positive' | 'neutral' | 'skeptical';
  }> {
    const convoText = messages
      .slice(-15)
      .map((m) => `${m.direction.toUpperCase()}: ${m.content}`)
      .join('\n');

    if (this.isConfigured() && convoText) {
      const systemPrompt = `You are an AI CRM assistant. Summarize this real estate agent-client conversation.
Output STRICTLY valid JSON:
{
  "summary": "Concise 2-sentence overview",
  "keyPoints": ["bullet point 1", "bullet point 2"],
  "actionItems": ["action item 1", "action item 2"],
  "sentiment": "positive" | "neutral" | "skeptical"
}`;
      const res = await this.callGemini(systemPrompt, convoText, 0.3);
      try {
        const clean = res.replace(/```json|```/g, '').trim();
        return JSON.parse(clean);
      } catch {
        // Fallback
      }
    }

    return {
      summary: `Recent conversation covering property details, pricing queries, and viewing coordination across ${messages.length} messages.`,
      keyPoints: [
        'Client engaged regarding listing availability',
        'Discussion regarding pricing and location features',
      ],
      actionItems: ['Follow up with viewing schedule options', 'Share property specification brochure'],
      sentiment: 'positive',
    };
  }

  // 4. Natural Language Property Search
  async naturalLanguageSearch(query: string): Promise<{
    interpretedFilters: any;
    explanation: string;
    results: any[];
  }> {
    const filters: any = { isDeleted: false, isPublished: true };
    const cleanLower = query.toLowerCase();

    // Bed count extraction
    const bedMatch = cleanLower.match(/(\d+)\s*(?:bed|bedroom)/i);
    if (bedMatch) {
      filters.bedrooms = { $gte: Number(bedMatch[1]) };
    }

    // Budget extraction (e.g. under 800k, below 1m)
    const underPrice = cleanLower.match(/(?:under|below|less than|max)\s*(?:€|\$|£)?\s*(\d+(?:\.\d+)?)\s*(k|m|million)?/i);
    if (underPrice) {
      let val = parseFloat(underPrice[1]);
      const unit = underPrice[2]?.toLowerCase();
      if (unit === 'm' || unit === 'million') val *= 1000000;
      else if (unit === 'k' || val < 1000) val *= 1000;
      filters.price = { $lte: val };
    }

    // Location extraction
    if (cleanLower.includes('dublin')) {
      filters.city = new RegExp('dublin', 'i');
    } else if (cleanLower.includes('cork')) {
      filters.city = new RegExp('cork', 'i');
    } else if (cleanLower.includes('galway')) {
      filters.city = new RegExp('galway', 'i');
    }

    const properties = await PropertyModel.find(filters)
      .populate('currency', 'symbol code')
      .populate('propertyType', 'name')
      .limit(8)
      .lean();

    const cityName = filters.city ? (filters.city instanceof RegExp ? filters.city.source : String(filters.city)) : '';
    const explanation = `Matched ${properties.length} active listings based on your criteria${filters.bedrooms ? ` (${filters.bedrooms.$gte}+ bedrooms)` : ''}${filters.price ? ` under €${filters.price.$lte.toLocaleString()}` : ''}${cityName ? ` in ${cityName}` : ''}.`;

    return {
      interpretedFilters: filters,
      explanation,
      results: properties,
    };
  }

  // 5. Dashboard AI Q&A
  async dashboardQuery(question: string): Promise<{ answer: string; metrics: any }> {
    const [totalProperties, totalLeads, activeViewings, offers] = await Promise.all([
      PropertyModel.countDocuments({ isDeleted: false }),
      LeadModel.countDocuments({ isDeleted: false }),
      ViewingModel.countDocuments({ status: { $in: ['CONFIRMED', 'confirmed'] } }),
      OfferModel.find({ status: { $in: ['ACCEPTED', 'accepted'] } }, 'amount').lean(),
    ]);

    const totalDealVolume = offers.reduce((sum, o) => sum + (o.amount || 0), 0);
    const metrics = {
      totalProperties,
      totalLeads,
      activeViewings,
      totalAgreedVolume: totalDealVolume,
      closedDeals: offers.length,
    };

    if (this.isConfigured()) {
      const prompt = `System Data Context:
Total Properties in Portfolio: ${totalProperties}
Total Active CRM Leads: ${totalLeads}
Confirmed Upcoming Viewings: ${activeViewings}
Total Sales Agreed Volume: €${totalDealVolume.toLocaleString()} (${offers.length} closed deals)

User Question: "${question}"
Provide a direct, factual answer based strictly on the metrics above in 2-3 sentences.`;

      const aiAnswer = await this.callGemini('You are EstateElite Advisory Copilot.', prompt, 0.2);
      if (aiAnswer) {
        return { answer: aiAnswer.trim(), metrics };
      }
    }

    return {
      answer: `Currently the portfolio holds ${totalProperties} properties with ${totalLeads} active leads. There are ${activeViewings} confirmed viewings scheduled, with total agreed sales volume standing at €${totalDealVolume.toLocaleString()} across ${offers.length} accepted offers.`,
      metrics,
    };
  }
}

export const aiService = new AIService();
