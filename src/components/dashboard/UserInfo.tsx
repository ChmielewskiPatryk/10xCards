import * as React from 'react';
import { Button } from "@/components/ui/button";
import type { UserInfoProps } from './types';

const UserInfo: React.FC<UserInfoProps> = ({ user, onLogout }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex flex-col items-end">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {user.name || user.email}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {user.name ? user.email : ''}
        </div>
      </div>
      <div 
        className="relative w-9 h-9 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-gray-800"
        title={user.name || user.email}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name || 'User'} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-semibold text-white">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onLogout}
        className="text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-400 dark:hover:border-red-900 transition-colors"
      >
        Wyloguj
      </Button>
    </div>
  );
};

export default UserInfo; 