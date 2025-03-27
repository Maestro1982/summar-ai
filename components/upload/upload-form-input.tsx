'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

interface UploadFormInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export const UploadFormInput = forwardRef<
  HTMLFormElement,
  UploadFormInputProps
>(({ onSubmit, isLoading }, ref) => {
  return (
    <form className='flex flex-col gap-6' onSubmit={onSubmit} ref={ref}>
      <div className='flex items-center justify-end gap-1.5'>
        <Input
          type='file'
          id='file'
          name='file'
          accept='application/pdf'
          required
          className={cn(isLoading && 'opacity-50 cursor-not-allowed')}
          disabled={isLoading}
        />
        <Button disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              Processing...
            </>
          ) : (
            'Upload your PDF'
          )}
        </Button>
      </div>
    </form>
  );
});

UploadFormInput.displayName = 'UploadFormInput';

export default UploadFormInput;
