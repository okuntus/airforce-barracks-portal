const { createClient } = require('@supabase/supabase-js');

// Verify the JWT from Supabase Auth and attach user + profile to req
exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Use anon client to verify the user token
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    // Fetch profile (role, displayName, etc.)
    const serviceSupabase = require('../config/supabase');
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = { ...user, profile };
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.profile?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
