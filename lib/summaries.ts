import { getDbConnection } from './db';

import { getOrCreateUserUUID } from '@/app/actions/upload-actions';

export async function getSummaries(clerkUserId: string) {
  const sql = await getDbConnection();

  // Ensure we get the correct UUID
  const userId = await getOrCreateUserUUID(clerkUserId);

  // Fetch summaries using the correct UUID
  const summaries = await sql`
    SELECT * FROM pdf_summaries WHERE user_id = ${userId} ORDER BY created_at DESC;
  `;

  return summaries;
}
