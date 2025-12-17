import { useState } from 'react';
import { createCallLog, updateCallLog } from '../services/api';
import type { CallLog, CallType, CallStatus, CallPriority } from '../types';

interface Props {
  call: CallLog | null;
  onClose: () => void;
}

const CALL_TYPES: CallType[] = ['intake', 'scheduling', 'billing', 'pharmacy', 'referral', 'other'];
const CALL_STATUSES: CallStatus[] = ['new', 'pending', 'waiting_on_patient', 'escalated', 'completed'];
const CALL_PRIORITIES: CallPriority[] = ['low', 'medium', 'high', 'urgent'];

export default function CallFormModal({ call, onClose }: Props) {
  const isEditing = !!call;

  const [formData, setFormData] = useState({
    patient_name: call?.patient_name || '',
    phone_number: call?.phone_number || '',
    call_type: call?.call_type || 'other' as CallType,
    status: call?.status || 'new' as CallStatus,
    priority: call?.priority || 'medium' as CallPriority,
    notes: call?.notes || '',
    follow_up_needed: call?.follow_up_needed || false,
    follow_up_note: call?.follow_up_note || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await updateCallLog(call.id, formData);
      } else {
        await createCallLog(formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isEditing ? 'Edit Call' : 'Log New Call'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
              <input
                type="text"
                name="patient_name"
                value={formData.patient_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Type *</label>
                <select
                  name="call_type"
                  value={formData.call_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CALL_TYPES.map(type => (
                    <option key={type} value={type} className="capitalize">{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CALL_STATUSES.map(status => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CALL_PRIORITIES.map(priority => (
                    <option key={priority} value={priority} className="capitalize">{priority}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Call notes..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="follow_up_needed"
                name="follow_up_needed"
                checked={formData.follow_up_needed}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="follow_up_needed" className="text-sm text-gray-700">
                Follow-up needed
              </label>
            </div>

            {formData.follow_up_needed && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Note</label>
                <input
                  type="text"
                  name="follow_up_note"
                  value={formData.follow_up_note}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What needs follow-up?"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
