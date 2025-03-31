'use server';

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

async function getOrCreateUserUUID() {
  const sql = await getDbConnection();

  // Get the logged-in user's Clerk userId
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check if user already exists in the database
  const existingUser = await sql`
    SELECT id FROM users WHERE clerk_user_id = ${userId};
  `;
  if (existingUser.length > 0) {
    return existingUser[0].id; // Return existing UUID
  }

  // ✅ Fetch user details (including email) from Clerk
  const user = await currentUser();
  if (!user) {
    throw new Error('Failed to retrieve user data from Clerk');
  }

  const email = user?.emailAddresses?.[0]?.emailAddress || null; // Get primary email

  // ✅ Insert new user into database with email
  const newUser = await sql`
    INSERT INTO users (clerk_user_id, email) 
    VALUES (${userId}, ${email}) 
    RETURNING id;
  `;

  return newUser[0].id; // Return new UUID
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
    const uuidUserId = await getOrCreateUserUUID();

    // Insert summary with the correct UUID
    const result = await sql`
      INSERT INTO pdf_summaries(user_id, original_file_url, summary_text, title, file_name) 
      VALUES (${uuidUserId}, ${fileUrl}, ${summary}, ${title}, ${fileName}) 
      RETURNING id;
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

    return {
      success: true,
      message: 'PDF summary saved successfully',
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Error saving PDF summary',
    };
  }
}
