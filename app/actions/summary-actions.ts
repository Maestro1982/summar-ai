'use server';

import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

import { getDbConnection } from '@/lib/db';
import { getOrCreateUserUUID } from '@/app/actions/upload-actions';

export async function deleteSummaryAction({
  summaryId,
}: {
  summaryId: string;
}) {
  try {
    const user = await currentUser();
    const clerkUserId = user?.id;

    if (!clerkUserId) {
      throw new Error('User not found');
    }

    // 🔥 Convert Clerk user ID to UUID
    const userId = await getOrCreateUserUUID(clerkUserId);
    const sql = await getDbConnection();

    // Delete from db
    const result =
      await sql`DELETE FROM pdf_summaries WHERE id= ${summaryId} AND user_id= ${userId} RETURNING id`;

    if (result.length > 0) {
      revalidatePath('/dashboard');
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error('Error deleting summary', error);
    return { success: false };
  }
}
