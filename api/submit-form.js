import { supabase } from './_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { data: setting } = await supabase
      .from('settings').select('value').eq('key', 'rsvp_active').single();
    const active = setting ? setting.value === 'true' : true;
    if (!active) {
      return res.status(200).json({ success: false, message: 'RSVP submissions are currently closed.', rsvpClosed: true });
    }

    const payload = req.body || {};
    const mainName = String(payload.name || '').trim();
    if (!mainName) return res.status(200).json({ success: false, message: 'Guest name is required.' });

    const { data: guests, error } = await supabase.from('guests').select('*');
    if (error) throw error;

    const row = guests.find(g => String(g.name1 || '').trim().toLowerCase() === mainName.toLowerCase());
    if (!row) return res.status(200).json({ success: false, message: 'Guest record not found.' });
    if (row.submitted) return res.status(200).json({ success: false, message: 'This RSVP has already been submitted.' });

    const companions = row.companions ? [...row.companions] : [];
    for (let g = 2; g <= 20; g++) {
      const gName = payload['guest' + g];
      const gStatus = payload['status' + g];
      const idx = g - 2;
      const existing = companions[idx] || {};
      companions[idx] = {
        name: (gName !== undefined && gName !== '') ? gName : (existing.name || ''),
        status: gStatus !== undefined ? gStatus : (existing.status || '')
      };
    }

    const { error: updErr } = await supabase.from('guests').update({
      status1: payload.mainStatus || '',
      companions,
      total_attending: payload.totalSeat || 0,
      submitted: true,
      submitted_at: new Date().toISOString(),
      allergies: payload.allergies !== undefined ? String(payload.allergies || '').trim() : row.allergies
    }).eq('id', row.id);
    if (updErr) throw updErr;

    return res.status(200).json({ success: true, message: 'We are excited to celebrate our special day with you.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
}
