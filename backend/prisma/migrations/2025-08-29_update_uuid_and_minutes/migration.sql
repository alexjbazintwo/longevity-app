-- Enable UUID generation (pg14+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- 1) PLAN table changes
-- =========================

-- Add new UUID primary key column
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "id_uuid" uuid;
UPDATE "Plan" SET "id_uuid" = gen_random_uuid() WHERE "id_uuid" IS NULL;

-- Add new minutes/flags/anchor columns (with safe defaults)
ALTER TABLE "Plan"
  ADD COLUMN IF NOT EXISTS "currentWeeklyRunningMinutes" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "longestRecentRunMinutes"     integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "weeklyMinutesMax"            integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "includeMobility"             boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "includeStrength"             boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "weekAnchorDay"               integer;

-- Drop legacy columns if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='Plan' AND column_name='weeklyHoursMin') THEN
    ALTER TABLE "Plan" DROP COLUMN "weeklyHoursMin";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='Plan' AND column_name='weeklyHoursMax') THEN
    ALTER TABLE "Plan" DROP COLUMN "weeklyHoursMax";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='Plan' AND column_name='surfaces') THEN
    ALTER TABLE "Plan" DROP COLUMN "surfaces";
  END IF;
END$$;

-- =========================
-- 2) WEEK table changes
-- =========================

-- Add new UUID FK column to Week
ALTER TABLE "Week" ADD COLUMN IF NOT EXISTS "planId_uuid" uuid;

-- Backfill FK using old text PK join
UPDATE "Week" w
SET "planId_uuid" = p."id_uuid"
FROM "Plan" p
WHERE w."planId" = p."id";

-- Add phase column (default build)
ALTER TABLE "Week" ADD COLUMN IF NOT EXISTS "phase" text NOT NULL DEFAULT 'build';

-- =========================
-- 3) WORKOUT table changes
-- =========================

-- Add new UUID FK column to Workout
ALTER TABLE "Workout" ADD COLUMN IF NOT EXISTS "weekId_uuid" uuid;

-- Backfill FK using old text PK join
UPDATE "Workout" wo
SET "weekId_uuid" = w."id_uuid"
FROM "Week" w
WHERE wo."weekId" = w."id";

-- Split intensity taxonomy: rename "focus" -> "focusZone", add sessionType, role
ALTER TABLE "Workout"
  RENAME COLUMN "focus" TO "focusZone";

ALTER TABLE "Workout"
  ADD COLUMN IF NOT EXISTS "sessionType" text,
  ADD COLUMN IF NOT EXISTS "role" text;

-- =========================
-- 4) ACTIVITY LOG table changes
-- =========================

-- Add new UUID PK column
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "id_uuid" uuid;
UPDATE "ActivityLog" SET "id_uuid" = gen_random_uuid() WHERE "id_uuid" IS NULL;

-- =========================
-- 5) Swap columns & constraints
-- =========================

-- WEEK: add UUID PK for swap
ALTER TABLE "Week" ADD COLUMN IF NOT EXISTS "id_uuid" uuid;
UPDATE "Week" SET "id_uuid" = gen_random_uuid() WHERE "id_uuid" IS NULL;

-- WORKOUT: add UUID PK for swap
ALTER TABLE "Workout" ADD COLUMN IF NOT EXISTS "id_uuid" uuid;
UPDATE "Workout" SET "id_uuid" = gen_random_uuid() WHERE "id_uuid" IS NULL;

-- Drop FKs that reference old text keys
ALTER TABLE "Week" DROP CONSTRAINT IF EXISTS "Week_planId_fkey";
ALTER TABLE "Workout" DROP CONSTRAINT IF EXISTS "Workout_weekId_fkey";

-- Swap primary keys (PLAN, WEEK, WORKOUT, ACTIVITYLOG)

-- PLAN
ALTER TABLE "Plan" DROP CONSTRAINT IF EXISTS "Plan_pkey";
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_pkey_uuid" PRIMARY KEY ("id_uuid");

-- WEEK
ALTER TABLE "Week" DROP CONSTRAINT IF EXISTS "Week_pkey";
ALTER TABLE "Week" ADD CONSTRAINT "Week_pkey_uuid" PRIMARY KEY ("id_uuid");

-- WORKOUT
ALTER TABLE "Workout" DROP CONSTRAINT IF EXISTS "Workout_pkey";
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_pkey_uuid" PRIMARY KEY ("id_uuid");

-- ACTIVITYLOG
ALTER TABLE "ActivityLog" DROP CONSTRAINT IF EXISTS "ActivityLog_pkey";
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_pkey_uuid" PRIMARY KEY ("id_uuid");

-- Drop old PK columns and rename *_uuid -> canonical names

-- PLAN
ALTER TABLE "Plan" DROP COLUMN "id";
ALTER TABLE "Plan" RENAME COLUMN "id_uuid" TO "id";

-- WEEK
ALTER TABLE "Week" DROP COLUMN "id";
ALTER TABLE "Week" RENAME COLUMN "id_uuid" TO "id";

-- WORKOUT
ALTER TABLE "Workout" DROP COLUMN "id";
ALTER TABLE "Workout" RENAME COLUMN "id_uuid" TO "id";

-- ACTIVITYLOG
ALTER TABLE "ActivityLog" DROP COLUMN "id";
ALTER TABLE "ActivityLog" RENAME COLUMN "id_uuid" TO "id";

-- Replace FK columns with uuid versions

-- WEEK.planId (text) -> uuid
ALTER TABLE "Week" DROP COLUMN "planId";
ALTER TABLE "Week" RENAME COLUMN "planId_uuid" TO "planId";

-- WORKOUT.weekId (text) -> uuid
ALTER TABLE "Workout" DROP COLUMN "weekId";
ALTER TABLE "Workout" RENAME COLUMN "weekId_uuid" TO "weekId";

-- Recreate FKs to new UUID parents

ALTER TABLE "Week"
  ADD CONSTRAINT "Week_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Workout"
  ADD CONSTRAINT "Workout_weekId_fkey"
  FOREIGN KEY ("weekId") REFERENCES "Week"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Set DEFAULTs for new UUID PKs

ALTER TABLE "Plan"    ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "Week"    ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "Workout" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ActivityLog" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- Ensure NOT NULL on FK columns after backfill
ALTER TABLE "Week"    ALTER COLUMN "planId" SET NOT NULL;
ALTER TABLE "Workout" ALTER COLUMN "weekId" SET NOT NULL;
