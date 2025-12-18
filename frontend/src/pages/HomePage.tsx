import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCallLogs, deleteCallLog } from '../services/api';
import type { CallLog, CallStatus } from '../types';
import CallFormModal from '../components/CallFormModal';
import deltyLogo from './delty-logo.png';

const STATUS_COLORS: Record<CallStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  waiting_on_patient: 'bg-purple-100 text-purple-800',
  escalated: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
};

const PRIORITY_COLORS = {
  low: 'text-gray-500',
  medium: 'text-blue-600',
  high: 'text-orange-600',
  urgent: 'text-red-600 font-semibold',
};

export default function HomePage() {
  const { user, signOut } = useAuth();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCall, setEditingCall] = useState<CallLog | null>(null);

  const fetchCalls = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getCallLogs(page, 10, statusFilter, search);
      setCalls(result.data);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load calls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [page, statusFilter, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this call?')) return;
    try {
      await deleteCallLog(id);
      fetchCalls();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleEdit = (call: CallLog) => {
    setEditingCall(call);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingCall(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCall(null);
    fetchCalls();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={deltyLogo} alt="Delty Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-gray-900">Patient Call Log</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button onClick={signOut} className="text-sm text-red-600 hover:text-red-700">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="pending">Pending</option>
              <option value="waiting_on_patient">Waiting on Patient</option>
              <option value="escalated">Escalated</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            + New Call
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading calls...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
            {error}
            <button onClick={fetchCalls} className="ml-4 underline">Retry</button>
          </div>
        )}

        {!loading && !error && calls.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No calls found</p>
            <button onClick={handleCreate} className="text-blue-600 hover:underline">
              Log your first call
            </button>
          </div>
        )}

        {!loading && !error && calls.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Follow-up</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calls.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{call.patient_name}</div>
                        <div className="text-sm text-gray-500">{call.phone_number}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{call.call_type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[call.status]}`}>
                          {call.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm capitalize ${PRIORITY_COLORS[call.priority]}`}>
                        {call.priority}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {call.follow_up_needed ? (
                          <span className="text-orange-600">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(call.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button onClick={() => handleEdit(call)} className="text-blue-600 hover:underline mr-3">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(call.id)} className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <CallFormModal
          call={editingCall}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
