import { type ActivityType } from "@shared/schema";

interface ActivityColor {
  bg: string;
  hoverBg: string;
  text: string;
  dot: string;
}

const activityColors: Record<ActivityType, ActivityColor> = {
  plantao: {
    bg: "bg-blue-50",
    hoverBg: "hover:bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500"
  },
  consulta: {
    bg: "bg-green-50",
    hoverBg: "hover:bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500"
  },
  cirurgia: {
    bg: "bg-purple-50",
    hoverBg: "hover:bg-purple-100",
    text: "text-purple-800",
    dot: "bg-purple-500"
  },
  reuniao: {
    bg: "bg-yellow-50",
    hoverBg: "hover:bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500"
  },
  treinamento: {
    bg: "bg-orange-50",
    hoverBg: "hover:bg-orange-100",
    text: "text-orange-800",
    dot: "bg-orange-500"
  },
  exame: {
    bg: "bg-indigo-50",
    hoverBg: "hover:bg-indigo-100",
    text: "text-indigo-800",
    dot: "bg-indigo-500"
  },
  folga: {
    bg: "bg-red-50",
    hoverBg: "hover:bg-red-100",
    text: "text-red-800",
    dot: "bg-red-500"
  },
  disponivel: {
    bg: "bg-gray-50",
    hoverBg: "hover:bg-gray-100",
    text: "text-gray-800",
    dot: "bg-gray-400"
  }
};

export function getActivityColor(activity: ActivityType): ActivityColor {
  return activityColors[activity];
}

export const activityNames: Record<ActivityType, string> = {
  plantao: "Plantão",
  consulta: "Consultas",
  cirurgia: "Cirurgia",
  reuniao: "Reunião",
  treinamento: "Treinamento",
  exame: "Exames",
  folga: "Folga",
  disponivel: "Disponível"
};

export default activityColors;
