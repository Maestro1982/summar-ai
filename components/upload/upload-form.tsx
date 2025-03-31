'use client';

import { z } from 'zod';
import { toast } from 'sonner';
import { useRef, useState } from 'react';

import UploadFormInput from '@/components/upload/upload-form-input';

import { useUploadThing } from '@/utils/uploadthing';

import {
  generatePdfSummary,
  storePdfSummaryAction,
} from '@/app/actions/upload-actions';

const schema = z.object({
  file: z
    .instanceof(File, { message: 'Please upload a PDF file' })
    .refine(
      (file) => file.size <= 20 * 1024 * 1024,
      'File size must be less than 20MB'
    )
    .refine((file) => file.type === 'application/pdf', 'File must be a PDF'),
});

const UploadForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { startUpload } = useUploadThing('pdfUploader', {
    onClientUploadComplete: () => {
      console.log('Uploaded successfully!');
    },
    onUploadError: (err) => {
      console.error('Error occurred while uploading:', err);
      toast.error('An error occurred while uploading the file', {
        description: err.message,
      });
    },
    onUploadBegin: (fileName: string) => {
      console.log('Upload has begun for', fileName);
    },
  });

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const formData = new FormData(e.currentTarget);
      const file = formData.get('file');

      // Ensure the retrieved file is actually a File object
      if (!(file instanceof File)) {
        console.error('Invalid file selected');
        return;
      }

      const validatedFields = schema.safeParse({ file });
      if (!validatedFields.success) {
        toast.error('Something went wrong. Please try again.', {
          description:
            validatedFields.error.flatten().fieldErrors.file?.[0] ??
            'Invalid file',
        });
        setIsLoading(false);
        return;
      }

      toast.loading('📄 Uploading PDF...', {
        description: 'We are uploading your PDF file',
      });

      // Upload the file
      const res = await startUpload([file]);
      if (!res) {
        toast.error('Something went wrong', {
          description: 'Please use a different file',
        });
        setIsLoading(false);
        return;
      }

      toast.loading('📄 Processing PDF', {
        description: 'Hang tight! Our AI is reading through your document! ✨',
      });

      // Parse the PDF file using lang chain
      const result = await generatePdfSummary(res);
      console.log('Summary Result:', result);

      const { data = null, message = null } = result || {};

      if (data) {
        let storeResult: any;
        toast.loading('📄 Saving PDF...', {
          description: 'Hang tight! We are saving your summary! ✨',
        });

        if (data.summary) {
          storeResult = await storePdfSummaryAction({
            summary: data.summary,
            fileUrl: res[0].serverData.file.url,
            title: data.formattedFileName,
            fileName: file.name,
          });
          toast.success('✨ Summary generated!', {
            description: 'Your PDF has been successfully summarized and saved!',
          });
          formRef.current?.reset();
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error occurred while submitting form:', error);
      formRef.current?.reset();
    }
  };

  return (
    <div className='flex flex-col w-full gap-8 max-w-2xl mx-auto'>
      <UploadFormInput
        ref={formRef}
        onSubmit={handleOnSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default UploadForm;
