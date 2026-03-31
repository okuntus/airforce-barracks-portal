const express = require('express');
const { body } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const supabase = require('../config/supabase');

const router = express.Router();

const alertValidation = [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('message').notEmpty().withMessage('Message is required').isLength({ max: 5000 }),
  body('severity').optional().isIn(['low', 'medium', 'high', 'warning', 'info'])
];

// GET /api/alerts
router.get('/', protect, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return next(error);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/alerts
router.post('/', protect, adminOnly, validate(alertValidation), async (req, res, next) => {
  try {
    const { title, message, severity, status, expires_at, expiresAt } = req.body;
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        title,
        message,
        severity: severity || 'medium',
        status: status || 'active',
        expires_at: expires_at || expiresAt || null,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) return next(error);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/alerts/:id
router.put('/:id', protect, adminOnly, validate(alertValidation), async (req, res, next) => {
  try {
    const { title, message, severity, status, expires_at, expiresAt } = req.body;
    const { data, error } = await supabase
      .from('alerts')
      .update({ title, message, severity, status, expires_at: expires_at || expiresAt || null })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return next(error);
    if (!data) return res.status(404).json({ message: 'Alert not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return next(error);
    if (!data) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
