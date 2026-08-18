-- AlterTable
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

-- Backfill slug from existing rows (id fallback, table is empty in dev)
UPDATE "Product" SET "slug" = "id" WHERE "slug" IS NULL;

ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
