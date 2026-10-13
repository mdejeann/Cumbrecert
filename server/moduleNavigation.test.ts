import { describe, expect, it } from "vitest";
import { createModuleResetState, getNextModulePath, getNextModuleTransition } from "../shared/moduleNavigation";

describe("module navigation", () => {
  it("opens the next module route after a passed exam", () => {
    expect(getNextModulePath(1, 2, 4)).toBe("/curso/1/modulo/3");
  });

  it("opens the final exam after the last module", () => {
    expect(getNextModulePath(1, 4, 4)).toBe("/curso/1/examen-final");
  });

  it("clears answers and the previous review when changing modules", () => {
    const resetState = createModuleResetState();
    expect(resetState.answers).toEqual([]);
    expect(resetState.result).toBeNull();
  });

  it("transitions from Module 2 review to Module 3 content in one step", () => {
    const transition = getNextModuleTransition(1, 2, 4);
    expect(transition.path).toBe("/curso/1/modulo/3");
    expect(transition.answers).toEqual([]);
    expect(transition.result).toBeNull();
  });
});
