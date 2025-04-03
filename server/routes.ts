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
  
  // API para profissionais
  apiRouter.get("/professionals", async (req: Request, res: Response) => {
    try {
      const professionals = await storage.getAllProfessionals();
      res.json(professionals);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar profissionais" });
    }
  });
  
  apiRouter.post("/professionals", async (req: Request, res: Response) => {
    try {
      const data = insertProfessionalSchema.parse(req.body);
      const professional = await storage.createProfessional(data);
      res.status(201).json(professional);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar profissional" });
      }
    }
  });
  
  apiRouter.put("/professionals/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const data = insertProfessionalSchema.partial().parse(req.body);
      const professional = await storage.updateProfessional(id, data);
      
      if (!professional) {
        return res.status(404).json({ message: "Profissional não encontrado" });
      }
      
      res.json(professional);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar profissional" });
      }
    }
  });
  
  apiRouter.delete("/professionals/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteProfessional(id);
      
      if (!success) {
        return res.status(404).json({ message: "Profissional não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir profissional" });
    }
  });
  
  // API para horários
  apiRouter.get("/time-slots", async (req: Request, res: Response) => {
    try {
      const timeSlots = await storage.getAllTimeSlots();
      res.json(timeSlots);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar horários" });
    }
  });
  
  apiRouter.post("/time-slots", async (req: Request, res: Response) => {
    try {
      const data = insertTimeSlotSchema.parse(req.body);
      const timeSlot = await storage.createTimeSlot(data);
      res.status(201).json(timeSlot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar horário" });
      }
    }
  });
  
  // API para escalas
  apiRouter.get("/schedules/:weekday", async (req: Request, res: Response) => {
    try {
      const weekday = req.params.weekday as WeekDay;
      
      // Verifica se o dia da semana é válido
      if (!weekdays.includes(weekday as any)) {
        return res.status(400).json({ message: "Dia da semana inválido" });
      }
      
      const schedules = await storage.getSchedulesByDay(weekday);
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
              atividade: s.activity,
              local: s.location || "",
              observacoes: s.notes || ""
            }))
          };
        })
      };
      
      res.json(formattedData);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar escalas" });
    }
  });
  
  apiRouter.get("/schedules", async (req: Request, res: Response) => {
    try {
      const professionalId = req.query.professionalId ? Number(req.query.professionalId) : undefined;
      
      if (!professionalId) {
        return res.status(400).json({ message: "ID do profissional é obrigatório" });
      }
      
      const schedules = await storage.getSchedulesByProfessional(professionalId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar escalas do profissional" });
    }
  });
  
  apiRouter.post("/schedules", async (req: Request, res: Response) => {
    try {
      const data = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(data);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar escala" });
      }
    }
  });
  
  apiRouter.put("/schedules/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const data = insertScheduleSchema.partial().parse(req.body);
      const schedule = await storage.updateSchedule(id, data);
      
      if (!schedule) {
        return res.status(404).json({ message: "Escala não encontrada" });
      }
      
      res.json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar escala" });
      }
    }
  });
  
  apiRouter.delete("/schedules/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteSchedule(id);
      
      if (!success) {
        return res.status(404).json({ message: "Escala não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir escala" });
    }
  });
  
  // Prefixo para todas as rotas da API
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
