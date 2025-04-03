import Link from 'next/link';
import { ArrowRight, PlusIcon } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import BgGradient from '@/components/common/bg-gradient';
import { Button } from '@/components/ui/button';
import SummaryCard from '@/components/summaries/summary-card';
import EmptySummaryState from '@/components/summaries/empty-summary-state';

import { getSummaries } from '@/lib/summaries';

import { getOrCreateUserUUID } from '@/app/actions/upload-actions';

const Dashboard = async () => {
  const user = await currentUser();
  const clerkUserId = user?.id;

  if (!clerkUserId) {
    return redirect('/sign-in');
  }

  // 🔥 Convert Clerk user ID to UUID
  const userId = await getOrCreateUserUUID(clerkUserId);

  const uploadLimit = 5;
  const summaries = await getSummaries(userId); // ✅ Use UUID

  return (
    <main className='min-h-screen'>
      <BgGradient className='from-emerald-200 via-teal-200 to-cyan-200' />
      <div className='container mx-auto flex flex-col gap-4'>
        <div className='px-2 py-12 sm:py-24'>
          <div className='flex gap-4 mb-4 justify-between'>
            <div className='flex flex-col gap-2'>
              <h1 className='text-4xl font-bold tracking-tight bg-linear-to-r from-gray-600 to-gray-900 bg-clip-text text-transparent'>
                Your Summaries
              </h1>
              <p className='text-gray-600'>
                Transform your PDFs into concise, actionable insights
              </p>
            </div>
            <Button
              variant={'link'}
              className='bg-linear-to-r from-rose-500 to-rose-700 group hover:no-underline hover:from-rose-600 hover:to-rose-800 hover:scale-105 transition-all duration-300'
            >
              <Link href='/upload' className='flex text-white items-center'>
                <PlusIcon className='w-5 h-5 mr-2' /> New Summary
              </Link>
            </Button>
          </div>
          <div className='mb-6'>
            <div className='bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-800'>
              <p className='text-sm'>
                You have reached the limit of {uploadLimit} uploads on the Basic
                plan.{' '}
                <Link
                  href='/#pricing'
                  className='text-rose-800 font-medium underline underline-offset-4 inline-flex items-center'
                >
                  Click here to upgrade to Pro{' '}
                  <ArrowRight className='w-3 h-3 inline-block' />
                </Link>{' '}
                for unlimited uploads.
              </p>
            </div>
          </div>
          {summaries.length === 0 ? (
            <EmptySummaryState />
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 sm:px-0 mt-2'>
              {summaries.map((summary) => (
                <SummaryCard key={summary.id} summary={summary} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
