import { decodeRecord, json } from '../../_health.js';

export default function handler(request, response) {
  const record = decodeRecord(request.query.id);
  return record ? json(response, 200, { stage: 'Examination complete', completed: 3, total: 3, message: `Mapped ${record.fileCount} files and recorded structural evidence.` }) : json(response, 404, { message: 'Examination not found.' });
}
