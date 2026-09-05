import { supabase } from './_supabase.js';
import { checkAdmin } from './_auth.js';
import { newId } from './_util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const guest = req.body || {};
    const name1 = String(guest.name1 || '').trim();
    if (!name1) return res.status(200).json({ success: false, message: 'Main guest name is required.' });

    const { data: existing } = await supabase.from('guests').select('id,name1');
    if (existing && existing.some(g => String(g.name1 || '').trim().toLowerCase() === name1.toLowerCase())) {
      return res.status(200).json({ success: false, message: 'A guest with this name already exists.' });
    }

    const companions = [];
    if (guest.mode === 'Fixed' && Array.isArray(guest.companions)) {
      for (let i = 0; i < 19; i++) companions.push({ name: guest.companions[i] || '', status: '' });
    }

    const { error } = await supabase.from('guests').insert({
      id: newId(), name1, status1: '', companions,
      companion_count: Number(guest.companionCount || 0),
      mode: guest.mode === 'Fixed' ? 'Fixed' : 'Open',
      total_attending: 0, submitted: false, submitted_at: null, allergies: ''
    });
    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Guest added.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
}
