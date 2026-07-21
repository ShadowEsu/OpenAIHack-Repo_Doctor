import { encodeRecord, examine, json } from './_health.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return json(response, 405, { message: 'Method not allowed.' });
  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    if (body?.source !== 'github' || typeof body?.url !== 'string') return json(response, 400, { message: 'Submit a public GitHub repository URL in the form https://github.com/owner/repository.' });
    const record = await examine(body.url);
    return json(response, 201, { id: encodeRecord(record), status: 'complete' });
  } catch (error) { return json(response, 502, { message: error instanceof Error ? error.message : 'Repository examination failed.' }); }
}
