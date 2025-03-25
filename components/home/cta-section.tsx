import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

const CtaSection = () => {
  return (
    <section className='bg-gray-50 py-12'>
      <div className='py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
          <div className='space-y-2'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
              Ready to Save Hours of Time?
            </h2>
            <p className='mx-auto max-w-2xl text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
              Transform long documents into clear, actionable insights with our
              AI-powered summarizer.
            </p>
          </div>
          <div className='flex flex-col gap-2 min-[400px]:flex-row justify-center'>
            <div>
              <Button
                variant={'link'}
                className='flex w-full min-[400px]:w-auto text-white bg-linear-to-r from-slate-900 to-gray-500 hover:from-gray-500 hover:to-slate-900 hover:no-underline font-bold shadow-lg transition-all duration-300'
                size={'lg'}
              >
                <Link
                  href='/#pricing'
                  className='flex items-center justify-center'
                >
                  Get Started
                  <ArrowRight className='ml-2 h-4 w-4 animate-pulse' />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default CtaSection;
