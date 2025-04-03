import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define os dias da semana
export const weekdays = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
] as const;

export type WeekDay = typeof weekdays[number];

// Define os tipos de atividades disponíveis
export const activityTypes = [
  "aula", 
  "reuniao",
  "plantao",
  "estudo",
  "evento",
  "ferias",
  "licenca",
  "disponivel",
] as const;

export type ActivityType = typeof activityTypes[number];

// Tabela de profissionais
export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  active: integer("active").notNull().default(1),
});

export const insertProfessionalSchema = createInsertSchema(professionals).pick({
  name: true,
  initials: true,
  active: true,
});

export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type Professional = typeof professionals.$inferSelect;

// Tabela de horários
export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).pick({
  startTime: true,
  endTime: true,
});

export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;

// Tabela de atividades
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull(),
  weekday: text("weekday").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  activity: text("activity").notNull(), // tipo de atividade
  location: text("location"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertScheduleSchema = createInsertSchema(schedules).pick({
  professionalId: true,
  weekday: true,
  startTime: true,
  endTime: true,
  activity: true,
  location: true,
  notes: true,
});

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

// Esquema de validação para o frontend
export const scheduleFormSchema = z.object({
  professionalId: z.number(),
  weekday: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  activity: z.string(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;
