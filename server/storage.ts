import { 
  users, type User, type InsertUser,
  professionals, type Professional, type InsertProfessional,
  timeSlots, type TimeSlot, type InsertTimeSlot,
  schedules, type Schedule, type InsertSchedule,
  type WeekDay
} from "@shared/schema";

// Interface de armazenamento
export interface IStorage {
  // Usuários
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profissionais
  getAllProfessionals(): Promise<Professional[]>;
  getProfessional(id: number): Promise<Professional | undefined>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  updateProfessional(id: number, data: Partial<InsertProfessional>): Promise<Professional | undefined>;
  deleteProfessional(id: number): Promise<boolean>;
  
  // Horários
  getAllTimeSlots(): Promise<TimeSlot[]>;
  getTimeSlot(id: number): Promise<TimeSlot | undefined>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
  
  // Escalas
  getSchedulesByDay(weekday: WeekDay): Promise<Schedule[]>;
  getSchedulesByProfessional(professionalId: number): Promise<Schedule[]>;
  getSchedule(id: number): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, data: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private professionals: Map<number, Professional>;
  private timeSlots: Map<number, TimeSlot>;
  private schedules: Map<number, Schedule>;
  
  private userCurrentId: number;
  private professionalCurrentId: number;
  private timeSlotCurrentId: number;
  private scheduleCurrentId: number;

  constructor() {
    this.users = new Map();
    this.professionals = new Map();
    this.timeSlots = new Map();
    this.schedules = new Map();
    
    this.userCurrentId = 1;
    this.professionalCurrentId = 1;
    this.timeSlotCurrentId = 1;
    this.scheduleCurrentId = 1;
    
    // Inicializa com dados de exemplo para facilitar o desenvolvimento
    this.initializeData();
  }

  // Usuários
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Profissionais
  async getAllProfessionals(): Promise<Professional[]> {
    return Array.from(this.professionals.values());
  }
  
  async getProfessional(id: number): Promise<Professional | undefined> {
    return this.professionals.get(id);
  }
  
  async createProfessional(insertProfessional: InsertProfessional): Promise<Professional> {
    const id = this.professionalCurrentId++;
    const professional: Professional = { ...insertProfessional, id };
    this.professionals.set(id, professional);
    return professional;
  }
  
  async updateProfessional(id: number, data: Partial<InsertProfessional>): Promise<Professional | undefined> {
    const professional = this.professionals.get(id);
    if (!professional) return undefined;
    
    const updatedProfessional = { ...professional, ...data };
    this.professionals.set(id, updatedProfessional);
    return updatedProfessional;
  }
  
  async deleteProfessional(id: number): Promise<boolean> {
    return this.professionals.delete(id);
  }
  
  // Horários
  async getAllTimeSlots(): Promise<TimeSlot[]> {
    return Array.from(this.timeSlots.values());
  }
  
  async getTimeSlot(id: number): Promise<TimeSlot | undefined> {
    return this.timeSlots.get(id);
  }
  
  async createTimeSlot(insertTimeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const id = this.timeSlotCurrentId++;
    const timeSlot: TimeSlot = { ...insertTimeSlot, id };
    this.timeSlots.set(id, timeSlot);
    return timeSlot;
  }
  
