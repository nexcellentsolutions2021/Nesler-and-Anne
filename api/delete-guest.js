import { supabase } from './_supabase.js';
import { checkAdmin } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const ids = (req.body && req.body.ids) || [];
    const { error } = await supabase.from('guests').delete().in('id', ids);
    if (error) throw error;
    return res.status(200).json({ success: true, deleted: ids.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
}
