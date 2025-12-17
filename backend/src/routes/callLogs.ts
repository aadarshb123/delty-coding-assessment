import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { findOrCreateUser } from '../repositories/userRepository';
import * as callLogRepo from '../repositories/callLogRepository';
import { CreateCallLogInput, UpdateCallLogInput, CallType, CallStatus, CallPriority } from '../types';

const router = Router();

// Validation helpers
const CALL_TYPES: CallType[] = ['intake', 'scheduling', 'billing', 'pharmacy', 'referral', 'other'];
const CALL_STATUSES: CallStatus[] = ['new', 'pending', 'waiting_on_patient', 'escalated', 'completed'];
const CALL_PRIORITIES: CallPriority[] = ['low', 'medium', 'high', 'urgent'];

function validateCallLogInput(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.patient_name || typeof input.patient_name !== 'string') {
    errors.push('patient_name is required');
  }
  if (!input.phone_number || typeof input.phone_number !== 'string') {
    errors.push('phone_number is required');
  }
  if (!input.call_type || !CALL_TYPES.includes(input.call_type)) {
    errors.push(`call_type must be one of: ${CALL_TYPES.join(', ')}`);
  }
  if (input.status && !CALL_STATUSES.includes(input.status)) {
    errors.push(`status must be one of: ${CALL_STATUSES.join(', ')}`);
  }
  if (input.priority && !CALL_PRIORITIES.includes(input.priority)) {
    errors.push(`priority must be one of: ${CALL_PRIORITIES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

// All routes require authentication
router.use(authMiddleware);

// GET /api/call-logs - List all call logs with pagination
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const status = req.query.status as string;

    const result = await callLogRepo.getCallLogs(page, limit, status);
    res.json(result);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

// GET /api/call-logs/:id - Get single call log
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const callLog = await callLogRepo.getCallLogById(req.params.id);
    if (!callLog) {
      res.status(404).json({ error: 'Call log not found' });
      return;
    }
    res.json(callLog);
  } catch (error) {
    console.error('Error fetching call log:', error);
    res.status(500).json({ error: 'Failed to fetch call log' });
  }
});

// POST /api/call-logs - Create new call log
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const validation = validateCallLogInput(req.body);
    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', details: validation.errors });
      return;
    }

    // Ensure user exists in our database
    const user = await findOrCreateUser(req.user!.uid, req.user!.email || '');

    const input: CreateCallLogInput = {
      patient_name: req.body.patient_name,
      phone_number: req.body.phone_number,
      call_type: req.body.call_type,
      status: req.body.status,
      priority: req.body.priority,
      notes: req.body.notes,
      assigned_to: req.body.assigned_to,
      follow_up_needed: req.body.follow_up_needed,
      follow_up_note: req.body.follow_up_note,
    };

    const callLog = await callLogRepo.createCallLog(input, user.id);
    res.status(201).json(callLog);
  } catch (error) {
    console.error('Error creating call log:', error);
    res.status(500).json({ error: 'Failed to create call log' });
  }
});

// PUT /api/call-logs/:id - Update call log
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await callLogRepo.getCallLogById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Call log not found' });
      return;
    }

    // Validate optional fields if provided
    if (req.body.call_type && !CALL_TYPES.includes(req.body.call_type)) {
      res.status(400).json({ error: `call_type must be one of: ${CALL_TYPES.join(', ')}` });
      return;
    }
    if (req.body.status && !CALL_STATUSES.includes(req.body.status)) {
      res.status(400).json({ error: `status must be one of: ${CALL_STATUSES.join(', ')}` });
      return;
    }
    if (req.body.priority && !CALL_PRIORITIES.includes(req.body.priority)) {
      res.status(400).json({ error: `priority must be one of: ${CALL_PRIORITIES.join(', ')}` });
      return;
    }

    const input: UpdateCallLogInput = {
      patient_name: req.body.patient_name,
      phone_number: req.body.phone_number,
      call_type: req.body.call_type,
      status: req.body.status,
      priority: req.body.priority,
      notes: req.body.notes,
      assigned_to: req.body.assigned_to,
      follow_up_needed: req.body.follow_up_needed,
      follow_up_note: req.body.follow_up_note,
    };

    const callLog = await callLogRepo.updateCallLog(req.params.id, input);
    res.json(callLog);
  } catch (error) {
    console.error('Error updating call log:', error);
    res.status(500).json({ error: 'Failed to update call log' });
  }
});

// DELETE /api/call-logs/:id - Delete call log
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await callLogRepo.deleteCallLog(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Call log not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting call log:', error);
    res.status(500).json({ error: 'Failed to delete call log' });
  }
});

export default router;
