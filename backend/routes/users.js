const express = require('express');
const { body } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const supabase = require('../config/supabase');

const router = express.Router();

// GET /api/users — list all users (admin only)
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return next(error);
    res.json(data);
  } catch (err) { next(err); }
});

// POST /api/users — create user (admin only)
router.post('/', protect, adminOnly, validate([
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin')
]), async (req, res, next) => {
  try {
    const { email, password, displayName, rank, unit, role = 'user', phone = '' } = req.body;
    const name = displayName || email.split('@')[0];

    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { display_name: name }
    });
    if (error) {
      if (error.message.includes('already registered') || error.code === 'email_exists') {
        return res.status(409).json({ message: 'Email already registered' });
      }
      return next(error);
    }

    await new Promise(r => setTimeout(r, 600));
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({ role, display_name: name, rank: rank || 'Personnel', unit: unit || 'Community Member', phone: phone || '' })
      .eq('id', data.user.id)
      .select()
      .single();

    if (profileError) return next(profileError);
    res.status(201).json(profile);
  } catch (err) { next(err); }
});

// PUT /api/users/:id — update user profile + role (admin only)
router.put('/:id', protect, adminOnly, validate([
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin')
]), async (req, res, next) => {
  try {
    const { displayName, rank, unit, role, phone } = req.body;
    const updates = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (rank !== undefined) updates.rank = rank;
    if (unit !== undefined) updates.unit = unit;
    if (role !== undefined) updates.role = role;
    if (phone !== undefined) updates.phone = phone;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return next(error);
    if (!data) return res.status(404).json({ message: 'User not found' });
    res.json(data);
  } catch (err) { next(err); }
});

// DELETE /api/users/:id — delete user (admin only, cannot delete self)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    const { error } = await supabase.auth.admin.deleteUser(req.params.id);
    if (error) return next(error);
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
