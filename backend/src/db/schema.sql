-- Users table (stores Firebase user references)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call type enum
CREATE TYPE call_type AS ENUM ('intake', 'scheduling', 'billing', 'pharmacy', 'referral', 'other');

-- Call status enum
CREATE TYPE call_status AS ENUM ('new', 'pending', 'waiting_on_patient', 'escalated', 'completed');

-- Call priority enum
CREATE TYPE call_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Call logs table (main entity)
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  call_type call_type NOT NULL DEFAULT 'other',
  status call_status NOT NULL DEFAULT 'new',
  priority call_priority NOT NULL DEFAULT 'medium',
  notes TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  follow_up_needed BOOLEAN DEFAULT FALSE,
  follow_up_note TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_by ON call_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_call_logs_assigned_to ON call_logs(assigned_to);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_logs_updated_at BEFORE UPDATE ON call_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
