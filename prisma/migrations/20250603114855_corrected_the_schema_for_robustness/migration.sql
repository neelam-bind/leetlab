/*
  Warnings:

  - You are about to drop the column `comileOutput` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "comileOutput",
ADD COLUMN     "compileOutput" TEXT,
ALTER COLUMN "stdin" DROP NOT NULL,
ALTER COLUMN "stdout" DROP NOT NULL,
ALTER COLUMN "stderr" DROP NOT NULL;

-- AlterTable
ALTER TABLE "testCaseResult" ALTER COLUMN "stdout" DROP NOT NULL,
ALTER COLUMN "stderr" DROP NOT NULL,
ALTER COLUMN "compilerOutput" DROP NOT NULL;
