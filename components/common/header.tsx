import { FileText } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

import NavLink from '@/components/common/nav-link';

const Header = () => {
  return (
    <nav className='container flex items-center justify-between py-4 px-2 lg:px-8 mx-auto'>
      <div className='flex lg:flex-1'>
        <NavLink href='/' className='flex items-center gap-1 lg:gap-2 shrink-0'>
          <FileText className='size-5 lg:size-8 text-gray-900 hover:rotate-12 transform transition duration-200 ease-in-out' />
          <div>
            <span className='font-black text-xl text-gray-900'>Summar</span>
            <span className='text-rose-500 font-extrabold text-xl'>AI</span>
          </div>
        </NavLink>
      </div>
      <div className='flex lg:justify-center gap-4 lg:gap-12 lg:items-center'>
        <NavLink href='/#pricing'>Pricing</NavLink>
        <SignedIn>
          {' '}
          <NavLink href='/dashboard'>Your Summaries</NavLink>
        </SignedIn>
      </div>
      <div className='flex lg:justify-end lg:flex-1'>
        <SignedIn>
          <div className='flex gap-2 items-center'>
            <NavLink href='/upload'>Upload a PDF</NavLink>
            <div>Pro</div>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </SignedIn>

        <SignedOut>
          <NavLink href='/sign-in'>Sign In</NavLink>
        </SignedOut>
      </div>
    </nav>
  );
};
export default Header;
