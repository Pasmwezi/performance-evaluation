/*
  Warnings:

  - You are about to drop the column `firmAddress` on the `ConsultantEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `firmName` on the `ConsultantEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `contractorAddress` on the `ContractorEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `contractorName` on the `ContractorEvaluation` table. All the data in the column will be lost.
  - Added the required column `consultantId` to the `ConsultantEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractorId` to the `ContractorEvaluation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConsultantEvaluation" DROP COLUMN "firmAddress",
DROP COLUMN "firmName",
ADD COLUMN     "consultantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ContractorEvaluation" DROP COLUMN "contractorAddress",
DROP COLUMN "contractorName",
ADD COLUMN     "contractorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Contractor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contractor_name_key" ON "Contractor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Consultant_name_key" ON "Consultant"("name");

-- AddForeignKey
ALTER TABLE "ContractorEvaluation" ADD CONSTRAINT "ContractorEvaluation_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultantEvaluation" ADD CONSTRAINT "ConsultantEvaluation_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "Consultant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
