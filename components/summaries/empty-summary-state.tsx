import Link from 'next/link';
import { FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';

const EmptySummaryState = () => {
  return (
    <div className='text-center py-12'>
      <div className='flex flex-col items-center gap-4'>
        <FileText className='w-16 h-16 text-gray-400' />
        <h2 className='text-xl font-semibold text-gray-600'>
          No summaries yet
        </h2>
        <p className='max-w-md text-gray-500'>
          Upload your first PDF to get started with AI-Powered summaries.
        </p>
        <Link href='/upload'>
          <Button
            variant={'link'}
            className='mt-4 text-white hover:no-underline bg-linear-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800'
          >
            Create Your First Summary
          </Button>
        </Link>
      </div>
    </div>
  );
};
export default EmptySummaryState;
