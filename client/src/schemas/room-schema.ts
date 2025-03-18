import { z } from "zod";

export const roomSchema = z.object({
  userName: z
    .string()
    .min(1, "Name cannot be empty")
    .max(20, "Name too long")
    .regex(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters allowed"),

  roomName: z
    .string()
    .min(1, "Room name cannot be empty")
    .max(10, "Room name must be less than 10 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters allowed"),
});

export type RoomInput = z.infer<typeof roomSchema>;
