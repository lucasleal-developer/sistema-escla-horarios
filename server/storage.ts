import { 
  users, type User, type InsertUser,
  professionals, type Professional, type InsertProfessional,
  timeSlots, type TimeSlot, type InsertTimeSlot,
  schedules, type Schedule, type InsertSchedule,
  activityTypeTable, type ActivityType, type InsertActivityType,
  defaultActivityTypes,
  type WeekDay
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { pool, db } from "./db";
const { Pool } = require("pg");

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
  
  // Tipos de Atividades
  getAllActivityTypes(): Promise<ActivityType[]>;
  getActivityType(id: number): Promise<ActivityType | undefined>;
  getActivityTypeByCode(code: string): Promise<ActivityType | undefined>;
  createActivityType(activityType: InsertActivityType): Promise<ActivityType>;
  updateActivityType(id: number, data: Partial<InsertActivityType>): Promise<ActivityType | undefined>;
  deleteActivityType(id: number): Promise<boolean>;
  
  // Horários
  getAllTimeSlots(): Promise<TimeSlot[]>;
  getBaseTimeSlots(): Promise<TimeSlot[]>; // Retorna apenas os slots base (não os personalizados)
  getTimeSlot(id: number): Promise<TimeSlot | undefined>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
  deleteTimeSlot(id: number): Promise<boolean>;
  
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
  private activityTypes: Map<number, ActivityType>;
  
  private userCurrentId: number;
  private professionalCurrentId: number;
  private timeSlotCurrentId: number;
  private scheduleCurrentId: number;
  private activityTypeCurrentId: number;

  constructor() {
    this.users = new Map();
    this.professionals = new Map();
    this.timeSlots = new Map();
    this.schedules = new Map();
    this.activityTypes = new Map();
    
    this.userCurrentId = 1;
    this.professionalCurrentId = 1;
    this.timeSlotCurrentId = 1;
    this.scheduleCurrentId = 1;
    this.activityTypeCurrentId = 1;
    
    // Inicializa com dados de exemplo para facilitar o desenvolvimento
    this.initializeData();
  }
  
  // Método adicional para a nova interface
  async getActivityTypeByCode(code: string): Promise<ActivityType | undefined> {
    return Array.from(this.activityTypes.values()).find(
      (activityType) => activityType.code === code
    );
  }
  
  // Método adicional para a nova interface
  async getBaseTimeSlots(): Promise<TimeSlot[]> {
    return Array.from(this.timeSlots.values()).filter(
      (timeSlot) => timeSlot.isBaseSlot === 1
    );
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
  
  // Tipos de Atividades
  async getAllActivityTypes(): Promise<ActivityType[]> {
    return Array.from(this.activityTypes.values());
  }
  
  async getActivityType(id: number): Promise<ActivityType | undefined> {
    return this.activityTypes.get(id);
  }
  
  async createActivityType(data: { name: string; code: string; color: string }): Promise<ActivityType> {
    const id = this.activityTypeCurrentId++;
    const activityType: ActivityType = { ...data, id };
    this.activityTypes.set(id, activityType);
    return activityType;
  }
  
  async updateActivityType(id: number, data: Partial<{ name: string; code: string; color: string }>): Promise<ActivityType | undefined> {
    const activityType = this.activityTypes.get(id);
    if (!activityType) return undefined;
    
    const updatedActivityType = { ...activityType, ...data };
    this.activityTypes.set(id, updatedActivityType);
    return updatedActivityType;
  }
  
  async deleteActivityType(id: number): Promise<boolean> {
    return this.activityTypes.delete(id);
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
  
  async deleteTimeSlot(id: number): Promise<boolean> {
    return this.timeSlots.delete(id);
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
      { name: "Prof. Paulo", initials: "PP", active: 1 },
      { name: "Profa. Ana Maria", initials: "AM", active: 1 },
      { name: "Prof. Carlos", initials: "CL", active: 1 },
      { name: "Prof. João", initials: "JM", active: 1 },
      { name: "Profa. Maria", initials: "MM", active: 1 }
    ];
    
    professionals.forEach(p => this.createProfessional(p));
    
    // Adicionar tipos de atividades
    const activityTypes = [
      { name: "Aula", code: "aula", color: "#3b82f6" }, 
      { name: "Reunião", code: "reuniao", color: "#8b5cf6" },
      { name: "Plantão", code: "plantao", color: "#22c55e" },
      { name: "Estudo", code: "estudo", color: "#f59e0b" },
      { name: "Evento", code: "evento", color: "#ef4444" },
      { name: "Férias", code: "ferias", color: "#06b6d4" },
      { name: "Licença", code: "licenca", color: "#64748b" },
      { name: "Indisponível", code: "disponivel", color: "#6b7280" }
    ];
    
    activityTypes.forEach(at => this.createActivityType(at));
    
    // Adicionar horários
    const timeSlots: InsertTimeSlot[] = [
      { startTime: "08:00", endTime: "09:00" },
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "10:00", endTime: "11:00" },
      { startTime: "11:00", endTime: "12:00" },
      { startTime: "13:00", endTime: "14:00" },
      { startTime: "14:00", endTime: "15:00" },
      { startTime: "15:00", endTime: "16:00" },
      { startTime: "16:00", endTime: "17:00" },
      { startTime: "08:00", endTime: "09:30" },
      { startTime: "09:45", endTime: "11:15" },
      { startTime: "13:30", endTime: "15:00" },
      { startTime: "15:15", endTime: "16:45" }
    ];
    
    timeSlots.forEach(ts => this.createTimeSlot(ts));
    
    // Adicionar escalas para Segunda-feira
    const segundaSchedules: InsertSchedule[] = [
      { professionalId: 1, weekday: "segunda", startTime: "08:00", endTime: "09:30", activityCode: "aula", location: "Sala 101", notes: "Matemática" },
      { professionalId: 2, weekday: "segunda", startTime: "08:00", endTime: "09:30", activityCode: "aula", location: "Sala 203", notes: "Português" },
      { professionalId: 3, weekday: "segunda", startTime: "08:00", endTime: "09:30", activityCode: "disponivel_horario", location: "", notes: "" },
      { professionalId: 4, weekday: "segunda", startTime: "08:00", endTime: "09:30", activityCode: "estudo", location: "Biblioteca", notes: "Preparação de aulas" },
      { professionalId: 5, weekday: "segunda", startTime: "08:00", endTime: "09:30", activityCode: "plantao", location: "Sala Professores", notes: "Plantão de dúvidas" },
      
      { professionalId: 1, weekday: "segunda", startTime: "09:45", endTime: "11:15", activityCode: "reuniao", location: "Sala Reuniões", notes: "Reunião pedagógica" },
      { professionalId: 2, weekday: "segunda", startTime: "09:45", endTime: "11:15", activityCode: "aula", location: "Sala 203", notes: "Português" },
      { professionalId: 3, weekday: "segunda", startTime: "09:45", endTime: "11:15", activityCode: "reuniao", location: "Sala Reuniões", notes: "Reunião pedagógica" },
      { professionalId: 4, weekday: "segunda", startTime: "09:45", endTime: "11:15", activityCode: "aula", location: "Lab Química", notes: "Química" },
      { professionalId: 5, weekday: "segunda", startTime: "09:45", endTime: "11:15", activityCode: "disponivel_horario", location: "", notes: "" },
      
      { professionalId: 1, weekday: "segunda", startTime: "13:30", endTime: "15:00", activityCode: "aula", location: "Sala 101", notes: "Matemática" },
      { professionalId: 2, weekday: "segunda", startTime: "13:30", endTime: "15:00", activityCode: "licenca", location: "", notes: "Licença médica" },
      { professionalId: 3, weekday: "segunda", startTime: "13:30", endTime: "15:00", activityCode: "aula", location: "Sala 201", notes: "História" },
      { professionalId: 4, weekday: "segunda", startTime: "13:30", endTime: "15:00", activityCode: "estudo", location: "Biblioteca", notes: "Preparação de provas" },
      { professionalId: 5, weekday: "segunda", startTime: "13:30", endTime: "15:00", activityCode: "aula", location: "Sala 205", notes: "Inglês" }
    ];
    
    segundaSchedules.forEach(s => this.createSchedule(s));
    
    // Adicionar algumas escalas para outros dias da semana
    const otherDaysSchedules: InsertSchedule[] = [
      { professionalId: 1, weekday: "terca", startTime: "08:00", endTime: "09:30", activityCode: "aula", location: "Sala 102", notes: "Matemática" },
      { professionalId: 2, weekday: "terca", startTime: "08:00", endTime: "09:30", activityCode: "reuniao", location: "Sala Coordenação", notes: "Reunião de departamento" },
      { professionalId: 3, weekday: "terca", startTime: "08:00", endTime: "09:30", activityCode: "plantao", location: "Biblioteca", notes: "Plantão de dúvidas" },
      
      { professionalId: 1, weekday: "quarta", startTime: "13:30", endTime: "15:00", activityCode: "evento", location: "Auditório", notes: "Feira de ciências" },
      { professionalId: 2, weekday: "quarta", startTime: "13:30", endTime: "15:00", activityCode: "plantao", location: "Sala 208", notes: "Plantão de dúvidas" },
      { professionalId: 4, weekday: "quarta", startTime: "13:30", endTime: "15:00", activityCode: "evento", location: "Auditório", notes: "Feira de ciências" }
    ];
    
    otherDaysSchedules.forEach(s => this.createSchedule(s));
  }
}

