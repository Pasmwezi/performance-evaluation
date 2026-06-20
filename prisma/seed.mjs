import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.contractorEvaluation.deleteMany();
  await prisma.consultantEvaluation.deleteMany();
  await prisma.contractor.deleteMany();
  await prisma.consultant.deleteMany();

  // Create an Underperforming Contractor
  const badContractor = await prisma.contractor.create({
    data: {
      name: "Acme Demolition",
      address: "123 Rubble St",
      evaluations: {
        create: [
          {
            contractNumber: "C-1001",
            projectNumber: "P-1001",
            qualityOfWorkmanship: 10,
            time: 10,
            projectManagement: 12,
            contractManagement: 10,
            healthAndSafety: 8,
            totalPoints: 50,
            comments: "Poor safety protocols leading to delays.",
          },
          {
            contractNumber: "C-1002",
            projectNumber: "P-1002",
            qualityOfWorkmanship: 12,
            time: 12,
            projectManagement: 10,
            contractManagement: 10,
            healthAndSafety: 10,
            totalPoints: 54,
          }
        ]
      }
    }
  });

  // Create a Good Consultant
  const goodConsultant = await prisma.consultant.create({
    data: {
      name: "Starlight Engineering",
      address: "456 Innovation Ave",
      evaluations: {
        create: [
          {
            contractNumber: "CS-2001",
            projectNumber: "P-2001",
            design: 18,
            qualityOfResults: 19,
            management: 17,
            time: 18,
            cost: 16,
            totalPoints: 88,
            comments: "Excellent design work.",
          }
        ]
      }
    }
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
