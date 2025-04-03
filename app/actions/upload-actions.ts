'use server';

import { revalidatePath } from 'next/cache';
import { auth, currentUser } from '@clerk/nextjs/server';

import { generateSummaryFromGemini } from '@/lib/geminiai';
import { fetchAndExtractPdfText } from '@/lib/langchain';
import { getDbConnection } from '@/lib/db';

import { formatFileNameAsTitle } from '@/utils/format-utils';

interface PdfSummaryType {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}

export async function generatePdfSummary(
  uploadResponse: [
    {
      serverData: {
        userId: string;
        file: {
          ufsUrl: string;
          name: string;
        };
      };
    }
  ]
) {
  if (!uploadResponse) {
    return {
      success: false,
      message: 'File upload failed',
      data: null,
    };
  }

  const {
    serverData: {
      userId,
      file: { ufsUrl: pdfUrl, name: fileName },
    },
  } = uploadResponse[0];

  if (!pdfUrl) {
    return {
      success: false,
      message: 'Invalid file URL',
      data: null,
    };
  }

  try {
    // Extract text from the PDF
    const pdfText = await fetchAndExtractPdfText(pdfUrl);
    console.log('Extracted PDF Text:', pdfText);

    if (!pdfText) {
      return {
        success: false,
        message: 'Failed to extract text from PDF',
        data: null,
      };
    }

    // Generate summary using Gemini AI
    let summary;
    try {
      summary = await generateSummaryFromGemini(pdfText);
      console.log('Generated Summary:', summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        success: false,
        message: 'Failed to generate summary',
        data: null,
      };
    }

    if (!summary) {
      return {
        success: false,
        message: 'Summary generation returned empty response',
        data: null,
      };
    }

    const formattedFileName = formatFileNameAsTitle(fileName);

    return {
      success: true,
      message: 'Summary generated successfully',
      data: {
        userId,
        fileName,
        formattedFileName,
        summary,
      },
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    return {
      success: false,
      message: 'Unexpected error while processing the PDF',
      data: null,
    };
  }
}

export async function getOrCreateUserUUID(clerkUserId: string) {
  const sql = await getDbConnection();

  if (!clerkUserId) {
    throw new Error('User not authenticated');
  }

  // 🔥 Try fetching the user first
  const existingUser = await sql`
    SELECT id FROM users WHERE clerk_user_id = ${clerkUserId};
  `;

  if (existingUser.length > 0) {
    return existingUser[0].id; // ✅ Return the stored UUID
  }

  // 🔥 Fetch Clerk user details
  const user = await currentUser();
  if (!user) {
    throw new Error('Failed to retrieve user data from Clerk');
  }

  const email = user?.emailAddresses?.[0]?.emailAddress || null;

  try {
    // Insert user into DB if not exists, handling email conflicts
    const newUser = await sql`
      INSERT INTO users (clerk_user_id, email) 
      VALUES (${clerkUserId}, ${email}) 
      ON CONFLICT (email) DO NOTHING -- ✅ Prevents duplicate email errors
      RETURNING id;
    `;

    if (newUser.length === 0) {
      // If insert failed, fetch the existing user by email
      const existingEmailUser = await sql`
        SELECT id FROM users WHERE email = ${email};
      `;
      if (existingEmailUser.length > 0) {
        return existingEmailUser[0].id; // ✅ Return existing user UUID
      }
      throw new Error('User exists but could not be retrieved');
    }

    return newUser[0].id; // ✅ Return UUID for use in `pdf_summaries`
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to insert or retrieve user');
  }
}

async function savePdfSummary({
  userId, // This is Clerk's userId (string)
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummaryType) {
  try {
    const sql = await getDbConnection();

    // Get the corresponding UUID for Clerk's userId
    if (!userId) {
      throw new Error('User ID is undefined');
    }
    const uuidUserId = await getOrCreateUserUUID(userId);

    // Insert summary with the correct UUID
    const [result] = await sql`
      INSERT INTO pdf_summaries(user_id, original_file_url, summary_text, title, file_name) 
      VALUES (${uuidUserId}, ${fileUrl}, ${summary}, ${title}, ${fileName}) 
      RETURNING id, summary_text;
    `;

    return result; // Return inserted summary ID
  } catch (error) {
    console.error('Error saving PDF summary:', error);
    throw new Error('Database insertion failed');
  }
}

export async function storePdfSummaryAction({
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummaryType) {
  let saveResult: any;
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: 'User not found',
      };
    }
    saveResult = await savePdfSummary({
      userId,
      fileUrl,
      summary,
      title,
      fileName,
    });
    if (!saveResult) {
      return {
        success: false,
        message: 'Failed to save PDF summary, please try again',
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Error saving PDF summary',
    };
  }

  // Revalidate our cache
  revalidatePath(`/summaries/${saveResult.id}`);

  return {
    success: true,
    message: 'PDF summary saved successfully',
    data: {
      id: saveResult.id,
    },
  };
}
