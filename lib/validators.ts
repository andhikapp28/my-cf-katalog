import { z } from "zod";
import { eventDays, priorities, productStatuses, purchaseTypes } from "./constants";

export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(180),
  description: z.string().max(2000).optional(),
  venue: z.string().max(180).optional(),
  bannerImageUrl: z.string().url().optional().or(z.literal("")),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  budget: z.coerce.number().int().min(0),
  isActive: z.boolean().default(false)
});

export const circleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(180),
  socialLink: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(2000).optional()
});

export const floorMapSchema = z.object({
  id: z.string().uuid().optional(),
  eventId: z.string().uuid(),
  name: z.string().min(2).max(160),
  hall: z.string().max(60).optional(),
  width: z.coerce.number().int().min(200).max(5000),
  height: z.coerce.number().int().min(200).max(5000),
  previousImageUrl: z.string().url().optional().or(z.literal(""))
});

export const boothLocationSchema = z.object({
  id: z.string().uuid().optional(),
  eventId: z.string().uuid(),
  circleId: z.string().uuid(),
  floorMapId: z.string().uuid(),
  boothCode: z.string().min(1).max(32),
  day: z.enum(eventDays).default("ALL_DAYS"),
  posX: z.coerce.number().int().min(0).max(100),
  posY: z.coerce.number().int().min(0).max(100),
  notes: z.string().max(1000).optional()
});

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  eventId: z.string().uuid(),
  circleId: z.string().uuid(),
  name: z.string().min(2).max(200),
  imageUrl: z.string().url().optional().or(z.literal("")),
  price: z.coerce.number().int().min(0),
  poDeadline: z.string().optional(),
  productLink: z.string().url().optional().or(z.literal("")),
  status: z.enum(productStatuses),
  priority: z.enum(priorities),
  targetDay: z.enum(eventDays).default("ALL_DAYS"),
  isRush: z.boolean().default(false),
  poPickupNotes: z.string().max(2000).optional(),
  quantity: z.coerce.number().int().min(1).max(99),
  notes: z.string().max(4000).optional(),
  purchaseType: z.enum(purchaseTypes)
});
