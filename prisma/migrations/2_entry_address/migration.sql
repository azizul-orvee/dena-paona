-- Optional address for the person on an entry. Nullable, so existing rows are untouched.
-- AlterTable
ALTER TABLE "entries" ADD COLUMN "person_address" VARCHAR(200);
