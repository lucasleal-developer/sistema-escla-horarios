import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActivityColor } from "@/utils/activityColors";
import { type ActivityType, weekdays } from "@shared/schema";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line 
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const { data: activityTypes, isLoading: isActivityTypesLoading } = useQuery<ActivityType[]>({
    queryKey: ['/api/activity-types'],
    staleTime: 60000, // 1 minuto
  });
  
  // Buscar dados para segunda-feira
  const { data: segunda, isLoading: isSegundaLoading } = useQuery<any>({
    queryKey: ['/api/schedules/segunda'],
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minuto
  });
  
  // Buscar dados para terça-feira
  const { data: terca, isLoading: isTercaLoading } = useQuery<any>({
    queryKey: ['/api/schedules/terca'],
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minuto
  });
  
  // Buscar dados para quarta-feira
  const { data: quarta, isLoading: isQuartaLoading } = useQuery<any>({
    queryKey: ['/api/schedules/quarta'],
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minuto
  });
  
  // Buscar dados para quinta-feira
  const { data: quinta, isLoading: isQuintaLoading } = useQuery<any>({
    queryKey: ['/api/schedules/quinta'],
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minuto
  });
  
  // Buscar dados para sexta-feira
  const { data: sexta, isLoading: isSextaLoading } = useQuery<any>({
    queryKey: ['/api/schedules/sexta'],
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minuto
  });
  
  // Verificar se todos os dados estão carregados
  const isLoading = 
    isActivityTypesLoading || 
    isSegundaLoading || 
    isTercaLoading || 
    isQuartaLoading || 
    isQuintaLoading || 
    isSextaLoading;
  
  // Gerar as estatísticas a partir dos dados
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
    
    // Função para processar dados de um dia
    const processDay = (dayData: any) => {
      if (dayData && dayData.profissionais) {
        dayData.profissionais.forEach((prof: any) => {
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
    };
    
    // Processar cada dia da semana
    processDay(segunda);
    processDay(terca);
    processDay(quarta);
    processDay(quinta);
    processDay(sexta);
    
    // Converter para array para renderização
    const statsArray: ActivityCount[] = [];
    
    activityTypes.forEach(type => {
      const count = activityCounts.get(type.code) || 0;
      if (count > 0) { // Só mostrar atividades que foram usadas
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
  }, [
    activityTypes,
    isLoading,
    segunda,
    terca, 
    quarta,
    quinta,
    sexta
  ]);
  
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-700">Distribuição de Atividades</h3>
        </div>
        
        {activityStats.length > 0 ? (
          <div className="h-60">
            <Tabs defaultValue="columns" className="w-full">
              <TabsList className="grid grid-cols-3 h-8 mb-4">
                <TabsTrigger value="columns" className="text-xs">Colunas</TabsTrigger>
                <TabsTrigger value="pie" className="text-xs">Pizza</TabsTrigger>
                <TabsTrigger value="line" className="text-xs">Linha</TabsTrigger>
              </TabsList>
              
              {/* Gráfico de Colunas */}
              <TabsContent value="columns" className="mt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityStats}
                    margin={{
                      top: 5, right: 5, left: 5, bottom: 35,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`${value} atividades`, "Total"]}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '4px' }}
                    />
                    <Bar dataKey="count" name="Quantidade">
                      {activityStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              
              {/* Gráfico de Pizza */}
              <TabsContent value="pie" className="mt-0">
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
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>
              
              {/* Gráfico de Linha */}
              <TabsContent value="line" className="mt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={activityStats}
                    margin={{
                      top: 5, right: 5, left: 5, bottom: 35,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`${value} atividades`, "Total"]}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
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
