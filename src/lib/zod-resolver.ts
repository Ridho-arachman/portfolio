import {
  type FieldErrors,
  type FieldValues,
  type ResolverResult,
} from "react-hook-form";
import { z } from "zod";

export function zodResolver<TFieldValues extends FieldValues>(
  schema: z.ZodType<TFieldValues>,
) {
  return (values: unknown): ResolverResult<TFieldValues> => {
    const parsed = schema.safeParse(values);

    if (parsed.success) {
      return { values: parsed.data, errors: {} };
    }

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join(".") : "root";
      if (!errors[path]) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    }

    return {
      values: {},
      errors: errors as unknown as FieldErrors<TFieldValues>,
    } as ResolverResult<TFieldValues>;
  };
}
