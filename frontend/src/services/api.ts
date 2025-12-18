import { auth } from '../lib/firebase';
import type { CallLog, CreateCallLogInput, UpdateCallLogInput, PaginatedResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export async function getCallLogs(
  page: number = 1,
  limit: number = 10,
  status?: string,
  search?: string
): Promise<PaginatedResponse<CallLog>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status && status !== 'all') params.append('status', status);
  if (search) params.append('search', search);

  const response = await fetch(`${API_URL}/api/call-logs?${params}`, {
    headers: await getAuthHeaders(),
  });
  return handleResponse<PaginatedResponse<CallLog>>(response);
}

export async function getCallLog(id: string): Promise<CallLog> {
  const response = await fetch(`${API_URL}/api/call-logs/${id}`, {
    headers: await getAuthHeaders(),
  });
  return handleResponse<CallLog>(response);
}

export async function createCallLog(input: CreateCallLogInput): Promise<CallLog> {
  const response = await fetch(`${API_URL}/api/call-logs`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  });
  return handleResponse<CallLog>(response);
}

export async function updateCallLog(id: string, input: UpdateCallLogInput): Promise<CallLog> {
  const response = await fetch(`${API_URL}/api/call-logs/${id}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  });
  return handleResponse<CallLog>(response);
}

export async function deleteCallLog(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/call-logs/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Delete failed' }));
    throw new Error(error.error || 'Delete failed');
  }
}
