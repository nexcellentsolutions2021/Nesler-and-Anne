import { supabase } from './_supabase.js';

export default async function handler(req, res) {
  try {
    const { data: setting } = await supabase
      .from('settings').select('value').eq('key', 'rsvp_active').single();
    const active = setting ? setting.value === 'true' : true;
    if (!active) return res.status(200).json({ found: false, rsvpClosed: true });

    const name = String(req.query.name || '').trim().toLowerCase();
    if (!name) return res.status(200).json({ found: false });

    const { data: guests, error } = await supabase.from('guests').select('*');
    if (error) throw error;

    const row = guests.find(g => String(g.name1 || '').trim().toLowerCase() === name);
    if (!row) return res.status(200).json({ found: false });

    const alreadySubmitted = !!row.submitted;
    const seat = (row.companion_count || 0) + 1;
    const companionsArr = row.companions || [];
    let companionNames = [];
    if (row.mode === 'Fixed') {
      for (let g = 2; g <= seat; g++) {
        companionNames.push((companionsArr[g - 2] && companionsArr[g - 2].name) || '');
      }
    }

    return res.status(200).json({
      found: true,
      alreadySubmitted,
      name: row.name1,
      seat,
      mode: row.mode || 'Open',
      guests: companionNames
    });
  } catch (err) {
    return res.status(500).json({ found: false, error: 'Server error: ' + err.message });
  }
}
