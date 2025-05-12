import * as React from "react";
import DashboardTile from "@/components/dashboard/DashboardTile";
import type { DashboardOverviewProps } from "./types";
import useUserStats from "@/components/hooks/useUserStats";

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ tiles }) => {
  const userId = "mock-user-id"; // This will come from auth context later
  const { stats, isLoading, error } = useUserStats(userId);

  // Update tiles with actual stats
  const tilesWithStats = React.useMemo(() => {
    return tiles.map((tile) => {
      if (tile.title === "Moje fiszki") {
        return {
          ...tile,
          count: isLoading ? "..." : error ? "!" : stats.flashcardsCount,
        };
      }
      if (tile.title === "Sesje powtórek") {
        return {
          ...tile,
          count: isLoading ? "..." : error ? "!" : stats.sessionsCount,
        };
      }
      return tile;
    });
  }, [tiles, stats, isLoading, error]);

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 border rounded-md bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-900 dark:text-red-400">
          <p>Wystąpił błąd podczas ładowania statystyk. Spróbuj odświeżyć stronę.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tilesWithStats.map((tile, index) => (
          <DashboardTile
            key={index}
            title={tile.title}
            description={tile.description}
            icon={tile.icon}
            linkTo={tile.linkTo}
            count={tile.count}
            color={tile.color}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;
