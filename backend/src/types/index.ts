export type CallType = 'intake' | 'scheduling' | 'billing' | 'pharmacy' | 'referral' | 'other';
export type CallStatus = 'new' | 'pending' | 'waiting_on_patient' | 'escalated' | 'completed';
export type CallPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CallLog {
  id: string;
  patient_name: string;
  phone_number: string;
  call_type: CallType;
  status: CallStatus;
  priority: CallPriority;
  notes?: string;
  assigned_to?: string;
  follow_up_needed: boolean;
  follow_up_note?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCallLogInput {
  patient_name: string;
  phone_number: string;
  call_type: CallType;
  status?: CallStatus;
  priority?: CallPriority;
  notes?: string;
  assigned_to?: string;
  follow_up_needed?: boolean;
  follow_up_note?: string;
}

export interface UpdateCallLogInput {
  patient_name?: string;
  phone_number?: string;
  call_type?: CallType;
  status?: CallStatus;
  priority?: CallPriority;
  notes?: string;
  assigned_to?: string | null;
  follow_up_needed?: boolean;
  follow_up_note?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
