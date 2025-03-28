'use server';

import { auth } from '@clerk/nextjs/server';

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

async function savePdfSummary({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummaryType) {
  try {
    const sql = await getDbConnection();
    await sql`INSERT INTO pdf_summaries(user_id, original_file_url, summary_text, title, file_name) VALUES (
      ${userId},
      ${fileUrl},
      ${summary},
      ${title},
      ${fileName}
    )`;
  } catch (error) {
    console.error('Error saving PDF summary', error);
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
