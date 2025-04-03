import { type ActivityType } from "@shared/schema";

// Definição das cores padrão para cada tipo de atividade
interface ActivityColor {
  bg: string;
  hoverBg: string;
  text: string;
  dot: string;
}

export function getActivityColor(activity: ActivityType): ActivityColor {
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
        bg: "bg-green-100",
        hoverBg: "hover:bg-green-200",
        text: "text-green-800",
        dot: "bg-green-500"
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
    case "disponivel":
    default:
      return {
        bg: "bg-gray-100",
        hoverBg: "hover:bg-gray-200",
        text: "text-gray-800",
        dot: "bg-gray-400"
      };
  }
}

// Traduções dos nomes de atividades para PT-BR
export const activityNames: Record<ActivityType, string> = {
  "aula": "Aula",
  "reuniao": "Reunião",
  "plantao": "Plantão",
  "estudo": "Estudo",
  "evento": "Evento",
  "ferias": "Férias",
  "licenca": "Licença",
  "disponivel": "Disponível"
};

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