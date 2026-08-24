import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const paymentSubmissionSchema = z.object({
  orderId: z.string().min(1),
  paymentMethodId: z.string().min(1),
  senderName: z.string().min(2, "Enter the name on the payment"),
  transactionId: z.string().min(3, "Enter a valid transaction ID"),
  amount: z.coerce.number().positive(),
  paidAt: z.string().min(1, "Select the payment date and time"),
});

export const projectSchema = z.object({
  title: z.string().min(3),
  shortDescription: z.string().min(10).max(200),
  description: z.string().min(20),
  priceInPkr: z.coerce.number().int().positive(),
  version: z.string().default("1.0.0"),
  categoryId: z.string().optional(),
  technologyIds: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  whatIsIncluded: z.array(z.string()).default([]),
  thumbnail: z.string().optional().or(z.literal("")),
  screenshots: z.array(z.string()).default([]),
  demoVideoUrl: z.string().optional().or(z.literal("")),
  demoUrl: z.string().optional().or(z.literal("")),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

export const paymentMethodSchema = z.object({
  name: z.string().min(2),
  accountHolder: z.string().min(2),
  bankOrWallet: z.string().min(2),
  accountNumber: z.string().min(3),
  iban: z.string().optional(),
  instructions: z.string().optional(),
  enabled: z.boolean().default(true),
});

export const rejectPaymentSchema = z.object({
  paymentId: z.string().min(1),
  reason: z.string().min(5, "Provide a reason for the customer"),
});
