const express = require('express');
const { body } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const supabase = require('../config/supabase');

const router = express.Router();

const eventValidation = [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title must be 200 characters or fewer'),
  body('location').notEmpty().withMessage('Location is required'),
  body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('description').optional().isLength({ max: 5000 }).withMessage('Description must be 5000 characters or fewer')
];

// GET /api/events
router.get('/', protect, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) return next(error);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/events
router.post('/', protect, adminOnly, validate(eventValidation), async (req, res, next) => {
  try {
    const { title, description, location, date, time, category, organizer } = req.body;
    const { data, error } = await supabase
      .from('events')
      .insert({ title, description, location, date, time, category, organizer, created_by: req.user.id })
      .select()
      .single();

    if (error) return next(error);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/:id
router.put('/:id', protect, adminOnly, validate(eventValidation), async (req, res, next) => {
  try {
    const { title, description, location, date, time, category, organizer } = req.body;
    const { data, error } = await supabase
      .from('events')
      .update({ title, description, location, date, time, category, organizer })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return next(error);
    if (!data) return res.status(404).json({ message: 'Event not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/:id
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return next(error);
    if (!data) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
