import { useMemo } from "react";
import { 
  type ActivityType, 
  type ScheduleTimeSlot,
  type ScheduleActivity,
  type ScheduleProfessional,
  type ScheduleTableData
} from "@shared/schema";
import { getActivityColor, getActivityName } from "@/utils/activityColors";
import { useQuery } from "@tanstack/react-query";

// Função auxiliar para converter horário em minutos (para cálculos)
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

interface ScheduleTableProps {
  data: ScheduleTableData | null;
  timeSlots: ScheduleTimeSlot[];
  isLoading: boolean;
  onCellClick: (professional: ScheduleProfessional, timeSlot: ScheduleTimeSlot, activity?: ScheduleActivity) => void;
}

export function ScheduleTable({ 
  data, 
  timeSlots, 
  isLoading, 
  onCellClick 
}: ScheduleTableProps) {
  
  // Buscar os tipos de atividades para obter as cores
  const { data: activityTypesData } = useQuery({
    queryKey: ["/api/activity-types"],
  });
  
  // Função para encontrar a atividade de um profissional em um determinado horário
  const findActivity = (professional: ScheduleProfessional, startTime: string) => {
    return professional.horarios.find(h => h.hora === startTime);
  };
  
  // Função para encontrar um tipo de atividade pelo código
  const findActivityTypeByCode = (code: string) => {
    if (!activityTypesData || !Array.isArray(activityTypesData)) return undefined;
    return activityTypesData.find((type: ActivityType) => type.code === code);
  };
  
  // Função para calcular a altura da atividade baseada em sua duração
  const calculateActivityHeight = (activity: ScheduleActivity, timeSlot: ScheduleTimeSlot) => {
    // Se a atividade começar e terminar exatamente no slot, altura padrão
    if (activity.hora === timeSlot.startTime && activity.horaFim === timeSlot.endTime) {
      return {}; // Retorna objeto vazio, usa a altura padrão
    }
    
    // Converte horários para minutos para calcular duração
    const activityStart = timeToMinutes(activity.hora);
    const activityEnd = timeToMinutes(activity.horaFim);
    const slotStart = timeToMinutes(timeSlot.startTime);
    const slotEnd = timeToMinutes(timeSlot.endTime);
    
    // Duração padrão de um slot (geralmente 30 min)
    const slotDuration = slotEnd - slotStart;
    
    // Duração total da atividade
    const activityDuration = activityEnd - activityStart;
    
    // Calcular proporção de altura
    const heightRatio = activityDuration / slotDuration;
    
    // Altura mínima garantida
    const minHeight = 70; // px
    const calculatedHeight = Math.max(minHeight, minHeight * heightRatio);
    
    return {
      height: `${calculatedHeight}px`,
      display: 'flex',
      flexDirection: 'column' as const
    };
  };
  
  // Memorizar os profissionais para evitar recálculos desnecessários
  const professionals = useMemo(() => {
    return data?.profissionais || [];
  }, [data]);
  
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-gray-500">Carregando escala...</p>
        </div>
      </div>
    );
  }
  
  if (!data || professionals.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-2">Nenhum dado disponível</p>
          <p className="text-sm text-gray-400">Selecione outro dia ou adicione profissionais à escala</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                Horário
              </th>
              {professionals.map(professional => (
                <th key={professional.id} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                      <span className="text-primary-700 font-medium">{professional.iniciais}</span>
                    </div>
                    <span>{professional.nome}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot.startTime}>
                <td className="sticky left-0 z-10 bg-white px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {timeSlot.startTime} - {timeSlot.endTime}
                </td>
                {professionals.map(professional => {
                  const activity = findActivity(professional, timeSlot.startTime);
                  
                  // Buscar o tipo de atividade pelo código
                  const activityTypeObj = activity?.atividade 
                    ? findActivityTypeByCode(activity.atividade) 
                    : undefined;
                  
                  // Se não encontrar, usamos o código "disponivel_horario" como fallback
                  const activityCode = activity?.atividade || "disponivel_horario";
                  const activityName = activityTypeObj?.name || getActivityName(activityCode);
                  
                  // Obter as cores do tipo de atividade (seja do objeto ou do código)
                  const colors = getActivityColor(activityTypeObj || activityCode);
                  
                  return (
                    <td key={`${professional.id}-${timeSlot.startTime}`} className="px-1 py-1">
                      <div 
                        className={`${colors.bg} ${colors.hoverBg} rounded p-2 cursor-pointer transition duration-150 ease-in-out min-h-[70px] relative`}
                        onClick={() => onCellClick(professional, timeSlot, activity)}
                        style={activity ? calculateActivityHeight(activity, timeSlot) : {}}
                      >
                        <div className="flex items-center mb-1">
                          <div className={`h-3 w-3 rounded-full ${colors.dot} mr-2`}></div>
                          <span className={`text-xs font-medium ${colors.text}`}>
                            {activityName}
                          </span>
                        </div>
                        {activity?.local && (
                          <p className="text-xs text-gray-600">{activity.local}</p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
