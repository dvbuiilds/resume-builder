'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { FaUser } from 'react-icons/fa';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleAuthClick = () => {
    router.push('/auth');
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const renderUserImgOrInitials = () => {
    if (session?.user?.image) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <Image
          src={session.user.image}
          alt={session.user.name || 'User'}
          className="h-8 w-8 rounded-full object-cover"
          width={32}
          height={32}
        />
      );
    }

    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
        <FaUser className="h-4 w-4" />
      </span>
    );
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-3 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
            RB
          </span>
          <span className="text-xl font-semibold text-gray-900">
            Resume Builder
          </span>
        </button>
        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {renderUserImgOrInitials()}
                <span className="hidden sm:inline-block">
                  {session.user?.name || session.user?.email || 'User'}
                </span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showUserMenu ? (
                <div className="absolute right-0 mt-2 min-w-[16rem] max-w-sm rounded-md border border-gray-200 bg-white py-2 shadow-lg z-50">
                  <div className="border-b border-gray-200 px-4 pb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {session.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 break-all">
                      {session.user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              onClick={handleAuthClick}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Login / Signup
            </button>
          )}
        </div>
      </div>
      {showUserMenu ? (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      ) : null}
    </nav>
  );
};
