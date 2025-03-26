'use client';

import { z } from 'zod';
import UploadFormInput from '@/components/upload/upload-form-input';
import { useUploadThing } from '@/utils/uploadthing';

import { toast } from 'sonner';

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
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file');

    // Ensure the retrieved file is actually a `File` object
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
      return;
    }

    toast.loading('📄 Processing PDF', {
      description: 'Hang tight! Our AI is reading through your document! ✨',
    });
  };

  return (
    <div className='flex flex-col w-full gap-8 max-w-2xl mx-auto'>
      <UploadFormInput onSubmit={handleOnSubmit} />
    </div>
  );
};

export default UploadForm;
