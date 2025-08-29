CREATE SCHEMA IF NOT EXISTS "public";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User (keep text ids)
CREATE TABLE IF NOT EXISTS "public"."User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT
);

-- Plan (uuid)
CREATE TABLE IF NOT EXISTS "public"."Plan" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "goal" TEXT NOT NULL,
  "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "targetDate" TIMESTAMP WITH TIME ZONE,
  "currentWeeklyRunningMinutes" INTEGER NOT NULL,
  "longestRecentRunMinutes" INTEGER NOT NULL,
  "weeklyMinutesMax" INTEGER NOT NULL,
  "runsPerWeek" INTEGER NOT NULL,
  "includeMobility" BOOLEAN NOT NULL DEFAULT FALSE,
  "includeStrength" BOOLEAN NOT NULL DEFAULT FALSE,
  "constraints" JSONB,
  "weekAnchorDay" INTEGER,
  "injuries" JSONB,
  "medicalFlags" JSONB
);

-- Week (uuid)
CREATE TABLE IF NOT EXISTS "public"."Week" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "planId" uuid NOT NULL REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "weekIndex" INTEGER NOT NULL,
  "phase" TEXT NOT NULL,
  "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "rampPercent" DOUBLE PRECISION NOT NULL,
  "intensityMix" JSONB NOT NULL,
  "rationale" JSONB
);

-- Workout (uuid)
CREATE TABLE IF NOT EXISTS "public"."Workout" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "weekId" uuid NOT NULL REFERENCES "public"."Week"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "type" TEXT NOT NULL,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "durationMin" INTEGER NOT NULL,
  "role" TEXT,
  "focusZone" TEXT,
  "sessionType" TEXT,
  "structure" JSONB,
  "notes" TEXT
);

-- ActivityLog (uuid)
CREATE TABLE IF NOT EXISTS "public"."ActivityLog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "type" TEXT NOT NULL,
  "durationMin" INTEGER NOT NULL,
  "distanceKm" DOUBLE PRECISION,
  "rpe" INTEGER,
  "avgHr" INTEGER,
  "notes" TEXT,
  "source" TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS "ActivityLog_userId_date_idx" ON "public"."ActivityLog" ("userId","date");
ALTER TABLE "public"."Plan" ADD CONSTRAINT "Plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
