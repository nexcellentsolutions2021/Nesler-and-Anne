import { supabase } from './_supabase.js';
import { checkAdmin } from './_auth.js';
import { rowToObj } from './_util.js';

export default async function handler(req, res) {
  if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const q = req.query;
    const search = String(q.search || '').trim().toLowerCase();
    const filter = q.filter || 'all';
    const sortField = q.sortField || 'name1';
    const sortDir = q.sortDir || 'asc';
    const page = Number(q.page || 1);
    const pageSize = Number(q.pageSize || 10);

    const { data: guests, error } = await supabase.from('guests').select('*');
    if (error) throw error;

    let rows = guests.filter(row => String(row.name1 || '').trim()).map(rowToObj);

    if (search) {
      rows = rows.filter(obj => {
        let hay = obj.name1;
        for (let g = 2; g <= 10; g++) hay += ' ' + (obj['name' + g] || '');
        return hay.toLowerCase().indexOf(search) !== -1;
      });
    }
    if (filter === 'responded') rows = rows.filter(o => o.submitted);
    if (filter === 'pending') rows = rows.filter(o => !o.submitted);
    if (filter === 'accepted') rows = rows.filter(o => o.status1 === 'Joyfully Accepts');
    if (filter === 'declined') rows = rows.filter(o => o.status1 === 'Regretfully Declines');
    if (filter === 'attending') rows = rows.filter(o => Number(o.totalAttending || 0) > 0);
    if (filter === 'not-attending') rows = rows.filter(o => o.submitted && Number(o.totalAttending || 0) === 0);

    rows.sort((a, b) => {
      const av = a[sortField] || '', bv = b[sortField] || '';
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const pageRows = rows.slice(start, start + pageSize);

    return res.status(200).json({ rows: pageRows, total, page, pageSize });
  } catch (err) {
    return res.status(500).json({ rows: [], total: 0, page: 1, pageSize: 10, error: 'Server error: ' + err.message });
  }
}
