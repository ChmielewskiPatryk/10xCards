import * as React from 'react';
import UserInfo from '@/components/dashboard/UserInfo';
import type { DashboardHeaderProps } from './types';
import useAuth from '@/components/hooks/useAuth';

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const { signOut } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
  };
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <a href="/" className="flex items-center group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-700 shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-xl font-bold text-white">10x</span>
            </div>
            <h1 className="ml-2 text-2xl font-semibold text-gray-800 dark:text-white">
              Cards
              <span className="ml-1 text-xs align-top bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded">
                Beta
              </span>
            </h1>
          </a>
          <div className="flex items-center">
            <UserInfo user={user} onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 