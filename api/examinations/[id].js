import { decodeRecord, json } from '../_health.js';

export default function handler(request, response) {
  const record = decodeRecord(request.query.id);
  return record ? json(response, 200, record) : json(response, 404, { message: 'Examination not found.' });
}