// Implementação de armazenamento com PostgreSQL
export class PostgresStorage implements IStorage {
  private db: typeof db;
  
  constructor(connectionString: string) {
    this.db = db;
  }

  async connect() {
    try {
      await pool.connect();
      console.log("Connected to PostgreSQL database");
      await this.setupDatabase();
    } catch (error) {
      console.error("Failed to connect to PostgreSQL database:", error);
      throw error;
    }
  }

  async setupDatabase() {
    try {
      // Verifica se já existem tipos de atividades no banco
      const existingActivityTypes = await this.getAllActivityTypes();
      
      // Se não houver tipos de atividades, inicializa com os padrões
      if (existingActivityTypes.length === 0) {
        console.log("Initializing default activity types");
        for (const activityType of defaultActivityTypes) {
          await this.createActivityType(activityType);
        }
      }

      // Verifica se já existem slots de tempo no banco
      const existingTimeSlots = await this.getAllTimeSlots();
      
      // Se não houver slots de tempo, inicializa com os padrões
      if (existingTimeSlots.length === 0) {
        console.log("Initializing default time slots");
        const defaultTimeSlots: InsertTimeSlot[] = [
          { startTime: "08:00", endTime: "08:30", interval: 30, isBaseSlot: 1 },
          { startTime: "08:30", endTime: "09:00", interval: 30, isBaseSlot: 1 },
          { startTime: "09:00", endTime: "09:30", interval: 30, isBaseSlot: 1 },
          { startTime: "09:30", endTime: "10:00", interval: 30, isBaseSlot: 1 },
          { startTime: "10:00", endTime: "10:30", interval: 30, isBaseSlot: 1 },
          { startTime: "10:30", endTime: "11:00", interval: 30, isBaseSlot: 1 },
          { startTime: "11:00", endTime: "11:30", interval: 30, isBaseSlot: 1 },
          { startTime: "11:30", endTime: "12:00", interval: 30, isBaseSlot: 1 },
          { startTime: "13:00", endTime: "13:30", interval: 30, isBaseSlot: 1 },
          { startTime: "13:30", endTime: "14:00", interval: 30, isBaseSlot: 1 },
          { startTime: "14:00", endTime: "14:30", interval: 30, isBaseSlot: 1 },
          { startTime: "14:30", endTime: "15:00", interval: 30, isBaseSlot: 1 },
          { startTime: "15:00", endTime: "15:30", interval: 30, isBaseSlot: 1 },
          { startTime: "15:30", endTime: "16:00", interval: 30, isBaseSlot: 1 },
          { startTime: "16:00", endTime: "16:30", interval: 30, isBaseSlot: 1 },
          { startTime: "16:30", endTime: "17:00", interval: 30, isBaseSlot: 1 },
          { startTime: "17:00", endTime: "17:30", interval: 30, isBaseSlot: 1 },
          { startTime: "17:30", endTime: "18:00", interval: 30, isBaseSlot: 1 },
        ];
        
        for (const timeSlot of defaultTimeSlots) {
          await this.createTimeSlot(timeSlot);
        }
      }
    } catch (error) {
      console.error("Failed to setup database:", error);
      throw error;
    }
  }

