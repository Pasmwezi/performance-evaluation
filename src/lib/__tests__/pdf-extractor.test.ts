import { describe, it, expect } from "vitest";
import { extractDataFromText } from "../pdf-extractor";

describe("pdf-extractor", () => {
  it("should extract Contractor evaluation fields correctly from text", () => {
    const mockText = `
      SELECT - CONTRACTOR PERFORMANCE EVALUATION REPORT FORM (CPERF)
      Contract Number - N° du contrat: CON-9999
      Project Number - N° du projet: PROJ-8888
      Client Reference Number - N° de référence du client: REF-7777
      Description of work - Description des travaux: Renovation work
      Contractor's Business Name - Nom de l'entreprise: Builders Inc.
      Contractor's Business Address - Adresse de l'entreprise: 123 Construction Rd
      Contractor's Superintendent - Surintendant: John Doe
      No. of Change Orders: 4
      Final Certificate Date: 2026-06-20
      Project Manager - Gestionnaire de projet: PM Manager
      Telephone No. - N° de téléphone: 555-1234
      Fax No. - N° de télécopieur: 555-5678
      Cell No. - N° de cellulaire: 555-9012
      E-Mail Address - Adresse électronique: pm@example.com
      Contract Award Amount: 150000.50
      Award Date: 2026-01-01
      Final Amount - Montant Final: 162000.00
      Completion Date: 2026-06-15
      
      QUALITY OF WORKMANSHIP - QUALITÉ DES TRAVAUX EXÉCUTÉS
      18
      
      TIME - DÉLAI D'EXÉCUTION
      15
      
      PROJECT MANAGEMENT- GESTION DU PROJET
      17
      
      CONTRACT MANAGEMENT- GESTION DU CONTRAT
      16
      
      HEALTH AND SAFETY - SANTÉ ET SÉCURITÉ
      19
      
      Comments - Commentaires
      Work was completed satisfactorily with minor delays.
      Safety regulations were strictly followed.
      
      Total points: 85
    `;

    const data = extractDataFromText(mockText);
    expect(data.type).toBe("contractor");
    expect(data.contractNumber).toBe("CON-9999");
    expect(data.projectNumber).toBe("PROJ-8888");
    expect(data.clientReferenceNumber).toBe("REF-7777");
    expect(data.descriptionOfWork).toBe("Renovation work");
    expect(data.name).toBe("Builders Inc.");
    expect(data.address).toBe("123 Construction Rd");
    expect(data.superintendent).toBe("John Doe");
    expect(data.changeOrdersCount).toBe("4");
    expect(data.finalCertificateDate).toBe("2026-06-20");
    expect(data.pmName).toBe("PM Manager");
    expect(data.pmTelephone).toBe("555-1234");
    expect(data.pmFax).toBe("555-5678");
    expect(data.pmCell).toBe("555-9012");
    expect(data.pmEmail).toBe("pm@example.com");
    expect(data.awardAmount).toBe("150000.50");
    expect(data.awardDate).toBe("2026-01-01");
    expect(data.finalAmount).toBe("162000.00");
    expect(data.completionDate).toBe("2026-06-15");
    
    expect(data.qualityOfWorkmanship).toBe("18");
    expect(data.time).toBe("15");
    expect(data.projectManagement).toBe("17");
    expect(data.contractManagement).toBe("16");
    expect(data.healthAndSafety).toBe("19");
    expect(data.totalPoints).toBe("85");
    expect(data.comments).toBe("Work was completed satisfactorily with minor delays.\nSafety regulations were strictly followed.");
  });

  it("should extract Consultant evaluation fields correctly from text", () => {
    const mockText = `
      SELECT - CONSULTANT PERFORMANCE EVALUATION
      Contract Number - N° du contrat: CON-1111
      Project Number - N° du projet: PROJ-2222
      Client Reference Number - N° de référence du client: REF-3333
      Description of work - Description des travaux: Architectural design
      Consultant's Business Name - Nom de l'expert-conseil: Design Group
      Consultant's Business Address - Adresse: 456 Sketch Ave
      No. of Amendments: 3
      Project Manager - Gestionnaire de projet: PM Jane
      Telephone No. - N° de téléphone: 555-4321
      Fax No. - N° de télécopieur: 555-8765
      Cell No. - N° de cellulaire: 555-2109
      E-Mail Address - Adresse électronique: jane@example.com
      Contract Award Amount: 75000
      Award Date: 2026-02-01
      Final Amount - Montant Final: 80000
      Completion Date: 2026-05-30
      
      DESIGN - CONCEPTION
      19
      
      QUALITY OF RESULTS - QUALITÉ DES RÉSULTATS
      18
      
      MANAGEMENT - GESTION
      18
      
      TIME - DÉLAI
      17
      
      COST - COÛT
      16
      
      Comments - Commentaires
      Excellent blueprints provided. Communication was smooth.
      
      Total points: 88
    `;

    const data = extractDataFromText(mockText);
    expect(data.type).toBe("consultant");
    expect(data.contractNumber).toBe("CON-1111");
    expect(data.projectNumber).toBe("PROJ-2222");
    expect(data.clientReferenceNumber).toBe("REF-3333");
    expect(data.descriptionOfWork).toBe("Architectural design");
    expect(data.name).toBe("Design Group");
    expect(data.address).toBe("456 Sketch Ave");
    expect(data.amendmentsCount).toBe("3");
    expect(data.pmName).toBe("PM Jane");
    expect(data.pmTelephone).toBe("555-4321");
    expect(data.pmFax).toBe("555-8765");
    expect(data.pmCell).toBe("555-2109");
    expect(data.pmEmail).toBe("jane@example.com");
    expect(data.awardAmount).toBe("75000");
    expect(data.awardDate).toBe("2026-02-01");
    expect(data.finalAmount).toBe("80000");
    expect(data.completionDate).toBe("2026-05-30");
    
    expect(data.design).toBe("19");
    expect(data.qualityOfResults).toBe("18");
    expect(data.management).toBe("18");
    expect(data.time).toBe("17");
    expect(data.cost).toBe("16");
    expect(data.totalPoints).toBe("88");
    expect(data.comments).toBe("Excellent blueprints provided. Communication was smooth.");
  });
});
