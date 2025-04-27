// This file is used to add custom TypeScript declarations

// Dashboard component declarations
declare module '@/components/dashboard/DashboardTile' {
  import * as React from 'react';
  import type { DashboardTileProps } from '@/components/dashboard/types';
  const DashboardTile: React.FC<DashboardTileProps>;
  export default DashboardTile;
}

declare module '@/components/dashboard/UserInfo' {
  import * as React from 'react';
  import type { UserInfoProps } from '@/components/dashboard/types';
  const UserInfo: React.FC<UserInfoProps>;
  export default UserInfo;
}

// Hook declarations
declare module '@/components/hooks/useAuth' {
  import type { User } from '@/components/dashboard/types';
  export function useAuth(): {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
    signOut: () => Promise<void>;
  };
  export default useAuth;
}

declare module '@/components/hooks/useUserStats' {
  export function useUserStats(userId: string): {
    stats: {
      flashcardsCount: number;
      sessionsCount: number;
    };
    isLoading: boolean;
    error: Error | null;
  };
  export default useUserStats;
}

// UI component declarations
declare module '@/components/ui/button' {
  import * as React from 'react';
  export const Button: React.FC<any>;
}

declare module '@/components/ui/card' {
  import * as React from 'react';
  export const Card: React.FC<any>;
  export const CardHeader: React.FC<any>;
  export const CardTitle: React.FC<any>;
  export const CardDescription: React.FC<any>;
  export const CardContent: React.FC<any>;
  export const CardFooter: React.FC<any>;
}

declare module '@/components/ui/badge' {
  import * as React from 'react';
  export const Badge: React.FC<any>;
} 