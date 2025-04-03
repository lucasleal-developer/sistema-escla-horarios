import { type ActivityType } from "@shared/schema";

// Definição das cores padrão para cada tipo de atividade
export interface ActivityColor {
  bg: string;
  hoverBg: string;
  text: string;
  dot: string;
}

// Mapeamento de cores hexadecimais para classes do tailwind
const colorMap: Record<string, { bg: string, hover: string, text: string, dot: string }> = {
  "#3b82f6": { bg: "bg-blue-100", hover: "hover:bg-blue-200", text: "text-blue-800", dot: "bg-blue-500" },
  "#8b5cf6": { bg: "bg-purple-100", hover: "hover:bg-purple-200", text: "text-purple-800", dot: "bg-purple-500" },
  "#22c55e": { bg: "bg-green-100", hover: "hover:bg-green-200", text: "text-green-800", dot: "bg-green-500" },
  "#eab308": { bg: "bg-yellow-100", hover: "hover:bg-yellow-200", text: "text-yellow-800", dot: "bg-yellow-500" },
  "#f97316": { bg: "bg-orange-100", hover: "hover:bg-orange-200", text: "text-orange-800", dot: "bg-orange-500" },
  "#ef4444": { bg: "bg-red-100", hover: "hover:bg-red-200", text: "text-red-800", dot: "bg-red-500" },
  "#06b6d4": { bg: "bg-cyan-100", hover: "hover:bg-cyan-200", text: "text-cyan-800", dot: "bg-cyan-500" },
  "#ec4899": { bg: "bg-pink-100", hover: "hover:bg-pink-200", text: "text-pink-800", dot: "bg-pink-500" },
  "#6366f1": { bg: "bg-indigo-100", hover: "hover:bg-indigo-200", text: "text-indigo-800", dot: "bg-indigo-500" },
  "#14b8a6": { bg: "bg-teal-100", hover: "hover:bg-teal-200", text: "text-teal-800", dot: "bg-teal-500" },
  "#f59e0b": { bg: "bg-amber-100", hover: "hover:bg-amber-200", text: "text-amber-800", dot: "bg-amber-500" },
  "#10b981": { bg: "bg-emerald-100", hover: "hover:bg-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500" },
  "#6b7280": { bg: "bg-gray-100", hover: "hover:bg-gray-200", text: "text-gray-800", dot: "bg-gray-400" },
  "#64748b": { bg: "bg-slate-100", hover: "hover:bg-slate-200", text: "text-slate-800", dot: "bg-slate-500" }
};

// Conversão de código de cor para classes Tailwind
export function getColorClasses(colorHex: string): { bg: string, hover: string, text: string, dot: string } {
  return colorMap[colorHex] || { bg: "bg-gray-100", hover: "hover:bg-gray-200", text: "text-gray-800", dot: "bg-gray-400" };
}

// Obter cores para um tipo de atividade (aceita código ou objeto completo)
// Função para mapear os códigos de atividades para suas respectivas definições de atividades
// Isso é necessário para obter as cores personalizadas do banco de dados
function getActivityTypeByCode(code: string): ActivityType | undefined {
  // Obter os tipos de atividade através de uma chamada síncrona para resolver o problema de cache
  try {
    const response = fetch('/api/activity-types', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Tenta buscar os dados mais recentes
    const activityTypes = localStorage.getItem('activityTypes');
    if (activityTypes) {
      const types = JSON.parse(activityTypes) as ActivityType[];
      return types.find(type => type.code === code);
    }
  } catch (error) {
    console.error('Erro ao buscar tipos de atividades:', error);
  }
  
  return undefined;
}

export function getActivityColor(activity: string | ActivityType): ActivityColor {
  // Caso padrão para atividade desconhecida
  const defaultColor = {
    bg: "bg-gray-100",
    hoverBg: "hover:bg-gray-200",
    text: "text-gray-800",
    dot: "bg-gray-400"
  };

  // Se for objeto, usa a cor dele
  if (activity && typeof activity === 'object' && 'color' in activity) {
    const colorClasses = getColorClasses(activity.color);
    return {
      bg: colorClasses.bg,
      hoverBg: colorClasses.hover,
      text: colorClasses.text,
      dot: colorClasses.dot
    };
  }
  
  // Se for string (código), tenta obter o tipo de atividade do banco
  if (typeof activity === 'string') {
    // Primeiro, verificar se existe uma definição personalizada no banco
    const activityType = getActivityTypeByCode(activity);
    if (activityType && activityType.color) {
      const colorClasses = getColorClasses(activityType.color);
      return {
        bg: colorClasses.bg,
        hoverBg: colorClasses.hover,
        text: colorClasses.text,
        dot: colorClasses.dot
      };
    }
    
    // Cores de fallback para compatibilidade
    switch (activity) {
      case "aula":
        return {
          bg: "bg-blue-100",
          hoverBg: "hover:bg-blue-200",
          text: "text-blue-800",
          dot: "bg-blue-500"
        };
      case "reuniao":
        return {
          bg: "bg-purple-100",
          hoverBg: "hover:bg-purple-200",
          text: "text-purple-800",
          dot: "bg-purple-500"
        };
      case "plantao":
        return {
          bg: "bg-yellow-100",  // Alterado para amarelo conforme solicitado
          hoverBg: "hover:bg-yellow-200",
          text: "text-yellow-800",
          dot: "bg-yellow-500"
        };
      case "estudo":
        return {
          bg: "bg-amber-100",
          hoverBg: "hover:bg-amber-200",
          text: "text-amber-800",
          dot: "bg-amber-500"
        };
      case "evento":
        return {
          bg: "bg-red-100",
          hoverBg: "hover:bg-red-200",
          text: "text-red-800",
          dot: "bg-red-500"
        };
      case "ferias":
        return {
          bg: "bg-cyan-100",
          hoverBg: "hover:bg-cyan-200",
          text: "text-cyan-800",
          dot: "bg-cyan-500"
        };
      case "licenca":
        return {
          bg: "bg-slate-100",
          hoverBg: "hover:bg-slate-200",
          text: "text-slate-800",
          dot: "bg-slate-500"
        };
      case "disponivel_horario":
        return {
          bg: "bg-gray-100",
          hoverBg: "hover:bg-gray-200",
          text: "text-gray-800",
          dot: "bg-gray-400"
        };
      default:
        return defaultColor;
    }
  }

  return defaultColor;
}

// Mapeamento para utilizar quando ainda não temos acesso a todos os tipos de atividades
export const activityNames: Record<string, string> = {
  "aula": "Aula",
  "reuniao": "Reunião",
  "plantao": "Plantão",
  "estudo": "Estudo",
  "evento": "Evento",
  "ferias": "Férias",
  "licenca": "Licença",
  "disponivel_horario": "Disponível"
};

// Obter nome de uma atividade
export function getActivityName(activity: string | ActivityType): string {
  if (typeof activity === 'string') {
    return activityNames[activity] || activity;
  }
  
  if (activity && typeof activity === 'object' && 'name' in activity) {
    return activity.name;
  }
  
  return "Desconhecido";
}

// Opções de cores para interface de configuração
export const colorOptions = [
  "#3b82f6", // blue-500
  "#8b5cf6", // purple-500
  "#22c55e", // green-500
  "#eab308", // yellow-500
  "#f97316", // orange-500
  "#ef4444", // red-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
  "#14b8a6", // teal-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#6b7280", // gray-500
  "#64748b", // slate-500
];