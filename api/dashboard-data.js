import { supabase } from './_supabase.js';
import { checkAdmin } from './_auth.js';

export default async function handler(req, res) {
  if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { data: guests, error } = await supabase.from('guests').select('*');
    if (error) throw error;

    let totalMainGuests = 0, totalInvited = 0, totalResponded = 0, totalPending = 0;
    let totalAccepted = 0, totalDeclined = 0, totalAttending = 0, totalNotAttending = 0;
    const timeline = {};
    const recent = [];

    guests.forEach(row => {
      if (!String(row.name1 || '').trim()) return;
      totalMainGuests++;
      const companionCount = row.companion_count || 0;
      totalInvited += companionCount + 1;

      if (row.submitted) {
        totalResponded++;
        if (row.status1 === 'Joyfully Accepts') totalAccepted++;
        else if (row.status1 === 'Regretfully Declines') totalDeclined++;

        const attending = row.total_attending || 0;
        totalAttending += attending;
        totalNotAttending += Math.max((companionCount + 1) - attending, 0);

        if (row.submitted_at) {
          const key = new Date(row.submitted_at).toISOString().slice(0, 10);
          timeline[key] = (timeline[key] || 0) + 1;
        }

        recent.push({ id: row.id, name: row.name1, response: row.status1, attending, date: row.submitted_at || '' });
      } else {
        totalPending++;
      }
    });

    recent.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentTop = recent.slice(0, 10);
    const timelineArr = Object.keys(timeline).sort().map(k => ({ date: k, count: timeline[k] }));

    return res.status(200).json({
      stats: { totalMainGuests, totalInvited, totalResponded, totalPending, totalAccepted, totalDeclined, totalAttending, totalNotAttending },
      timeline: timelineArr,
      recent: recentTop
    });
  } catch (err) {
    return res.status(500).json({
      stats: { totalMainGuests: 0, totalInvited: 0, totalResponded: 0, totalPending: 0, totalAccepted: 0, totalDeclined: 0, totalAttending: 0, totalNotAttending: 0 },
      timeline: [], recent: [], error: 'Server error: ' + err.message
    });
  }
}
