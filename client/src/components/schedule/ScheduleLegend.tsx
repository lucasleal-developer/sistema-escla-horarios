import { useQuery } from "@tanstack/react-query";
import { getActivityColor } from "@/utils/activityColors";
import { type ActivityType } from "@shared/schema";

export function ScheduleLegend() {
  // Buscar os tipos de atividades do sistema
  // O staleTime: 0 garante que os dados serão atualizados sempre que o componente for montado
  const { data: activityTypesData, isLoading } = useQuery<ActivityType[]>({
    queryKey: ['/api/activity-types'],
    staleTime: 0,
    refetchOnMount: true,
    // Ao receber os dados, salvar no localStorage para uso em outras partes da aplicação
    onSuccess: (data: ActivityType[]) => {
      if (data) {
        localStorage.setItem('activityTypes', JSON.stringify(data));
      }
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda</h3>
        <div className="animate-pulse h-6 bg-gray-200 rounded w-full max-w-md"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda</h3>
      <div className="flex flex-wrap gap-4">
        {activityTypesData && activityTypesData.map(activityType => {
          const colorClasses = getActivityColor(activityType);
          return (
            <div key={activityType.id} className="flex items-center">
              <div className={`h-3 w-3 rounded-full ${colorClasses.dot} mr-2`}></div>
              <span className="text-xs text-gray-700">{activityType.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
