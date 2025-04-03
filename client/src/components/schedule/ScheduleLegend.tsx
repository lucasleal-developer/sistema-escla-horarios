import { activityTypes } from "@shared/schema";
import { getActivityColor, getActivityName } from "@/utils/activityColors";

export function ScheduleLegend() {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda</h3>
      <div className="flex flex-wrap gap-4">
        {activityTypes.map(activityCode => {
          const colorClasses = getActivityColor(activityCode);
          return (
            <div key={activityCode} className="flex items-center">
              <div className={`h-3 w-3 rounded-full ${colorClasses.dot} mr-2`}></div>
              <span className="text-xs text-gray-700">{getActivityName(activityCode)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
