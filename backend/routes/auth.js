const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const supabase = require('../config/supabase');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ]),
  async (req, res, next) => {
    try {
      const { email, password, displayName } = req.body;
      const name = displayName || email.split('@')[0];

      // Use admin.createUser to bypass email confirmation requirement
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: name }
      });

      if (error) {
        if (error.message.includes('already registered') || error.code === 'email_exists' || error.message.includes('already been registered')) {
          return res.status(409).json({ message: 'Email already registered' });
        }
        return next(error);
      }

      // Sign in immediately to get a session token
      const { data: session, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) return next(signInError);

      // Wait briefly for the trigger to create the profile row
      await new Promise(r => setTimeout(r, 600));
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

      res.status(201).json({
        token: session.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || 'user',
          displayName: profile?.display_name || name
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  validate([
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ]),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      res.json({
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || 'user',
          displayName: profile?.display_name || ''
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  const { id, email, profile } = req.user;
  res.json({
    id,
    email,
    role: profile?.role || 'user',
    displayName: profile?.display_name || '',
    rank: profile?.rank || 'Personnel',
    unit: profile?.unit || 'Community Member'
  });
});

// PUT /api/auth/profile — update own profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { displayName, rank, unit } = req.body;
    const updates = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (rank !== undefined) updates.rank = rank;
    if (unit !== undefined) updates.unit = unit;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) return next(error);
    res.json({
      id: data.id,
      email: data.email,
      role: data.role,
      displayName: data.display_name,
      rank: data.rank,
      unit: data.unit
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
