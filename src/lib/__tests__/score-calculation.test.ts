import { describe, it, expect } from "vitest";

// Function simulating score details calculations (matching pages logic)
function calculateScore({
  qualityOfWorkmanship,
  time,
  projectManagement,
  projectManagementNa,
  contractManagement,
  contractManagementNa,
  healthAndSafety,
}: {
  qualityOfWorkmanship: number;
  time: number;
  projectManagement: number;
  projectManagementNa: boolean;
  contractManagement: number;
  contractManagementNa: boolean;
  healthAndSafety: number;
}) {
  let earned = 0;
  let maxPossible = 100;

  earned += qualityOfWorkmanship || 0;
  earned += time || 0;

  if (projectManagementNa) {
    maxPossible -= 20;
  } else {
    earned += projectManagement || 0;
  }

  if (contractManagementNa) {
    maxPossible -= 20;
  } else {
    earned += contractManagement || 0;
  }

  earned += healthAndSafety || 0;

  const scaled = maxPossible > 0 ? Math.round((earned / maxPossible) * 100) : 0;

  return { earned, maxPossible, scaled };
}

function requiresLowScoreJustification(scores: (number | null)[]) {
  return scores.some((s) => s !== null && s <= 7);
}

describe("Score Calculation and Scaling", () => {
  it("should calculate correctly with all categories present", () => {
    const scores = {
      qualityOfWorkmanship: 15,
      time: 16,
      projectManagement: 14,
      projectManagementNa: false,
      contractManagement: 17,
      contractManagementNa: false,
      healthAndSafety: 18,
    };

    const res = calculateScore(scores);
    expect(res.earned).toBe(80);
    expect(res.maxPossible).toBe(100);
    expect(res.scaled).toBe(80);
  });

  it("should scale up score when one category is N/A", () => {
    const scores = {
      qualityOfWorkmanship: 15, // out of 20
      time: 15,                 // out of 20
      projectManagement: 0,
      projectManagementNa: true, // N/A, reduces maxPossible to 80
      contractManagement: 15,    // out of 20
      contractManagementNa: false,
      healthAndSafety: 15,       // out of 20
    };

    // Earned: 15 + 15 + 15 + 15 = 60. Max Possible: 80.
    // Scaled: (60 / 80) * 100 = 75
    const res = calculateScore(scores);
    expect(res.earned).toBe(60);
    expect(res.maxPossible).toBe(80);
    expect(res.scaled).toBe(75);
  });

  it("should scale up score when multiple categories are N/A", () => {
    const scores = {
      qualityOfWorkmanship: 12,
      time: 12,
      projectManagement: 0,
      projectManagementNa: true,
      contractManagement: 0,
      contractManagementNa: true,
      healthAndSafety: 12,
    };

    // Earned: 12 + 12 + 12 = 36. Max Possible: 60.
    // Scaled: (36 / 60) * 100 = 60
    const res = calculateScore(scores);
    expect(res.earned).toBe(36);
    expect(res.maxPossible).toBe(60);
    expect(res.scaled).toBe(60);
  });

  it("should handle all zero scores correctly", () => {
    const scores = {
      qualityOfWorkmanship: 0,
      time: 0,
      projectManagement: 0,
      projectManagementNa: false,
      contractManagement: 0,
      contractManagementNa: false,
      healthAndSafety: 0,
    };

    const res = calculateScore(scores);
    expect(res.earned).toBe(0);
    expect(res.maxPossible).toBe(100);
    expect(res.scaled).toBe(0);
  });

  it("should trigger low score justification for any score <= 7", () => {
    expect(requiresLowScoreJustification([15, 12, 8, 7, 10])).toBe(true);
    expect(requiresLowScoreJustification([15, 12, 8, 8, 10])).toBe(false);
    expect(requiresLowScoreJustification([null, 12, 8, 3, 10])).toBe(true);
    expect(requiresLowScoreJustification([null, null, null, null, null])).toBe(false);
  });
});
