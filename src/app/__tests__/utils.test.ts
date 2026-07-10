import { describe, it, expect } from "vitest"
import { slugify, formatDate, formatRelativeDate, formatPrice, cn } from "@/lib/utils"

describe("slugify", () => {
  it("converts text to a slug", () => {
    expect(slugify("Hello World")).toBe("hello-world")
  })

  it("removes special characters", () => {
    expect(slugify("Hello! World?")).toBe("hello-world")
  })

  it("handles multiple spaces and hyphens", () => {
    expect(slugify("  Hello   World  ")).toBe("hello-world")
  })

  it("handles empty string", () => {
    expect(slugify("")).toBe("")
  })
})

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2024-01-15T00:00:00Z")
    expect(result).toContain("Jan")
    expect(result).toContain("15")
    expect(result).toContain("2024")
  })
})

describe("formatRelativeDate", () => {
  it('returns "today" for today', () => {
    expect(formatRelativeDate(new Date().toISOString())).toBe("today")
  })
})

describe("formatPrice", () => {
  it("formats price in cents to dollars", () => {
    expect(formatPrice(999)).toBe("$9.99")
  })

  it("handles null", () => {
    expect(formatPrice(null)).toBe("Free")
  })
})

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })
})
