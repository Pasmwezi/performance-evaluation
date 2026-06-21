import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../prisma";

describe("Database Integration Tests", () => {
  const testContractorName = "TEST_CONTRACTOR_DB_TEST";
  const testConsultantName = "TEST_CONSULTANT_DB_TEST";

  beforeAll(async () => {
    // Clean up any lingering test data
    await prisma.contractorEvaluation.deleteMany({
      where: { contractor: { name: testContractorName } },
    });
    await prisma.contractor.deleteMany({
      where: { name: testContractorName },
    });
    await prisma.consultantEvaluation.deleteMany({
      where: { consultant: { name: testConsultantName } },
    });
    await prisma.consultant.deleteMany({
      where: { name: testConsultantName },
    });
  });

  afterAll(async () => {
    // Final clean up
    await prisma.contractorEvaluation.deleteMany({
      where: { contractor: { name: testContractorName } },
    });
    await prisma.contractor.deleteMany({
      where: { name: testContractorName },
    });
    await prisma.consultantEvaluation.deleteMany({
      where: { consultant: { name: testConsultantName } },
    });
    await prisma.consultant.deleteMany({
      where: { name: testConsultantName },
    });
    await prisma.$disconnect();
  });

  it("should connect to the database and verify prisma is healthy", async () => {
    const result = await prisma.$queryRaw`SELECT 1 as healthy`;
    expect(result).toBeDefined();
    expect((result as any)[0].healthy).toBe(1);
  });

  it("should create, read, and delete a Contractor and its Evaluation", async () => {
    // 1. Create contractor
    const contractor = await prisma.contractor.create({
      data: {
        name: testContractorName,
        address: "123 Test Road",
      },
    });

    expect(contractor.id).toBeDefined();
    expect(contractor.name).toBe(testContractorName);

    // 2. Create evaluation with the new fields
    const finalDate = new Date("2026-06-20T00:00:00.000Z");
    const evaluation = await prisma.contractorEvaluation.create({
      data: {
        contractorId: contractor.id,
        contractNumber: "CON-TEST-123",
        projectNumber: "PROJ-TEST-123",
        pmName: "PM Test",
        pmFax: "555-0199",
        pmCell: "555-0200",
        changeOrdersCount: 5,
        finalCertificateDate: finalDate,
        qualityOfWorkmanship: 15,
        time: 15,
        projectManagement: 15,
        contractManagement: 15,
        healthAndSafety: 15,
        totalPoints: 75,
      },
    });

    expect(evaluation.id).toBeDefined();
    expect(evaluation.pmFax).toBe("555-0199");
    expect(evaluation.pmCell).toBe("555-0200");
    expect(evaluation.changeOrdersCount).toBe(5);
    expect(evaluation.finalCertificateDate?.toISOString()).toBe(finalDate.toISOString());

    // 3. Read evaluation and check relation
    const foundContractor = await prisma.contractor.findUnique({
      where: { id: contractor.id },
      include: { evaluations: true },
    });

    expect(foundContractor).not.toBeNull();
    expect(foundContractor?.evaluations.length).toBe(1);
    expect(foundContractor?.evaluations[0].contractNumber).toBe("CON-TEST-123");
  });

  it("should create, read, and delete a Consultant and its Evaluation", async () => {
    // 1. Create consultant
    const consultant = await prisma.consultant.create({
      data: {
        name: testConsultantName,
        address: "456 Test Blvd",
      },
    });

    expect(consultant.id).toBeDefined();
    expect(consultant.name).toBe(testConsultantName);

    // 2. Create evaluation with new fields
    const evaluation = await prisma.consultantEvaluation.create({
      data: {
        consultantId: consultant.id,
        contractNumber: "CONS-TEST-123",
        projectNumber: "PROJ-TEST-456",
        pmName: "PM Test",
        pmFax: "555-0300",
        pmCell: "555-0400",
        amendmentsCount: 3,
        design: 18,
        qualityOfResults: 18,
        management: 18,
        time: 18,
        cost: 18,
        totalPoints: 90,
      },
    });

    expect(evaluation.id).toBeDefined();
    expect(evaluation.pmFax).toBe("555-0300");
    expect(evaluation.pmCell).toBe("555-0400");
    expect(evaluation.amendmentsCount).toBe(3);

    // 3. Read evaluation and check relation
    const foundConsultant = await prisma.consultant.findUnique({
      where: { id: consultant.id },
      include: { evaluations: true },
    });

    expect(foundConsultant).not.toBeNull();
    expect(foundConsultant?.evaluations.length).toBe(1);
    expect(foundConsultant?.evaluations[0].contractNumber).toBe("CONS-TEST-123");
  });

  it("should support ContractorEvaluation with N/A scores (null values)", async () => {
    // 1. Get contractor
    let contractor = await prisma.contractor.findUnique({
      where: { name: testContractorName },
    });
    if (!contractor) {
      contractor = await prisma.contractor.create({
        data: { name: testContractorName, address: "123 Test Road" },
      });
    }

    // 2. Create evaluation with Project Management and Contract Management set to null (N/A)
    const evaluation = await prisma.contractorEvaluation.create({
      data: {
        contractorId: contractor.id,
        contractNumber: "CON-TEST-NA",
        projectNumber: "PROJ-TEST-NA",
        qualityOfWorkmanship: 15,
        time: 15,
        projectManagement: null, // N/A
        contractManagement: null, // N/A
        healthAndSafety: 15,
        totalPoints: 75, // 45 points earned out of 60 possible points -> scaled to 75%
      },
    });

    expect(evaluation.id).toBeDefined();
    expect(evaluation.projectManagement).toBeNull();
    expect(evaluation.contractManagement).toBeNull();
    expect(evaluation.totalPoints).toBe(75);

    // Clean up
    await prisma.contractorEvaluation.delete({ where: { id: evaluation.id } });
  });

  it("should support ConsultantEvaluation with N/A scores (null values)", async () => {
    // 1. Get consultant
    let consultant = await prisma.consultant.findUnique({
      where: { name: testConsultantName },
    });
    if (!consultant) {
      consultant = await prisma.consultant.create({
        data: { name: testConsultantName, address: "456 Test Blvd" },
      });
    }

    // 2. Create evaluation with Design, Management, and Cost set to null (N/A)
    const evaluation = await prisma.consultantEvaluation.create({
      data: {
        consultantId: consultant.id,
        contractNumber: "CONS-TEST-NA",
        projectNumber: "PROJ-TEST-NA",
        design: null, // N/A
        qualityOfResults: 16,
        management: null, // N/A
        time: 16,
        cost: null, // N/A
        totalPoints: 80, // 32 points earned out of 40 possible points -> scaled to 80%
      },
    });

    expect(evaluation.id).toBeDefined();
    expect(evaluation.design).toBeNull();
    expect(evaluation.management).toBeNull();
    expect(evaluation.cost).toBeNull();
    expect(evaluation.totalPoints).toBe(80);

    // Clean up
    await prisma.consultantEvaluation.delete({ where: { id: evaluation.id } });
  });
});
