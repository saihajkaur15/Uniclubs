-- Align ApprovalRequest with the admin workflow contract.
ALTER TABLE "ApprovalRequest"
    ADD COLUMN IF NOT EXISTS "remarks" TEXT;

UPDATE "ApprovalRequest"
SET "remarks" = COALESCE("remarks", "reason", "description");

UPDATE "ApprovalRequest"
SET "targetId" = COALESCE("targetId", '')
WHERE "targetId" IS NULL;

UPDATE "ApprovalRequest"
SET "requestedBy" = COALESCE("requestedBy", '')
WHERE "requestedBy" IS NULL;

ALTER TABLE "ApprovalRequest"
    ALTER COLUMN "targetId" SET NOT NULL,
    ALTER COLUMN "requestedBy" SET NOT NULL;

ALTER TABLE "ApprovalRequest"
    DROP COLUMN IF EXISTS "title",
    DROP COLUMN IF EXISTS "description",
    DROP COLUMN IF EXISTS "metadata",
    DROP COLUMN IF EXISTS "reviewedBy",
    DROP COLUMN IF EXISTS "reviewedAt",
    DROP COLUMN IF EXISTS "reason";

-- Align VenueAssignment with the admin workflow contract.
ALTER TABLE "VenueAssignment"
    ADD COLUMN IF NOT EXISTS "venueName" TEXT;

UPDATE "VenueAssignment"
SET "venueName" = COALESCE("venueName", "venue", '')
WHERE "venueName" IS NULL;

ALTER TABLE "VenueAssignment"
    ALTER COLUMN "venueName" SET NOT NULL;

ALTER TABLE "VenueAssignment"
    DROP COLUMN IF EXISTS "venue",
    DROP COLUMN IF EXISTS "notes",
    DROP COLUMN IF EXISTS "updatedAt";

-- Align AdminActionLog with the admin workflow contract.
ALTER TABLE "AdminActionLog"
    ADD COLUMN IF NOT EXISTS "targetType" TEXT;

UPDATE "AdminActionLog"
SET "targetType" = COALESCE("targetType", 'ADMIN')
WHERE "targetType" IS NULL;

UPDATE "AdminActionLog"
SET "targetId" = COALESCE("targetId", '')
WHERE "targetId" IS NULL;

ALTER TABLE "AdminActionLog"
    ALTER COLUMN "targetType" SET NOT NULL,
    ALTER COLUMN "targetId" SET NOT NULL;

ALTER TABLE "AdminActionLog"
    DROP COLUMN IF EXISTS "details";
