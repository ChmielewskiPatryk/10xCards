import type { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface DashboardTileProps {
  title: string;
  description: string;
  icon: ReactNode | string;
  linkTo: string;
  count?: number | string;
  color?: string;
}

export interface DashboardOverviewProps {
  tiles: DashboardTileProps[];
}

export interface UserInfoProps {
  user: User;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export interface DashboardHeaderProps {
  user: User;
  activePath?: string;
} 