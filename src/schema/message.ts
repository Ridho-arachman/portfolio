import { z } from "zod";

// Server-side payload accepted by PUT /api/admin/messages/[id] (status triage).
export const messageStatusSchema = z.enum([
  "NEW",
  "READ",
  "REPLIED",
  "ARCHIVED",
]);

export const messageStatusUpdateSchema = z.object({
  status: messageStatusSchema,
});

export type MessageStatusUpdateValues = z.infer<
  typeof messageStatusUpdateSchema
>;
