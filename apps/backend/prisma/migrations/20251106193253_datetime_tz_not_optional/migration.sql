/*
  Warnings:

  - Made the column `created_at_tz` on table `AccessRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at_tz` on table `Content` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at_tz` on table `Donation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at_tz` on table `Draft` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastUpdate_tz` on table `Draft` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `InviteCode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at_tz` on table `InviteCode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `date_tz` on table `Meeting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at_tz` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at_tz` on table `PaymentPromise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at_tz` on table `ReadSession` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at_tz` on table `Record` required. This step will fail if there are existing NULL values in that column.
  - Made the column `CAIndexedAt_tz` on table `Record` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastUpdatedAt_tz` on table `Record` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at_tz` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastSeenNotifications_tz` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at_tz` on table `ValidationRequest` required. This step will fail if there are existing NULL values in that column.

*/

UPDATE "AccessRequest" SET "created_at_tz" = "created_at" where "created_at_tz" is null;
ALTER TABLE "AccessRequest" ALTER COLUMN "created_at_tz" SET NOT NULL;

UPDATE "Donation" SET "created_at_tz" = "created_at" where "created_at_tz" is null;
ALTER TABLE "Donation" ALTER COLUMN "created_at_tz" SET NOT NULL;

UPDATE "Draft" SET "lastUpdate_tz" = "lastUpdate" where "lastUpdate_tz" is null;
UPDATE "Draft" SET "created_at_tz" = "created_at" where "created_at_tz" is null;
ALTER TABLE "Draft" ALTER COLUMN "created_at_tz" SET NOT NULL,
ALTER COLUMN "lastUpdate_tz" SET NOT NULL;

UPDATE "InviteCode" SET "created_at_tz" = "created_at" where "created_at_tz" is null;
ALTER TABLE "InviteCode" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at_tz" SET NOT NULL,
ALTER COLUMN "created_at_tz" SET DEFAULT CURRENT_TIMESTAMP;

UPDATE "Meeting" SET "date_tz" = "date" where "date_tz" is null;
ALTER TABLE "Meeting" ALTER COLUMN "date_tz" SET NOT NULL;

UPDATE "Notification" SET "created_at_tz" = "created_at" where "created_at_tz" is null;
ALTER TABLE "Notification" ALTER COLUMN "created_at_tz" SET NOT NULL;

UPDATE "PaymentPromise" SET "created_at_tz" = "created_at" where "created_at_tz" is null;
ALTER TABLE "PaymentPromise" ALTER COLUMN "created_at_tz" SET NOT NULL;

UPDATE "ReadSession" SET "created_at_tz" = "created_at" where "created_at_tz" is null;
ALTER TABLE "ReadSession" ALTER COLUMN "created_at_tz" SET NOT NULL;

UPDATE "ValidationRequest" SET "created_at_tz" = "created_at" where "created_at_tz" is null;
ALTER TABLE "ValidationRequest" ALTER COLUMN "created_at_tz" SET NOT NULL;