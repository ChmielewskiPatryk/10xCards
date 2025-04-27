import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faWandMagicSparkles, faUser, faGear, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import type { DashboardTileProps } from './types';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const getIcon = (iconName: string): IconDefinition => {
  switch (iconName) {
    case 'Clock':
      return faClock;
    case 'MagicWand':
      return faWandMagicSparkles;
    case 'Settings':
      return faGear;
    case 'Cards':
      return faLayerGroup;
    default:
      return faUser;
  }
};

const DashboardTile: React.FC<DashboardTileProps> = ({
  title,
  description,
  icon,
  linkTo,
  count,
  color = 'bg-gray-100 dark:bg-gray-800'
}) => {
  return (
    <a 
      href={linkTo} 
      className="block transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
    >
      <Card className={`h-full overflow-hidden hover:shadow-lg transition-shadow ${color} border-0`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 text-2xl text-primary shadow-sm">
              {typeof icon === 'string' ? (
                <FontAwesomeIcon icon={getIcon(icon)} />
              ) : (
                icon
              )}
            </div>
            {count !== undefined && (
              <Badge variant="outline" className="ml-auto font-medium">
                {count}
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl mt-4">{title}</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Additional content can be added here */}
        </CardContent>
        <CardFooter className="pt-0 text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center">
          <span>Kliknij, aby przejść</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </CardFooter>
      </Card>
    </a>
  );
};

export default DashboardTile; 