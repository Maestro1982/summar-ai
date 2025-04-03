import Link from 'next/link';
import { ChevronLeft, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SummaryHeader = ({ title }: { title: string }) => {
  return (
    <div className='flex justify-between gap-4 mb-4'>
      <div className='space-y-6'>
        <div className=''>
          <Badge
            variant={'secondary'}
            className='relative px-4 py-1.5 text-sm font-medium bg-white/80 backdrop-blur-xs rounded-full hover:bg-white/90 transition-all duration-200 shadow-xs hover:shadow-md'
          >
            <Sparkles className='w-4 h-4 mr-1.5 text-rose-500' />
            AI Summary
          </Badge>
        </div>
      </div>
      <div>
        <Link href='/dashboard'>
          <Button
            variant={'link'}
            size={'sm'}
            className='group flex items-center gap-1 sm:gap-2 hover:bg-white/80 backdrop-blur-xs rounded-full transition-all duration-200 shadow-xs hover:shadow-md border border-rose-100/30 bg-rose-100 px-2 sm:px-3 hover:no-underline'
          >
            <ChevronLeft className='h-3 w-3 sm:h-4 sm:w-4 text-rose-500 transition-transform group-hover:translate-x-0.5' />
            <span className='text-xs sm:text-sm text-muted-foreground font-medium'>
              Back <span className='hidden sm:inline'>to Dashboard</span>
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
export default SummaryHeader;
