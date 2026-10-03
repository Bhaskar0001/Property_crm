import { useState, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  Shield,
} from 'lucide-react';

interface AuditLog {
  _id: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  ip?: string;
  before?: any;
  after?: any;
  createdAt: string;
}

export function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page, action, entity],
    queryFn: async () => {
      const res = await api.get('/audit', {
        params: {
          page,
          limit: 25,
          action: action || undefined,
          entity: entity || undefined,
        },
      });
      return res.data;
    },
  });

  const logs: AuditLog[] = data?.data || [];
  const pagination = data?.pagination;

  const getActionBadgeColor = (act: string) => {
    const lower = act.toLowerCase();
    if (lower.includes('create') || lower.includes('add')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (lower.includes('delete') || lower.includes('remove')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (lower.includes('update') || lower.includes('edit')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (lower.includes('login') || lower.includes('auth')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Immutable forensic record of system mutations, administrative changes, and user activities.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-3">
        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="create">CREATE</option>
            <option value="update">UPDATE</option>
            <option value="delete">DELETE</option>
            <option value="login">LOGIN</option>
            <option value="publish">PUBLISH</option>
          </select>
        </div>

        {/* Entity Filter */}
        <select
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value);
            setPage(1);
          }}
          className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
        >
          <option value="">All Entities</option>
          <option value="Property">Property</option>
          <option value="Lead">Lead</option>
          <option value="Offer">Offer</option>
          <option value="Viewing">Viewing</option>
          <option value="User">User</option>
          <option value="Setting">Settings</option>
        </select>

        {(action || entity) && (
          <button
            onClick={() => {
              setAction('');
              setEntity('');
              setPage(1);
            }}
            className="text-xs text-gray-500 hover:text-gray-800 underline ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-2 text-sm">Loading security audit records...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Shield className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium">No audit entries match criteria</p>
            <p className="text-xs text-gray-400 mt-1">
              Actions by administrators and staff are recorded automatically as they occur.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-xs">
                {logs.map((log) => {
                  const hasDetails = log.before || log.after;
                  const isExpanded = expandedLogId === log._id;

                  return (
                    <Fragment key={log._id}>
                      <tr className="hover:bg-gray-50/80 transition">
                        <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-sans text-gray-900">
                          <span className="font-medium">{log.userName || log.userId || 'System'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-bold uppercase ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans text-gray-800 font-medium">
                          {log.entity}
                        </td>
                        <td className="py-3 px-4 text-gray-500 truncate max-w-[120px]">
                          {log.entityId || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {log.ip || '127.0.0.1'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {hasDetails ? (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                              className="inline-flex items-center gap-1 font-sans text-xs text-[#004274] hover:underline"
                            >
                              <span>{isExpanded ? 'Hide Diff' : 'View Diff'}</span>
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          ) : (
                            <span className="text-gray-300 font-sans text-xs">None</span>
                          )}
                        </td>
                      </tr>
                      {/* Expanded Diff Block */}
                      {isExpanded && (
                        <tr className="bg-gray-50/90">
                          <td colSpan={7} className="p-4 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-[11px] font-bold text-gray-500 uppercase font-sans">
                                  State Before Mutation:
                                </span>
                                <pre className="mt-1 p-3 bg-white border border-gray-200 rounded-lg text-[11px] overflow-x-auto text-gray-700 max-h-48">
                                  {log.before ? JSON.stringify(log.before, null, 2) : 'null'}
                                </pre>
                              </div>
                              <div>
                                <span className="text-[11px] font-bold text-gray-500 uppercase font-sans">
                                  State After Mutation:
                                </span>
                                <pre className="mt-1 p-3 bg-white border border-gray-200 rounded-lg text-[11px] overflow-x-auto text-gray-700 max-h-48">
                                  {log.after ? JSON.stringify(log.after, null, 2) : 'null'}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 font-sans">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total log records)
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
