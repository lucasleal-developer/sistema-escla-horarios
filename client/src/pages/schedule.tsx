import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  type WeekDay, 
  type ScheduleFormValues, 
  type ActivityType 
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DaySelector } from "@/components/schedule/DaySelector";
import { ScheduleActions } from "@/components/schedule/ScheduleActions";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { ScheduleLegend } from "@/components/schedule/ScheduleLegend";
import { ScheduleStats } from "@/components/schedule/ScheduleStats";
import { EditScheduleModal } from "@/components/schedule/EditScheduleModal";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface Activity {
  id: number;
  hora: string;
  horaFim: string;
  atividade: ActivityType;
  local: string;
  observacoes: string;
}

interface Professional {
  id: number;
  nome: string;
  iniciais: string;
  horarios: Activity[];
}

interface ScheduleData {
  dia: string;
  profissionais: Professional[];
}

export default function Schedule() {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState<WeekDay>("segunda");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isNewActivity, setIsNewActivity] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  
  // Debug para verificar o que está sendo selecionado
  useEffect(() => {
    if (selectedActivity) {
      console.log("Atividade selecionada para edição:", selectedActivity);
    }
  }, [selectedActivity]);
  
  // Buscar horários disponíveis
  const timeSlots: TimeSlot[] = [
    { startTime: "08:00", endTime: "09:00" },
    { startTime: "09:00", endTime: "10:00" },
    { startTime: "10:00", endTime: "11:00" },
    { startTime: "11:00", endTime: "12:00" },
    { startTime: "13:00", endTime: "14:00" },
    { startTime: "14:00", endTime: "15:00" },
    { startTime: "15:00", endTime: "16:00" },
    { startTime: "16:00", endTime: "17:00" }
  ];
  
  // Query para buscar dados da escala
  const { data, isLoading, isError } = useQuery<ScheduleData>({
    queryKey: [`/api/schedules/${selectedDay}`],
    queryFn: ({ queryKey }) => fetch(queryKey[0] as string).then(res => res.json()),
  });
  
  // Mutação para salvar/atualizar atividade
  const { mutate: saveSchedule, isPending: isSaving } = useMutation({
    mutationFn: async (formData: ScheduleFormValues) => {
      console.log("Mutação sendo executada com dados:", formData);
      console.log("Estado atual: isNewActivity =", isNewActivity, "selectedActivity =", selectedActivity);
      
      // Se já existe uma atividade, atualiza, senão cria uma nova
      if (selectedActivity?.id && !isNewActivity) {
        console.log("Atualizando atividade existente ID:", selectedActivity.id);
        return apiRequest("PUT", `/api/schedules/${selectedActivity.id}`, formData);
      } else {
        console.log("Criando nova atividade");
        return apiRequest("POST", "/api/schedules", formData);
      }
    },
    onSuccess: (data) => {
      console.log("Sucesso na requisição:", data);
      
      toast({
        title: isNewActivity ? "Atividade criada" : "Atividade atualizada",
        description: "A escala foi atualizada com sucesso.",
        variant: "default",
      });
      
      // Atualiza a lista de escalas
      queryClient.invalidateQueries({ queryKey: [`/api/schedules/${selectedDay}`] });
      
      // Força recarregar os dados
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: [`/api/schedules/${selectedDay}`] });
      }, 500);
      
      // Fecha o modal
      closeModal();
    },
    onError: (error) => {
      console.error("Erro na requisição:", error);
      
      toast({
        title: "Erro",
        description: `Falha ao salvar: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Efeito para lidar com erros na busca de dados
  useEffect(() => {
    if (isError) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a escala. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }, [isError, toast]);
  
  // Função para abrir o modal de edição
  const handleCellClick = (professional: Professional, timeSlot: TimeSlot, activity?: Activity) => {
    setSelectedProfessional(professional);
    setSelectedTimeSlot(timeSlot);
    setSelectedActivity(activity);
    setIsNewActivity(!activity);
    setModalOpen(true);
  };
  
  // Função para abrir o modal de nova atividade
  const handleNewActivity = () => {
    // Seleciona o primeiro profissional e horário por padrão
    if (data?.profissionais && data.profissionais.length > 0) {
      setSelectedProfessional(data.profissionais[0]);
      setSelectedTimeSlot(timeSlots[0]);
      setSelectedActivity(undefined);
      setIsNewActivity(true);
      setModalOpen(true);
    } else {
      toast({
        title: "Erro",
        description: "Não há profissionais disponíveis para criar uma nova atividade.",
        variant: "destructive",
      });
    }
  };
  
  // Função para fechar o modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedProfessional(null);
    setSelectedTimeSlot(null);
    setSelectedActivity(undefined);
  };
  
  // Função para salvar a atividade
  const handleSaveActivity = (formData: ScheduleFormValues) => {
    console.log("Salvando atividade:", formData);
    saveSchedule(formData);
  };
  
  // Função para filtrar por profissional
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implementação da busca seria feita aqui
    // Como é apenas um filtro de UI, podemos implementar posteriormente
  };
  
  // Dados para estatísticas (estáticos para demonstração)
  const mockStats = {
    totalConsultas: 87,
    cirurgias: 12,
    horasPlantao: 54,
    reunioes: 8
  };
  
  // Formatando a data da última atualização
  const lastUpdate = "Hoje, " + format(new Date(), "HH:mm");
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Seletor de dias */}
        <DaySelector 
          selectedDay={selectedDay} 
          onSelectDay={(day) => setSelectedDay(day as WeekDay)} 
        />
        
        {/* Ações da escala */}
        <ScheduleActions 
          selectedDay={selectedDay}
          lastUpdate={lastUpdate}
          onSearch={handleSearch}
          onOpenNewModal={handleNewActivity}
        />
        
        {/* Tabela de horários */}
        <ScheduleTable 
          data={data || null}
          timeSlots={timeSlots}
          isLoading={isLoading}
          onCellClick={handleCellClick}
        />
        
        {/* Legenda */}
        <ScheduleLegend />
        
        {/* Estatísticas */}
        <ScheduleStats stats={mockStats} />
        
        {/* Modal de edição */}
        {modalOpen && selectedProfessional && selectedTimeSlot && (
          <EditScheduleModal 
            isOpen={modalOpen}
            onClose={closeModal}
            onSave={handleSaveActivity}
            professional={selectedProfessional}
            timeSlot={selectedTimeSlot}
            currentActivity={selectedActivity ? {
              id: selectedActivity.id,
              atividade: selectedActivity.atividade,
              local: selectedActivity.local,
              observacoes: selectedActivity.observacoes
            } : undefined}
            weekday={selectedDay}
            isNew={isNewActivity}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
