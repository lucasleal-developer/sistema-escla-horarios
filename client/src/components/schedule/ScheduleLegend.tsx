import { type ActivityType, activityTypes } from "@shared/schema";
import { activityNames } from "@/utils/activityColors";

export function ScheduleLegend() {
  const colorMap: Record<ActivityType, string> = {
    plantao: "bg-blue-500",
    consulta: "bg-green-500",
    cirurgia: "bg-purple-500",
    reuniao: "bg-yellow-500",
    treinamento: "bg-orange-500",
    exame: "bg-indigo-500",
    folga: "bg-red-500",
    disponivel: "bg-gray-400"
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda</h3>
      <div className="flex flex-wrap gap-4">
        {activityTypes.map(activity => (
          <div key={activity} className="flex items-center">
            <div className={`h-3 w-3 rounded-full ${colorMap[activity]} mr-2`}></div>
            <span className="text-xs text-gray-700">{activityNames[activity]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
