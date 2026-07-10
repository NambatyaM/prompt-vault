import { z } from "zod"

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const promptSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be at most 200 characters"),
  prompt_text: z
    .string()
    .min(10, "Prompt text must be at least 10 characters")
    .max(5000, "Prompt text must be at most 5000 characters"),
  tool_used: z.string().min(1, "AI tool is required"),
  ai_model_version: z.string().max(100).optional().or(z.literal("")),
  license_type: z.enum(["personal", "commercial", "resell"]).optional().default("personal"),
  category: z.enum([
    "image",
    "copywriting",
    "code",
    "business",
    "video",
    "agents",
    "chatbot",
    "data",
    "seo",
    "other",
  ]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters"),
  proof_image_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
  proof_link: z
    .string()
    .url("Invalid proof link URL")
    .optional()
    .or(z.literal("")),
  outcome_text: z.string().max(200, "Outcome text is too long").optional().or(z.literal("")),
  is_premium: z.boolean().optional().default(false),
  price: z.number().min(0).optional().nullable(),
})

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional().or(z.literal("")),
})

export type SignupFormData = z.infer<typeof signupSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type PromptFormData = z.infer<typeof promptSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
