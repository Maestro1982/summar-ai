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

export async function getSummaryById(id: string) {
  try {
    const sql = await getDbConnection();
    const [summary] =
      await sql`SELECT id, user_id, title, original_file_url, summary_text, created_at, updated_at, status, file_name, LENGTH(summary_text) - LENGTH(REPLACE(summary_text, ' ', '')) + 1 AS word_count FROM pdf_summaries WHERE id=${id}`;
    return summary;
  } catch (error) {
    console.error('Error fetching summary by id', error);
  }
}
