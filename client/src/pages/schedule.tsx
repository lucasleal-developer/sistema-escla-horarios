import { useState, useEffect, useMemo } from "react";
// Adicionando o React para corrigir o erro de compilação
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  type WeekDay, 
  type ScheduleFormValues, 
  type ActivityType,
  type ScheduleTimeSlot,
  type ScheduleActivity,
  type ScheduleProfessional,
  type ScheduleTableData
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DaySelector } from "@/components/schedule/DaySelector";
import { ScheduleActions } from "@/components/schedule/ScheduleActions";
import { ScheduleTable, type SelectedCell } from "@/components/schedule/ScheduleTable";
import { ScheduleLegend } from "@/components/schedule/ScheduleLegend";
import { ScheduleStats } from "@/components/schedule/ScheduleStats";
import { EditScheduleModal } from "@/components/schedule/EditScheduleModal";

// Usando interfaces compartilhadas definidas no schema

export default function Schedule() {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState<WeekDay>("segunda");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isNewActivity, setIsNewActivity] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<ScheduleProfessional | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<ScheduleTimeSlot | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ScheduleActivity | undefined>(undefined);
  const [selectedCells, setSelectedCells] = useState<SelectedCell[]>([]);
  
  // Debug para verificar o que está sendo selecionado
  useEffect(() => {
    if (selectedActivity) {
      console.log("Atividade selecionada para edição:", selectedActivity);
    }
  }, [selectedActivity]);
  
  // Buscar horários disponíveis com API
  const { data: timeSlotsData, isLoading: isLoadingTimeSlots } = useQuery<ScheduleTimeSlot[]>({
    queryKey: ['/api/time-slots'],
    queryFn: ({ queryKey }) => fetch(queryKey[0] as string).then(res => res.json()),
  });
  
  // Horários padrão caso ainda não tenha carregado
  const defaultTimeSlots: ScheduleTimeSlot[] = [
    { startTime: "08:00", endTime: "09:00" },
    { startTime: "09:00", endTime: "10:00" },
    { startTime: "10:00", endTime: "11:00" },
    { startTime: "11:00", endTime: "12:00" },
    { startTime: "13:00", endTime: "14:00" },
    { startTime: "14:00", endTime: "15:00" },
    { startTime: "15:00", endTime: "16:00" },
    { startTime: "16:00", endTime: "17:00" }
  ];
  
  const timeSlots: ScheduleTimeSlot[] = timeSlotsData || defaultTimeSlots;
  
  // Query para buscar dados da escala
  const { data, isLoading, isError } = useQuery<ScheduleTableData>({
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
  const handleCellClick = (professional: ScheduleProfessional, timeSlot: ScheduleTimeSlot, activity?: ScheduleActivity) => {
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
    
    // Se houver mais de uma célula selecionada, aplicar a mesma atividade a todas elas
    if (selectedCells && selectedCells.length > 1) {
      // Criar promessas para todas as requisições
      const savePromises = selectedCells.map(cell => {
        // Cria um novo objeto de formulário para cada célula, mantendo os valores do formulário original
        // mas ajustando o profissional e o horário para a célula específica
        const cellFormData: ScheduleFormValues = {
          ...formData,
          professionalId: cell.professional.id,
          startTime: cell.timeSlot.startTime,
          endTime: cell.timeSlot.endTime
        };
        
        // Retorna a promessa da requisição
        return apiRequest("POST", "/api/schedules", cellFormData);
      });
      
      // Executa todas as promessas
      Promise.all(savePromises)
        .then(() => {
          toast({
            title: "Atividades em lote criadas",
            description: `Foram criadas ${selectedCells.length} atividades com sucesso.`,
            variant: "default",
          });
          
          // Atualiza a lista de escalas
          queryClient.invalidateQueries({ queryKey: [`/api/schedules/${selectedDay}`] });
          closeModal();
        })
        .catch(error => {
          toast({
            title: "Erro",
            description: `Falha ao criar atividades em lote: ${error.message}`,
            variant: "destructive",
          });
        });
    } else {
      // Comportamento padrão para uma única célula
      saveSchedule(formData);
    }
  };
  
  // Função para filtrar por profissional
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implementação da busca seria feita aqui
    // Como é apenas um filtro de UI, podemos implementar posteriormente
  };
  
  // Estatísticas agora são calculadas dinamicamente no componente ScheduleStats
  
  // Formatando a data da última atualização
  const lastUpdate = "Hoje, " + format(new Date(), "HH:mm");
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
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
        
        {/* Tabela de horários - Com mais espaço para o cabeçalho fixo */}
        <div className="mt-2">
          <ScheduleTable 
            data={data || null}
            timeSlots={timeSlots}
            isLoading={isLoading}
            onCellClick={handleCellClick}
            onSelectedCellsChange={setSelectedCells}
          />
        </div>
        
        {/* Legenda */}
        <ScheduleLegend />
        
        {/* Estatísticas baseadas em dados reais */}
        <ScheduleStats />
        
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
            selectedCells={selectedCells}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
