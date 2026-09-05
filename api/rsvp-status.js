import { supabase } from './_supabase.js';

export default async function handler(req, res) {
  try {
    const { data } = await supabase.from('settings').select('value').eq('key', 'rsvp_active').single();
    return res.status(200).json({ active: data ? data.value === 'true' : true });
  } catch (err) {
    return res.status(200).json({ active: true, error: 'Server error: ' + err.message });
  }
}
