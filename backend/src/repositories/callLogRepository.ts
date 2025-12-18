import pool from '../db';
import { CallLog, CreateCallLogInput, UpdateCallLogInput, PaginatedResponse } from '../types';

export async function getCallLogs(
  page: number = 1,
  limit: number = 10,
  status?: string,
  search?: string
): Promise<PaginatedResponse<CallLog>> {
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (status && status !== 'all') {
    conditions.push(`status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  if (search) {
    conditions.push(`(patient_name ILIKE $${paramIndex} OR phone_number ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM call_logs ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Get paginated data
  const dataParams = [...params, limit, offset];
  const result = await pool.query<CallLog>(
    `SELECT * FROM call_logs ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    dataParams
  );

  return {
    data: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getCallLogById(id: string): Promise<CallLog | null> {
  const result = await pool.query<CallLog>(
    'SELECT * FROM call_logs WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function createCallLog(input: CreateCallLogInput, createdBy: string): Promise<CallLog> {
  const result = await pool.query<CallLog>(
    `INSERT INTO call_logs (
      patient_name, phone_number, call_type, status, priority,
      notes, assigned_to, follow_up_needed, follow_up_note, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      input.patient_name,
      input.phone_number,
      input.call_type,
      input.status || 'new',
      input.priority || 'medium',
      input.notes || null,
      input.assigned_to || null,
      input.follow_up_needed || false,
      input.follow_up_note || null,
      createdBy
    ]
  );
  return result.rows[0];
}

export async function updateCallLog(id: string, input: UpdateCallLogInput): Promise<CallLog | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  if (fields.length === 0) return getCallLogById(id);

  values.push(id);
  const result = await pool.query<CallLog>(
    `UPDATE call_logs SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteCallLog(id: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM call_logs WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
