import { describe, it, expect } from "vitest";
import { formatFullNameToLastFirst } from "@/lib/formatName";

describe("formatFullNameToLastFirst", () => {
  it("returns empty string unchanged", () => {
    expect(formatFullNameToLastFirst("")).toBe("");
  });

  it("returns whitespace-only string trimmed (empty)", () => {
    expect(formatFullNameToLastFirst("   ")).toBe("");
    expect(formatFullNameToLastFirst("\t\n")).toBe("");
  });

  it("returns single-word name as-is", () => {
    expect(formatFullNameToLastFirst("Madonna")).toBe("Madonna");
    expect(formatFullNameToLastFirst("Prince")).toBe("Prince");
  });

  it("formats two words as Lastname, Firstname", () => {
    expect(formatFullNameToLastFirst("Jane Doe")).toBe("Doe, Jane");
    expect(formatFullNameToLastFirst("John Smith")).toBe("Smith, John");
  });

  it("treats last word as last name and rest as first name(s)", () => {
    expect(formatFullNameToLastFirst("Mary Jane Watson")).toBe("Watson, Mary Jane");
    expect(formatFullNameToLastFirst("Jean Claude Van Damme")).toBe("Damme, Jean Claude Van");
  });

  it("trims leading and trailing spaces before parsing", () => {
    expect(formatFullNameToLastFirst("  Jane Doe  ")).toBe("Doe, Jane");
    expect(formatFullNameToLastFirst(" John  Smith ")).toBe("Smith, John");
  });

  it("collapses multiple internal spaces (split filters empty)", () => {
    // split(/\s+/) then filter(Boolean) gives ["Mary", "Jane", "Watson"] for "Mary   Jane   Watson"
    expect(formatFullNameToLastFirst("Mary   Jane   Watson")).toBe("Watson, Mary Jane");
  });

  it("handles names with hyphen or apostrophe (last word is still last name)", () => {
    expect(formatFullNameToLastFirst("Mary-Kate Olsen")).toBe("Olsen, Mary-Kate");
    expect(formatFullNameToLastFirst("O'Brien Patrick")).toBe("Patrick, O'Brien");
  });

  it("handles unicode / non-ASCII names", () => {
    expect(formatFullNameToLastFirst("محمد رضا")).toBe("رضا, محمد");
    expect(formatFullNameToLastFirst("José García López")).toBe("López, José García");
  });

  it("single character is returned as-is", () => {
    expect(formatFullNameToLastFirst("X")).toBe("X");
  });

  it("two single-character words are formatted as Last, First", () => {
    expect(formatFullNameToLastFirst("A B")).toBe("B, A");
  });
});