  // Escalas
  async getSchedulesByDay(weekday: WeekDay): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(
      (schedule) => schedule.weekday === weekday
    );
  }
  
  async getSchedulesByProfessional(professionalId: number): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(
      (schedule) => schedule.professionalId === professionalId
    );
  }
  
  async getSchedule(id: number): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }
  
  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleCurrentId++;
    const now = new Date();
    const schedule: Schedule = { 
      ...insertSchedule, 
      id, 
      updatedAt: now
    };
    this.schedules.set(id, schedule);
    return schedule;
  }
  
  async updateSchedule(id: number, data: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const schedule = this.schedules.get(id);
    if (!schedule) return undefined;
    
    const now = new Date();
    const updatedSchedule = { 
      ...schedule, 
      ...data, 
      updatedAt: now 
    };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }
  
  async deleteSchedule(id: number): Promise<boolean> {
    return this.schedules.delete(id);
  }
  
  // Inicializa dados de exemplo
  private initializeData() {
    // Adicionar profissionais
    const professionals: InsertProfessional[] = [
      { name: "Dr. Paulo", initials: "DP", active: 1 },
      { name: "Dra. Ana Maria", initials: "AM", active: 1 },
      { name: "Dr. Carlos", initials: "CL", active: 1 },
      { name: "Dr. João", initials: "JM", active: 1 },
      { name: "Dra. Maria", initials: "MM", active: 1 }
    ];
    
    professionals.forEach(p => this.createProfessional(p));
    
    // Adicionar horários
    const timeSlots: InsertTimeSlot[] = [
      { startTime: "08:00", endTime: "09:00" },
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "10:00", endTime: "11:00" },
      { startTime: "11:00", endTime: "12:00" },
      { startTime: "13:00", endTime: "14:00" },
      { startTime: "14:00", endTime: "15:00" },
      { startTime: "15:00", endTime: "16:00" },
      { startTime: "16:00", endTime: "17:00" }
    ];
    
    timeSlots.forEach(ts => this.createTimeSlot(ts));
    
    // Adicionar escalas para Segunda-feira
    const segundaSchedules: InsertSchedule[] = [
      { professionalId: 1, weekday: "segunda", startTime: "08:00", endTime: "09:00", activity: "plantao", location: "Sala 101", notes: "" },
      { professionalId: 2, weekday: "segunda", startTime: "08:00", endTime: "09:00", activity: "consulta", location: "Sala 203", notes: "" },
      { professionalId: 3, weekday: "segunda", startTime: "08:00", endTime: "09:00", activity: "disponivel", location: "", notes: "" },
      { professionalId: 4, weekday: "segunda", startTime: "08:00", endTime: "09:00", activity: "cirurgia", location: "Centro Cirúrgico", notes: "" },
      { professionalId: 5, weekday: "segunda", startTime: "08:00", endTime: "09:00", activity: "treinamento", location: "Auditório", notes: "" },
      
      { professionalId: 1, weekday: "segunda", startTime: "09:00", endTime: "10:00", activity: "plantao", location: "Sala 101", notes: "" },
      { professionalId: 2, weekday: "segunda", startTime: "09:00", endTime: "10:00", activity: "consulta", location: "Sala 203", notes: "" },
      { professionalId: 3, weekday: "segunda", startTime: "09:00", endTime: "10:00", activity: "reuniao", location: "Sala de Reuniões", notes: "" },
      { professionalId: 4, weekday: "segunda", startTime: "09:00", endTime: "10:00", activity: "cirurgia", location: "Centro Cirúrgico", notes: "" },
      { professionalId: 5, weekday: "segunda", startTime: "09:00", endTime: "10:00", activity: "disponivel", location: "", notes: "" },
      
      { professionalId: 1, weekday: "segunda", startTime: "10:00", endTime: "11:00", activity: "plantao", location: "Sala 101", notes: "" },
      { professionalId: 2, weekday: "segunda", startTime: "10:00", endTime: "11:00", activity: "folga", location: "", notes: "" },
      { professionalId: 3, weekday: "segunda", startTime: "10:00", endTime: "11:00", activity: "reuniao", location: "Sala de Reuniões", notes: "" },
      { professionalId: 4, weekday: "segunda", startTime: "10:00", endTime: "11:00", activity: "cirurgia", location: "Centro Cirúrgico", notes: "" },
      { professionalId: 5, weekday: "segunda", startTime: "10:00", endTime: "11:00", activity: "consulta", location: "Sala 205", notes: "" },
      
      { professionalId: 1, weekday: "segunda", startTime: "11:00", endTime: "12:00", activity: "plantao", location: "Sala 101", notes: "" },
      { professionalId: 2, weekday: "segunda", startTime: "11:00", endTime: "12:00", activity: "folga", location: "", notes: "" },
      { professionalId: 3, weekday: "segunda", startTime: "11:00", endTime: "12:00", activity: "consulta", location: "Sala 202", notes: "" },
      { professionalId: 4, weekday: "segunda", startTime: "11:00", endTime: "12:00", activity: "consulta", location: "Sala 204", notes: "" },
      { professionalId: 5, weekday: "segunda", startTime: "11:00", endTime: "12:00", activity: "consulta", location: "Sala 205", notes: "" },
      
      { professionalId: 1, weekday: "segunda", startTime: "13:00", endTime: "14:00", activity: "plantao", location: "Sala 101", notes: "" },
      { professionalId: 2, weekday: "segunda", startTime: "13:00", endTime: "14:00", activity: "folga", location: "", notes: "" },
      { professionalId: 3, weekday: "segunda", startTime: "13:00", endTime: "14:00", activity: "consulta", location: "Sala 202", notes: "" },
      { professionalId: 4, weekday: "segunda", startTime: "13:00", endTime: "14:00", activity: "exame", location: "Laboratório", notes: "" },
      { professionalId: 5, weekday: "segunda", startTime: "13:00", endTime: "14:00", activity: "consulta", location: "Sala 205", notes: "" }
    ];
    
    segundaSchedules.forEach(s => this.createSchedule(s));
    
    // Adicionar algumas escalas para outros dias da semana
    const otherDaysSchedules: InsertSchedule[] = [
      { professionalId: 1, weekday: "terca", startTime: "08:00", endTime: "09:00", activity: "consulta", location: "Sala 202", notes: "" },
      { professionalId: 2, weekday: "terca", startTime: "08:00", endTime: "09:00", activity: "reuniao", location: "Sala de Reuniões", notes: "" },
      { professionalId: 3, weekday: "terca", startTime: "08:00", endTime: "09:00", activity: "plantao", location: "Sala 101", notes: "" },
      
      { professionalId: 1, weekday: "quarta", startTime: "08:00", endTime: "09:00", activity: "cirurgia", location: "Centro Cirúrgico", notes: "" },
      { professionalId: 2, weekday: "quarta", startTime: "08:00", endTime: "09:00", activity: "plantao", location: "Sala 101", notes: "" },
      { professionalId: 4, weekday: "quarta", startTime: "08:00", endTime: "09:00", activity: "consulta", location: "Sala 204", notes: "" }
    ];
    
    otherDaysSchedules.forEach(s => this.createSchedule(s));
  }
}

export const storage = new MemStorage();
