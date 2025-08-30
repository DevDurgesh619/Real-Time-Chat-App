-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "name" TEXT,
ALTER COLUMN "photo" DROP NOT NULL;
