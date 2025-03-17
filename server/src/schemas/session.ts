import { z } from "zod";

export const sessionSchema = z.object({
  userName: z
    .string()
    .min(1, "Name cannot be empty")
    .max(20, "Name too long")
    .regex(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters allowed"),

  sessionName: z
    .string()
    .min(1, "Session name cannot be empty")
    .max(10, "Session name must be less than 10 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters allowed"),
});
