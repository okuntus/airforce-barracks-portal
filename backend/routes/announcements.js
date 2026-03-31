const express = require('express');
const { body } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const supabase = require('../config/supabase');

const router = express.Router();

const announcementValidation = [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title must be 200 characters or fewer'),
  body('content').notEmpty().withMessage('Content is required').isLength({ max: 5000 }).withMessage('Content must be 5000 characters or fewer'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be one of: low, medium, high')
];

// GET /api/announcements
router.get('/', protect, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return next(error);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/announcements
router.post('/', protect, adminOnly, validate(announcementValidation), async (req, res, next) => {
  try {
    const { title, content, priority, category, author } = req.body;
    const { data, error } = await supabase
      .from('announcements')
      .insert({ title, content, priority, category, author, created_by: req.user.id })
      .select()
      .single();

    if (error) return next(error);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/announcements/:id
router.put('/:id', protect, adminOnly, validate(announcementValidation), async (req, res, next) => {
  try {
    const { title, content, priority, category, author } = req.body;
    const { data, error } = await supabase
      .from('announcements')
      .update({ title, content, priority, category, author })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return next(error);
    if (!data) return res.status(404).json({ message: 'Announcement not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return next(error);
    if (!data) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