  // Implementações dos métodos de IStorage
  
  // Usuários
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  // Profissionais
  async getAllProfessionals(): Promise<Professional[]> {
    return await this.db.select().from(professionals);
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    const result = await this.db.select().from(professionals).where(eq(professionals.id, id));
    return result[0];
  }

  async createProfessional(professional: InsertProfessional): Promise<Professional> {
    const result = await this.db.insert(professionals).values({
      name: professional.name,
      initials: professional.initials,
      active: professional.active || 1
    }).returning();
    return result[0];
  }

  async updateProfessional(id: number, data: Partial<InsertProfessional>): Promise<Professional | undefined> {
    const result = await this.db.update(professionals).set(data).where(eq(professionals.id, id)).returning();
    return result[0];
  }

  async deleteProfessional(id: number): Promise<boolean> {
    const result = await this.db.delete(professionals).where(eq(professionals.id, id)).returning();
    return result.length > 0;
  }

  // Tipos de Atividades
  async getAllActivityTypes(): Promise<ActivityType[]> {
    return await this.db.select().from(activityTypeTable);
  }

  async getActivityType(id: number): Promise<ActivityType | undefined> {
    const result = await this.db.select().from(activityTypeTable).where(eq(activityTypeTable.id, id));
    return result[0];
  }

