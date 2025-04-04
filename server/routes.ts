import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProfessionalSchema, 
  insertTimeSlotSchema, 
  insertScheduleSchema,
  weekdays,
  type WeekDay
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // Middleware para tratamento de erros
  const asyncHandler = (fn: Function) => (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch(error => {
      console.error("API Error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Erro interno do servidor",
          error: error.message
        });
      }
    });
  };
  
  // API para profissionais
  apiRouter.get("/professionals", asyncHandler(async (req: Request, res: Response) => {
    const professionals = await storage.getAllProfessionals();
    res.json(professionals);
  }));
  
  apiRouter.post("/professionals", asyncHandler(async (req: Request, res: Response) => {
    const data = insertProfessionalSchema.parse(req.body);
    const professional = await storage.createProfessional(data);
    res.status(201).json(professional);
  }));
  
  apiRouter.put("/professionals/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = insertProfessionalSchema.partial().parse(req.body);
    const professional = await storage.updateProfessional(id, data);
    
    if (!professional) {
      return res.status(404).json({ message: "Profissional não encontrado" });
    }
    
    res.json(professional);
  }));
  
  apiRouter.delete("/professionals/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const success = await storage.deleteProfessional(id);
    
    if (!success) {
      return res.status(404).json({ message: "Profissional não encontrado" });
    }
    
    res.status(204).end();
  }));
  
  // API para tipos de atividades
  apiRouter.get("/activity-types", asyncHandler(async (req: Request, res: Response) => {
    const activityTypes = await storage.getAllActivityTypes();
    res.json(activityTypes);
  }));
  
  apiRouter.post("/activity-types", asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const activityType = await storage.createActivityType(data);
    res.status(201).json(activityType);
  }));
  
  apiRouter.put("/activity-types/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = req.body;
    const activityType = await storage.updateActivityType(id, data);
    
    if (!activityType) {
      return res.status(404).json({ message: "Tipo de atividade não encontrado" });
    }
    
    res.json(activityType);
  }));
  
  apiRouter.delete("/activity-types/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const success = await storage.deleteActivityType(id);
    
    if (!success) {
      return res.status(404).json({ message: "Tipo de atividade não encontrado" });
    }
    
    res.status(204).end();
  }));
  
  // API para horários
  apiRouter.get("/time-slots", asyncHandler(async (req: Request, res: Response) => {
    const timeSlots = await storage.getAllTimeSlots();
    res.json(timeSlots);
  }));
  
  apiRouter.post("/time-slots", asyncHandler(async (req: Request, res: Response) => {
    const data = insertTimeSlotSchema.parse(req.body);
    const timeSlot = await storage.createTimeSlot(data);
    res.status(201).json(timeSlot);
  }));
  
  apiRouter.delete("/time-slots/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const success = await storage.deleteTimeSlot(id);
    
    if (!success) {
      return res.status(404).json({ message: "Horário não encontrado" });
    }
    
    res.status(204).end();
  }));
  
  // API para escalas
  apiRouter.get("/schedules/:weekday", asyncHandler(async (req: Request, res: Response) => {
    const weekday = req.params.weekday as WeekDay;
    console.log(`GET /schedules/${weekday} - Buscando horários`);
    
    if (!weekdays.includes(weekday as any)) {
      return res.status(400).json({ message: "Dia da semana inválido" });
    }
    
    const schedules = await storage.getSchedulesByDay(weekday);
    console.log("Escalas encontradas:", schedules.length);
    
    const professionals = await storage.getAllProfessionals();
    
    const formattedData = {
      dia: weekday,
      profissionais: professionals.map(p => {
        const profSchedules = schedules.filter(s => s.professionalId === p.id);
        
        return {
          id: p.id,
          nome: p.name,
          iniciais: p.initials,
          horarios: profSchedules.map(s => ({
            id: s.id,
            hora: s.startTime,
            horaFim: s.endTime,
            atividade: s.activityCode,
            local: s.location || "",
            observacoes: s.notes || ""
          }))
        };
      })
    };
    
    res.json(formattedData);
  }));
  
  apiRouter.get("/schedules", asyncHandler(async (req: Request, res: Response) => {
    const professionalId = req.query.professionalId ? Number(req.query.professionalId) : undefined;
    
    if (!professionalId) {
      return res.status(400).json({ message: "ID do profissional é obrigatório" });
    }
    
    const schedules = await storage.getSchedulesByProfessional(professionalId);
    res.json(schedules);
  }));
  
  apiRouter.post("/schedules", asyncHandler(async (req: Request, res: Response) => {
    console.log("POST /schedules - Criando nova atividade com dados:", req.body);
    const data = insertScheduleSchema.parse(req.body);
    
    const weekday = data.weekday;
    if (!weekdays.includes(weekday as any)) {
      return res.status(400).json({ message: "Dia da semana inválido" });
    }
    
    const existingSchedules = await storage.getSchedulesByDay(weekday as WeekDay);
    const duplicateSchedule = existingSchedules.find(s => 
      s.professionalId === data.professionalId && 
      s.startTime === data.startTime && 
      s.endTime === data.endTime
    );
    
    if (duplicateSchedule) {
      console.log("Encontrada escala existente com os mesmos dados:", duplicateSchedule);
      console.log("Atualizando escala existente em vez de criar nova");
      const updatedSchedule = await storage.updateSchedule(duplicateSchedule.id, data);
      return res.status(200).json(updatedSchedule);
    }
    
    const schedule = await storage.createSchedule(data);
    console.log("Nova escala criada:", schedule);
    res.status(201).json(schedule);
  }));
  
  apiRouter.put("/schedules/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    console.log("PUT /schedules/:id - Recebendo requisição para atualizar ID:", id, "Dados:", req.body);
    
    const data = insertScheduleSchema.partial().parse(req.body);
    
    const existingSchedule = await storage.getSchedule(id);
    if (!existingSchedule) {
      console.log(`Escala ID:${id} não encontrada`);
      return res.status(404).json({ message: "Escala não encontrada" });
    }
    
    console.log("Escala existente encontrada:", existingSchedule);
    const schedule = await storage.updateSchedule(id, data);
    console.log("Escala atualizada:", schedule);
    
    res.json(schedule);
  }));
  
  apiRouter.delete("/schedules/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const success = await storage.deleteSchedule(id);
    
    if (!success) {
      return res.status(404).json({ message: "Escala não encontrada" });
    }
    
    res.status(204).end();
  }));
  
  // Prefixo para todas as rotas da API
  app.use("/api", apiRouter);
  
  return createServer(app);
}
