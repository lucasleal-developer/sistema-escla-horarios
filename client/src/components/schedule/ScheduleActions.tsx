import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";

interface ScheduleActionsProps {
  selectedDay: string;
  lastUpdate?: string;
  onSearch: (query: string) => void;
  onOpenNewModal: () => void;
}

export function ScheduleActions({ 
  selectedDay, 
  lastUpdate, 
  onSearch, 
  onOpenNewModal 
}: ScheduleActionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Função para formatar o dia da semana
  const formatDayName = (day: string): string => {
    const dayNames: Record<string, string> = {
      "segunda": "Segunda-feira",
      "terca": "Terça-feira",
      "quarta": "Quarta-feira",
      "quinta": "Quinta-feira",
      "sexta": "Sexta-feira",
      "sabado": "Sábado",
      "domingo": "Domingo"
    };
    
    return dayNames[day] || day;
  };
  
  const handleSearch = () => {
    onSearch(searchQuery);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <h2 className="text-xl font-semibold">Escala: {formatDayName(selectedDay)}</h2>
        {lastUpdate && (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md">
            Atualizado: {lastUpdate}
          </span>
        )}
      </div>
      <div className="flex space-x-2">
        <div className="relative">
          <Input
            type="text"
            className="pl-8"
            placeholder="Buscar profissional..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Search className="h-4 w-4 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
        <Button variant="outline" className="inline-flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
        <Button onClick={onOpenNewModal} className="inline-flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Novo
        </Button>
      </div>
    </div>
  );
}
