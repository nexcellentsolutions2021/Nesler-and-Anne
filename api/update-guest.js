import { supabase } from './_supabase.js';
import { checkAdmin } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const guest = req.body || {};
    const { data: row } = await supabase.from('guests').select('*').eq('id', guest.id).single();
    if (!row) return res.status(200).json({ success: false, message: 'Guest not found.' });

    let companions = row.companions || [];
    if (guest.mode === 'Fixed' && Array.isArray(guest.companions)) {
      companions = guest.companions.map((name, i) => ({ name: name || '', status: (companions[i] && companions[i].status) || '' }));
      while (companions.length < 19) companions.push({ name: '', status: '' });
    }

    const { error } = await supabase.from('guests').update({
      name1: guest.name1 || '',
      companion_count: Number(guest.companionCount || 0),
      mode: guest.mode === 'Fixed' ? 'Fixed' : 'Open',
      companions
    }).eq('id', guest.id);
    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Guest updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
}
