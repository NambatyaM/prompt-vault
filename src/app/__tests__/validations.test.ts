import { describe, it, expect } from "vitest"
import { signupSchema, loginSchema, promptSchema } from "@/lib/validations"

describe("signupSchema", () => {
  it("accepts valid input", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      username: "testuser",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = signupSchema.safeParse({
      email: "invalid",
      password: "password123",
      username: "testuser",
    })
    expect(result.success).toBe(false)
  })

  it("rejects short password", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "123",
      username: "testuser",
    })
    expect(result.success).toBe(false)
  })

  it("rejects short username", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      username: "ab",
    })
    expect(result.success).toBe(false)
  })
})

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    })
    expect(result.success).toBe(false)
  })
})

describe("promptSchema", () => {
  const validPrompt = {
    title: "Test prompt title here",
    prompt_text: "This is a test prompt text that is long enough to pass validation",
    tool_used: "ChatGPT",
    category: "code" as const,
    description: "A description that is long enough for the validation",
  }

  it("accepts valid prompt", () => {
    const result = promptSchema.safeParse(validPrompt)
    expect(result.success).toBe(true)
  })

  it("rejects short title", () => {
    const result = promptSchema.safeParse({
      ...validPrompt,
      title: "Hi",
    })
    expect(result.success).toBe(false)
  })

  it("accepts optional fields", () => {
    const result = promptSchema.safeParse({
      ...validPrompt,
      outcome_text: "Made $400 in first week",
      proof_link: "https://example.com/proof",
    })
    expect(result.success).toBe(true)
  })
})
