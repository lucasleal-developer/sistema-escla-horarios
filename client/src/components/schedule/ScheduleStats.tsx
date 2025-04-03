import { Card, CardContent } from "@/components/ui/card";

interface ScheduleStats {
  totalConsultas: number;
  cirurgias: number;
  horasPlantao: number;
  reunioes: number;
}

interface ScheduleStatsProps {
  stats: ScheduleStats;
}

export function ScheduleStats({ stats }: ScheduleStatsProps) {
  const { totalConsultas, cirurgias, horasPlantao, reunioes } = stats;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Estatísticas da Semana</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500">Total de Consultas</p>
            <p className="text-lg font-semibold">{totalConsultas}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500">Cirurgias</p>
            <p className="text-lg font-semibold">{cirurgias}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500">Horas de Plantão</p>
            <p className="text-lg font-semibold">{horasPlantao}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500">Reuniões</p>
            <p className="text-lg font-semibold">{reunioes}</p>
          </div>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-4 col-span-1 md:col-span-2">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Distribuição de Atividades</h3>
        <div className="h-48 bg-gray-50 rounded flex items-center justify-center">
          <p className="text-sm text-gray-500">Gráfico de distribuição</p>
        </div>
      </div>
    </div>
  );
}
