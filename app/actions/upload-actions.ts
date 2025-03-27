'use server';

import { generateSummaryFromGemini } from '@/lib/geminiai';
import { fetchAndExtractPdfText } from '@/lib/langchain';

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

    return {
      success: true,
      message: 'Summary generated successfully',
      data: {
        userId,
        fileName,
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
