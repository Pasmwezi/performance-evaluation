-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorEvaluation" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "projectNumber" TEXT NOT NULL,
    "clientReferenceNumber" TEXT,
    "descriptionOfWork" TEXT,
    "contractorName" TEXT NOT NULL,
    "contractorAddress" TEXT,
    "superintendent" TEXT,
    "pmName" TEXT,
    "pmTelephone" TEXT,
    "pmFax" TEXT,
    "pmCell" TEXT,
    "pmEmail" TEXT,
    "awardAmount" DOUBLE PRECISION,
    "awardDate" TIMESTAMP(3),
    "finalAmount" DOUBLE PRECISION,
    "completionDate" TIMESTAMP(3),
    "changeOrdersCount" INTEGER,
    "finalCertificateDate" TIMESTAMP(3),
    "qualityOfWorkmanship" INTEGER,
    "time" INTEGER,
    "projectManagement" INTEGER,
    "contractManagement" INTEGER,
    "healthAndSafety" INTEGER,
    "totalPoints" INTEGER,
    "comments" TEXT,
    "originalPdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractorEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantEvaluation" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "projectNumber" TEXT NOT NULL,
    "clientReferenceNumber" TEXT,
    "descriptionOfWork" TEXT,
    "firmName" TEXT NOT NULL,
    "firmAddress" TEXT,
    "pmName" TEXT,
    "pmTelephone" TEXT,
    "pmFax" TEXT,
    "pmCell" TEXT,
    "pmEmail" TEXT,
    "awardAmount" DOUBLE PRECISION,
    "awardDate" TIMESTAMP(3),
    "finalAmount" DOUBLE PRECISION,
    "completionDate" TIMESTAMP(3),
    "amendmentsCount" INTEGER,
    "design" INTEGER,
    "qualityOfResults" INTEGER,
    "management" INTEGER,
    "time" INTEGER,
    "cost" INTEGER,
    "totalPoints" INTEGER,
    "comments" TEXT,
    "originalPdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultantEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
