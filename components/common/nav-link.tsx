'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ href, children, className }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={cn(
        'text-sm transition-colors duration-200 text-gray-600 hover:text-rose-500',
        className,
        isActive && 'text-rose-500'
      )}
    >
      {children}
    </Link>
  );
};
export default NavLink;
