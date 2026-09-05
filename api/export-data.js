import { supabase } from './_supabase.js';
import { checkAdmin } from './_auth.js';
import { rowToObj } from './_util.js';

export default async function handler(req, res) {
  if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const opts = req.method === 'POST' ? (req.body || {}) : (req.query || {});
    const { data: guests, error } = await supabase.from('guests').select('*');
    if (error) throw error;

    let rows = guests.filter(row => String(row.name1 || '').trim()).map(rowToObj);

    if (opts.ids && opts.ids.length) {
      const idSet = new Set(opts.ids);
      rows = rows.filter(o => idSet.has(o.id));
    } else {
      const search = String(opts.search || '').trim().toLowerCase();
      const filter = opts.filter || 'all';
      if (search) rows = rows.filter(o => (o.name1 || '').toLowerCase().indexOf(search) !== -1);
      if (filter === 'responded') rows = rows.filter(o => o.submitted);
      if (filter === 'pending') rows = rows.filter(o => !o.submitted);
      if (filter === 'accepted') rows = rows.filter(o => o.status1 === 'Joyfully Accepts');
      if (filter === 'declined') rows = rows.filter(o => o.status1 === 'Regretfully Declines');
      if (filter === 'attending') rows = rows.filter(o => Number(o.totalAttending || 0) > 0);
      if (filter === 'not-attending') rows = rows.filter(o => o.submitted && Number(o.totalAttending || 0) === 0);
    }

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