  async getActivityTypeByCode(code: string): Promise<ActivityType | undefined> {
    const result = await this.db.select().from(activityTypeTable).where(eq(activityTypeTable.code, code));
    return result[0];
  }

  async createActivityType(activityType: InsertActivityType): Promise<ActivityType> {
    const result = await this.db.insert(activityTypeTable).values(activityType).returning();
    return result[0];
  }

  async updateActivityType(id: number, data: Partial<InsertActivityType>): Promise<ActivityType | undefined> {
    const result = await this.db.update(activityTypeTable).set(data).where(eq(activityTypeTable.id, id)).returning();
    return result[0];
  }

  async deleteActivityType(id: number): Promise<boolean> {
    const result = await this.db.delete(activityTypeTable).where(eq(activityTypeTable.id, id)).returning();
    return result.length > 0;
  }

  // Horários
  async getAllTimeSlots(): Promise<TimeSlot[]> {
    return await this.db.select().from(timeSlots);
  }

  async getBaseTimeSlots(): Promise<TimeSlot[]> {
    return await this.db.select().from(timeSlots).where(eq(timeSlots.isBaseSlot, 1));
  }

  async getTimeSlot(id: number): Promise<TimeSlot | undefined> {
    const result = await this.db.select().from(timeSlots).where(eq(timeSlots.id, id));
    return result[0];
  }

  async createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const result = await this.db.insert(timeSlots).values({
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      interval: timeSlot.interval || 30,
      isBaseSlot: timeSlot.isBaseSlot || 1
    }).returning();
    return result[0];
  }

  async deleteTimeSlot(id: number): Promise<boolean> {
    const result = await this.db.delete(timeSlots).where(eq(timeSlots.id, id)).returning();
    return result.length > 0;
  }

  // Escalas
  async getSchedulesByDay(weekday: WeekDay): Promise<Schedule[]> {
    return await this.db.select().from(schedules).where(eq(schedules.weekday, weekday));
  }

  async getSchedulesByProfessional(professionalId: number): Promise<Schedule[]> {
    return await this.db.select().from(schedules).where(eq(schedules.professionalId, professionalId));
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    const result = await this.db.select().from(schedules).where(eq(schedules.id, id));
    return result[0];
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const result = await this.db.insert(schedules).values({
      professionalId: schedule.professionalId,
      weekday: schedule.weekday,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      activityCode: schedule.activityCode,
      location: schedule.location || null,
      notes: schedule.notes || null,
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  async updateSchedule(id: number, data: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const result = await this.db.update(schedules)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(schedules.id, id))
      .returning();
    return result[0];
  }

  async deleteSchedule(id: number): Promise<boolean> {
    const result = await this.db.delete(schedules).where(eq(schedules.id, id)).returning();
    return result.length > 0;
  }
}

// Cria e exporta a instância de armazenamento
let storage: IStorage;

if (process.env.DATABASE_URL) {
  console.log("Using PostgreSQL storage");
  storage = new PostgresStorage(process.env.DATABASE_URL);
  (storage as PostgresStorage).connect().catch(err => {
    console.error("Failed to connect to PostgreSQL, falling back to in-memory storage:", err);
    storage = new MemStorage();
  });
} else {
  console.log("Using in-memory storage");
  storage = new MemStorage();
}

export { storage };
