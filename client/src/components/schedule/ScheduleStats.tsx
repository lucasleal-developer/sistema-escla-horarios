import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActivityColor } from "@/utils/activityColors";
import { type Schedule, type ActivityType, weekdays } from "@shared/schema";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Interface para estatísticas dinâmicas baseadas nas atividades existentes
interface ActivityCount {
  name: string;
  code: string;
  count: number;
  color: string;
}

export function ScheduleStats() {
  const [activityStats, setActivityStats] = useState<ActivityCount[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  
  // Buscar tipos de atividades
  const { data: activityTypes } = useQuery<ActivityType[]>({
    queryKey: ['/api/activity-types'],
  });
  
  // Buscar dados de agendamentos para todos os dias da semana
  const scheduleQueries = weekdays.map(day => {
    return useQuery<any>({
      queryKey: [`/api/schedules/${day}`],
      // Desabilitar a refetch automática para não sobrecarregar o servidor
      refetchOnWindowFocus: false
    });
  });
  
  // Todos os dados de agendamento estão carregados?
  const isLoading = scheduleQueries.some(query => query.isLoading);
  
  // Processo de calcular estatísticas baseadas nos dados reais
  useEffect(() => {
    if (isLoading || !activityTypes) return;
    
    // Criar um map para contar as atividades por código
    const activityCounts = new Map<string, number>();
    
    // Inicializar o contador com todas as atividades disponíveis
    activityTypes.forEach(type => {
      activityCounts.set(type.code, 0);
    });
    
    // Contagem de atividades em todos os dias
    let total = 0;
    
    scheduleQueries.forEach(query => {
      if (query.data && query.data.profissionais) {
        query.data.profissionais.forEach((prof: any) => {
          if (prof.horarios && Array.isArray(prof.horarios)) {
            prof.horarios.forEach((horario: any) => {
              const activityCode = horario.atividade;
              if (activityCode) {
                const currentCount = activityCounts.get(activityCode) || 0;
                activityCounts.set(activityCode, currentCount + 1);
                total++;
              }
            });
          }
        });
      }
    });
    
    // Converter para array para renderização
    const statsArray: ActivityCount[] = [];
    
    activityTypes.forEach(type => {
      const count = activityCounts.get(type.code) || 0;
      if (count > 0) { // Só mostrar atividades que foram usadas
        const colorObj = getActivityColor(type);
        statsArray.push({
          name: type.name,
          code: type.code,
          count,
          // Extrair a cor do hex para usar no gráfico
          color: type.color || '#6366F1'
        });
      }
    });
    
    setActivityStats(statsArray);
    setTotalActivities(total);
  }, [scheduleQueries, activityTypes, isLoading]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Estatísticas da Semana</h3>
          <div className="animate-pulse flex space-y-3 flex-col">
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 col-span-1 md:col-span-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Distribuição de Atividades</h3>
          <div className="animate-pulse h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Criar pares de estatísticas para mostrar no grid
  const topStats = activityStats
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Estatísticas da Semana</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500">Total de Atividades</p>
            <p className="text-lg font-semibold">{totalActivities}</p>
          </div>
          
          {topStats.map((stat, index) => (
            <div key={stat.code} className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">{stat.name}</p>
              <p className="text-lg font-semibold">{stat.count}</p>
            </div>
          ))}
          
          {/* Preencher com células vazias se não tiver 4 atividades */}
          {Array.from({ length: Math.max(0, 3 - topStats.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-gray-50 p-3 rounded opacity-0">
              <p className="text-xs text-gray-500">-</p>
              <p className="text-lg font-semibold">0</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-4 col-span-1 md:col-span-2">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Distribuição de Atividades</h3>
        {activityStats.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="name"
                >
                  {activityStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} atividades`, name]}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '4px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 bg-gray-50 rounded flex items-center justify-center">
            <p className="text-sm text-gray-500">Nenhuma atividade registrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
