import { supabase } from './_supabase.js';
import { checkAdmin } from './_auth.js';

export default async function handler(req, res) {
  if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const kind = req.query.kind;
    const wantStatus = kind === 'attending' ? 'Joyfully Accepts' : 'Regretfully Declines';
    const { data: guests, error } = await supabase.from('guests').select('*');
    if (error) throw error;

    const list = [];
    guests.forEach(row => {
      const mainName = String(row.name1 || '').trim();
      if (!mainName) return;
      const seat = (row.companion_count || 0) + 1;
      const companions = row.companions || [];

      for (let g = 1; g <= seat; g++) {
        const personName = g === 1 ? mainName : ((companions[g - 2] && companions[g - 2].name) || '');
        const personStatus = g === 1 ? row.status1 : ((companions[g - 2] && companions[g - 2].status) || '');
        if (!personName || personStatus !== wantStatus) continue;
        list.push({ name: personName, isMain: g === 1, mainGuest: mainName });
      }
    });

    list.sort((a, b) => {
      if (a.mainGuest === b.mainGuest) return a.isMain ? -1 : (b.isMain ? 1 : 0);
      return a.mainGuest < b.mainGuest ? -1 : 1;
    });

    return res.status(200).json({ list, count: list.length });
  } catch (err) {
    return res.status(500).json({ list: [], count: 0, error: 'Server error: ' + err.message });
  }
}
