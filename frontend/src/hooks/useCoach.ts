// src/hooks/useCoach.ts
import { useEffect, useState } from "react";
import { findCoach, DEFAULT_COACH_ID } from "@/personas/personas";

export function useCoach() {
  const [coachId, setCoachId] = useState<string>(() => {
    try {
      return localStorage.getItem("coachId") || DEFAULT_COACH_ID;
    } catch {
      return DEFAULT_COACH_ID;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("coachId", coachId);
    } catch {
      /* ignore */
    }
  }, [coachId]);

  const coach = findCoach(coachId);
  return { coachId, setCoachId, coach };
}
