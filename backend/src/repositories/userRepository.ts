import pool from '../db';
import { User } from '../types';

export async function findOrCreateUser(firebaseUid: string, email: string): Promise<User> {
  // Try to find existing user
  const existing = await pool.query<User>(
    'SELECT * FROM users WHERE firebase_uid = $1',
    [firebaseUid]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Create new user
  const result = await pool.query<User>(
    'INSERT INTO users (firebase_uid, email) VALUES ($1, $2) RETURNING *',
    [firebaseUid, email]
  );

  return result.rows[0];
}

export async function getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE firebase_uid = $1',
    [firebaseUid]
  );
  return result.rows[0] || null;
}

export async function getAllUsers(): Promise<User[]> {
  const result = await pool.query<User>('SELECT id, email, name FROM users ORDER BY email');
  return result.rows;
}
