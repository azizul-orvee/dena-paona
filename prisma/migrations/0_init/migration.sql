-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "entry_kind" AS ENUM ('dena', 'paona');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "phone" VARCHAR(24) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "kind" "entry_kind" NOT NULL,
    "person_name" TEXT NOT NULL,
    "person_phone" VARCHAR(24),
    "amount" DECIMAL(14,2) NOT NULL,
    "amount_paid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "note" TEXT,
    "due_date" DATE,
    "settled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_shares" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "viewer_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_shares_pkey" PRIMARY KEY ("id"),
    -- Not expressible in the Prisma schema; added by hand.
    CONSTRAINT "wallet_shares_no_self" CHECK ("owner_id" <> "viewer_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_unique" ON "users"("phone");

-- CreateIndex
CREATE INDEX "entries_owner_kind_idx" ON "entries"("owner_id", "kind");

-- CreateIndex
CREATE INDEX "entries_owner_settled_idx" ON "entries"("owner_id", "settled_at");

-- CreateIndex
CREATE INDEX "entries_created_idx" ON "entries"("created_at");

-- CreateIndex
CREATE INDEX "wallet_shares_viewer_idx" ON "wallet_shares"("viewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_shares_owner_viewer_unique" ON "wallet_shares"("owner_id", "viewer_id");

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wallet_shares" ADD CONSTRAINT "wallet_shares_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wallet_shares" ADD CONSTRAINT "wallet_shares_viewer_id_users_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
