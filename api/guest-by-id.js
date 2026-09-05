import { supabase } from './_supabase.js';
import { checkAdmin } from './_auth.js';
import { rowToObj } from './_util.js';

export default async function handler(req, res) {
  if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { data, error } = await supabase.from('guests').select('*').eq('id', req.query.id).single();
    if (error || !data) return res.status(200).json(null);
    return res.status(200).json(rowToObj(data));
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
