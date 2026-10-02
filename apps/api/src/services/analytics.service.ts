import { PropertyModel } from '../models/Property';
import { LeadModel } from '../models/Lead';
import { CustomerModel } from '../models/Customer';
import { OfferModel } from '../models/Offer';
import { ViewingModel } from '../models/Viewing';
import { TaskModel } from '../models/Task';
import { ConversationModel } from '../models/Conversation';
import { LeadActivityModel } from '../models/LeadActivity';
import { UserModel } from '../models/User';
import { LeadStageModel } from '../models/LeadStage';
import { LeadSourceModel } from '../models/LeadSource';
import { PropertyTypeModel } from '../models/PropertyType';
import { CountryModel } from '../models/Country';
import { auditService } from './audit.service';
import { ValidationError } from '../utils/errors';

export class AnalyticsService {
  private getDateFilter(range?: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'quarter':
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'year':
      case '365d':
        startDate.setDate(startDate.getDate() - 365);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    return { startDate, endDate };
  }

  // 1. Executive Dashboard Aggregation
  async getDashboard(range?: string, _user?: any): Promise<any> {
    const { startDate } = this.getDateFilter(range);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalProperties,
      publishedProperties,
      totalLeads,
      newLeadsInPeriod,
      totalCustomers,
      offers,
      todayViewingsCount,
      overdueTasksCount,
      unreadWhatsAppCount,
      leadStages,
      leadSources,
      recentActivities,
    ] = await Promise.all([
      PropertyModel.countDocuments({ isDeleted: false }),
      PropertyModel.countDocuments({ isDeleted: false, isPublished: true }),
      LeadModel.countDocuments({ isDeleted: false }),
      LeadModel.countDocuments({ isDeleted: false, createdAt: { $gte: startDate } }),
      CustomerModel.countDocuments({ isDeleted: false }),
      OfferModel.find({}, 'status amount dealStage createdAt').lean(),
      ViewingModel.countDocuments({
        scheduledDate: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['CONFIRMED', 'confirmed', 'REQUESTED', 'scheduled'] },
      }),
      TaskModel.countDocuments({
        status: 'PENDING',
        dueDate: { $lt: new Date() },
      }),
      ConversationModel.aggregate([
        { $group: { _id: null, totalUnread: { $sum: '$unreadCount' } } },
      ]),
      LeadStageModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
      LeadSourceModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
      LeadActivityModel.find()
        .populate({
          path: 'lead',
          populate: { path: 'customer', select: 'name email phone' },
        })
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    // Financial & Offer computations
    let totalDealVolume = 0;
    let acceptedDealsCount = 0;
    let pendingOffersCount = 0;

    for (const off of offers) {
      const st = (off.status || '').toUpperCase();
      if (st === 'ACCEPTED') {
        totalDealVolume += off.amount || 0;
        acceptedDealsCount++;
      } else if (st === 'SUBMITTED' || st === 'PENDING' || st === 'UNDER_REVIEW') {
        pendingOffersCount++;
      }
    }

    // Lead Stage distribution
    const stageCounts = await LeadModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]);

    const stageMap: Record<string, number> = {};
    for (const sc of stageCounts) {
      if (sc._id) stageMap[sc._id.toString()] = sc.count;
    }

    const leadStagesWithCounts = leadStages.map((st) => ({
      _id: st._id,
      name: st.name,
      code: st.code,
      color: st.color || '#3b82f6',
      count: stageMap[st._id.toString()] || 0,
    }));

    // Lead Source distribution
    const sourceCounts = await LeadModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    const sourceMap: Record<string, number> = {};
    for (const sc of sourceCounts) {
      if (sc._id) sourceMap[sc._id.toString()] = sc.count;
    }

    const leadSourcesWithCounts = leadSources.map((src) => ({
      _id: src._id,
      name: src.name,
      slug: src.slug,
      count: sourceMap[src._id.toString()] || 0,
    }));

    // Monthly Trends for past 6 months
    const monthlyTrend: { month: string; leads: number; deals: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthLabel = mDate.toLocaleString('default', { month: 'short' });

      const [leadsCount, dealsCount] = await Promise.all([
        LeadModel.countDocuments({
          isDeleted: false,
          createdAt: { $gte: mDate, $lt: nextMDate },
        }),
        OfferModel.countDocuments({
          status: { $in: ['ACCEPTED', 'accepted'] },
          createdAt: { $gte: mDate, $lt: nextMDate },
        }),
      ]);

      monthlyTrend.push({
        month: monthLabel,
        leads: leadsCount,
        deals: dealsCount,
      });
    }

    const totalUnreadWhatsApp = unreadWhatsAppCount[0]?.totalUnread || 0;

    return {
      overview: {
        totalProperties,
        publishedProperties,
        totalLeads,
        newLeadsInPeriod,
        totalCustomers,
        totalOffers: offers.length,
        pendingOffers: pendingOffersCount,
        acceptedDeals: acceptedDealsCount,
        totalDealVolume,
      },
      operations: {
        todayViewings: todayViewingsCount,
        overdueTasks: overdueTasksCount,
        unreadWhatsApp: totalUnreadWhatsApp,
      },
      leadStages: leadStagesWithCounts,
      leadSources: leadSourcesWithCounts,
      monthlyTrend,
      recentActivities,
    };
  }

  // 2. Property Analytics
  async getProperties(range?: string, _user?: any): Promise<any> {
    const { startDate } = this.getDateFilter(range);

    const [
      byStatus,
      byCountry,
      byType,
      topViewed,
      topEnquired,
      priceDistribution,
    ] = await Promise.all([
      PropertyModel.aggregate([
        { $match: { isDeleted: false } },
        { $lookup: { from: 'propertystatuses', localField: 'status', foreignField: '_id', as: 'statusDoc' } },
        { $unwind: { path: '$statusDoc', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$statusDoc.name', count: { $sum: 1 } } },
      ]),
      PropertyModel.aggregate([
        { $match: { isDeleted: false } },
        { $lookup: { from: 'countries', localField: 'country', foreignField: '_id', as: 'countryDoc' } },
        { $unwind: { path: '$countryDoc', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$countryDoc.name', count: { $sum: 1 } } },
      ]),
      PropertyModel.aggregate([
        { $match: { isDeleted: false } },
        { $lookup: { from: 'propertytypes', localField: 'propertyType', foreignField: '_id', as: 'typeDoc' } },
        { $unwind: { path: '$typeDoc', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$typeDoc.name', count: { $sum: 1 } } },
      ]),
      PropertyModel.find({ isDeleted: false })
        .select('title slug price city viewCount coverImage')
        .sort({ viewCount: -1 })
        .limit(5)
        .lean(),
      PropertyModel.find({ isDeleted: false })
        .select('title slug price city enquiryCount coverImage')
        .sort({ enquiryCount: -1 })
        .limit(5)
        .lean(),
      PropertyModel.aggregate([
        { $match: { isDeleted: false, price: { $gt: 0 } } },
        {
          $bucket: {
            groupBy: '$price',
            boundaries: [0, 250000, 500000, 1000000, 2500000, 10000000],
            default: 'Luxury €10M+',
            output: { count: { $sum: 1 } },
          },
        },
      ]),
    ]);

    return {
      byStatus: byStatus.map((s) => ({ name: s._id || 'Unspecified', count: s.count })),
      byCountry: byCountry.map((c) => ({ name: c._id || 'Global', count: c.count })),
      byType: byType.map((t) => ({ name: t._id || 'Residential', count: t.count })),
      topViewed,
      topEnquired,
      priceDistribution,
    };
  }

  // 3. Lead Funnel Analytics
  async getLeads(range?: string, _user?: any): Promise<any> {
    const { startDate } = this.getDateFilter(range);

    const [totalLeads, totalViewings, totalOffers, totalDealsWon] = await Promise.all([
      LeadModel.countDocuments({ isDeleted: false, createdAt: { $gte: startDate } }),
      ViewingModel.countDocuments({ createdAt: { $gte: startDate } }),
      OfferModel.countDocuments({ createdAt: { $gte: startDate } }),
      OfferModel.countDocuments({
        status: { $in: ['ACCEPTED', 'accepted'] },
        createdAt: { $gte: startDate },
      }),
    ]);

    const funnel = [
      { stage: '1. Inquiries & Leads', count: totalLeads, percent: 100 },
      {
        stage: '2. Viewings Conducted',
        count: totalViewings,
        percent: totalLeads > 0 ? Math.min(100, Math.round((totalViewings / totalLeads) * 100)) : 0,
      },
      {
        stage: '3. Offers Submitted',
        count: totalOffers,
        percent: totalViewings > 0 ? Math.min(100, Math.round((totalOffers / totalViewings) * 100)) : 0,
      },
      {
        stage: '4. Sales Agreed (Deals)',
        count: totalDealsWon,
        percent: totalOffers > 0 ? Math.min(100, Math.round((totalDealsWon / totalOffers) * 100)) : 0,
      },
    ];

    const overallConversionRate =
      totalLeads > 0 ? Number(((totalDealsWon / totalLeads) * 100).toFixed(1)) : 0;

    return {
      funnel,
      overallConversionRate,
      totalLeads,
      totalViewings,
      totalOffers,
      totalDealsWon,
    };
  }

  // 4. Staff Performance Analytics
  async getStaff(range?: string, _user?: any): Promise<any[]> {
    const { startDate } = this.getDateFilter(range);

    const staffMembers = await UserModel.find({ isDeleted: false, isActive: true })
      .select('name email role phone avatar')
      .lean();

    const leaderboard = await Promise.all(
      staffMembers.map(async (staff: any) => {
        const [leadsCount, completedTasks, viewingsConducted, offersSubmitted, dealsWon] =
          await Promise.all([
            LeadModel.countDocuments({ assignedTo: staff._id, isDeleted: false }),
            TaskModel.countDocuments({ assignedTo: staff._id, status: 'COMPLETED' }),
            ViewingModel.countDocuments({
              assignedTo: staff._id,
              status: { $in: ['COMPLETED', 'completed'] },
            }),
            OfferModel.countDocuments({ submittedBy: staff._id }),
            OfferModel.find({
              submittedBy: staff._id,
              status: { $in: ['ACCEPTED', 'accepted'] },
            }).select('amount'),
          ]);

        const dealVolume = dealsWon.reduce((sum, d) => sum + (d.amount || 0), 0);

        return {
          _id: staff._id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          avatar: staff.avatar,
          leadsCount,
          completedTasks,
          viewingsConducted,
          offersSubmitted,
          dealsClosed: dealsWon.length,
          dealVolume,
        };
      })
    );

    // Sort by deals closed then leads handled
    return leaderboard.sort((a, b) => b.dealVolume - a.dealVolume || b.leadsCount - a.leadsCount);
  }

  // 5. Data Export to CSV
  async exportData(type: 'properties' | 'leads', user?: any): Promise<string> {
    // Log audit event
    await auditService.log({
      userId: user?._id?.toString() || 'SYSTEM',
      userName: user?.name || 'Staff',
      action: 'DATA_EXPORT',
      entity: 'Analytics',
      entityId: type,
    });

    if (type === 'properties') {
      const properties = await PropertyModel.find({ isDeleted: false })
        .populate('country', 'name')
        .populate('propertyType', 'name')
        .populate('status', 'name')
        .populate('currency', 'code symbol')
        .lean();

      const headers = [
        'ID',
        'Title',
        'Slug',
        'Price',
        'Currency',
        'Status',
        'Type',
        'Country',
        'City',
        'Area',
        'Bedrooms',
        'Bathrooms',
        'Living Area (sq m)',
        'Is Published',
        'Created At',
      ];

      const rows = properties.map((p: any) => [
        p._id,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        p.slug,
        p.price || 0,
        p.currency?.code || 'EUR',
        p.status?.name || 'Available',
        p.propertyType?.name || 'Residential',
        p.country?.name || 'Ireland',
        `"${p.city || ''}"`,
        `"${p.area || ''}"`,
        p.bedrooms || '',
        p.bathrooms || '',
        p.livingArea || '',
        p.isPublished ? 'YES' : 'NO',
        p.createdAt?.toISOString() || '',
      ]);

      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (type === 'leads') {
      const leads = await LeadModel.find({ isDeleted: false })
        .populate('customer', 'name email phone')
        .populate('property', 'title slug price')
        .populate('stage', 'name code')
        .populate('source', 'name')
        .populate('assignedTo', 'name email')
        .lean();

      const headers = [
        'ID',
        'Customer Name',
        'Email',
        'Phone',
        'Property Interested',
        'Stage',
        'Source',
        'Priority',
        'Assigned Advisor',
        'Created At',
      ];

      const rows = leads.map((l: any) => [
        l._id,
        `"${(l.customer?.name || '').replace(/"/g, '""')}"`,
        l.customer?.email || '',
        l.customer?.phone || '',
        `"${(l.property?.title || '').replace(/"/g, '""')}"`,
        l.stage?.name || 'New',
        l.source?.name || 'Website',
        l.priority || 'medium',
        `"${l.assignedTo?.name || 'Unassigned'}"`,
        l.createdAt?.toISOString() || '',
      ]);

      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    throw new ValidationError(`Unknown export type: ${type}`);
  }
}

export const analyticsService = new AnalyticsService();
