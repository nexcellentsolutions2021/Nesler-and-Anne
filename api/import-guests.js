import { supabase } from './_supabase.js';
import { checkAdmin } from './_auth.js';
import { newId } from './_util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const rows = (req.body && req.body.rows) || [];
    const { data: existingGuests } = await supabase.from('guests').select('name1');
    const existing = {};
    (existingGuests || []).forEach(g => { existing[String(g.name1 || '').trim().toLowerCase()] = true; });

    let imported = 0, duplicates = 0, invalid = 0;
    const newRows = [];

    rows.forEach(guest => {
      const name1 = String(guest.name1 || '').trim();
      if (!name1) { invalid++; return; }
      const key = name1.toLowerCase();
      if (existing[key]) { duplicates++; return; }
      existing[key] = true;

      const companions = [];
      if (guest.mode === 'Fixed' && Array.isArray(guest.companions)) {
        for (let i = 0; i < 19; i++) companions.push({ name: guest.companions[i] || '', status: '' });
      }
      newRows.push({
        id: newId(), name1, status1: '', companions,
        companion_count: Number(guest.companionCount || 0),
        mode: guest.mode === 'Fixed' ? 'Fixed' : 'Open',
        total_attending: 0, submitted: false, submitted_at: null, allergies: ''
      });
      imported++;
    });

    if (newRows.length) {
      const { error } = await supabase.from('guests').insert(newRows);
      if (error) throw error;
    }

    return res.status(200).json({ success: true, imported, duplicates, invalid });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
}
