const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// GET /api/stats — admin dashboard counts
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const [
      { count: totalAlerts },
      { count: totalEvents },
      { count: totalAnnouncements },
      { count: totalUsers }
    ] = await Promise.all([
      supabase.from('alerts').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('announcements').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
    ]);

    const { count: activeAlerts } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    res.json({
      totalAlerts: totalAlerts || 0,
      totalEvents: totalEvents || 0,
      totalAnnouncements: totalAnnouncements || 0,
      totalUsers: totalUsers || 0,
      activeAlerts: activeAlerts || 0,
      recentActivity: (totalAlerts || 0) + (totalEvents || 0) + (totalAnnouncements || 0)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
