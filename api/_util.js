export function newId() {
  return 'G' + Date.now() + Math.floor(Math.random() * 1000);
}

// Converts a Postgres "guests" row (companions stored as one JSONB array)
// back into the flat name1/status1 ... name20/status20 shape the existing
// front-end HTML/JS already expects, so the admin dashboard needed almost
// no rewriting.
export function rowToObj(row) {
  const obj = {
    id: row.id,
    name1: row.name1 || '',
    status1: row.status1 || '',
    companionCount: row.companion_count || 0,
    mode: row.mode || 'Open',
    totalAttending: row.total_attending || 0,
    submitted: !!row.submitted,
    submittedAt: row.submitted_at || '',
    allergies: row.allergies || ''
  };
  const companions = row.companions || [];
  for (let g = 2; g <= 20; g++) {
    const c = companions[g - 2] || {};
    obj['name' + g] = c.name || '';
    obj['status' + g] = c.status || '';
  }
  return obj;
}
