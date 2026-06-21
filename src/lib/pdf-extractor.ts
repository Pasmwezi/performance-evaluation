export interface ExtractedData {
  type: "contractor" | "consultant";
  
  // Entity
  name?: string;
  address?: string;

  // Contract info
  contractNumber?: string;
  projectNumber?: string;
  clientReferenceNumber?: string;
  descriptionOfWork?: string;
  superintendent?: string;
  
  // PM Info
  pmName?: string;
  pmTelephone?: string;
  pmFax?: string;
  pmCell?: string;
  pmEmail?: string;

  // Financials & Dates
  awardAmount?: string;
  awardDate?: string;
  finalAmount?: string;
  completionDate?: string;
  changeOrdersCount?: string;
  amendmentsCount?: string;
  finalCertificateDate?: string;

  // Scores
  qualityOfWorkmanship?: string;
  time?: string;
  projectManagement?: string;
  contractManagement?: string;
  healthAndSafety?: string;
  
  design?: string;
  qualityOfResults?: string;
  management?: string;
  cost?: string;

  totalPoints?: string;
  comments?: string;
}

export function extractDataFromText(text: string): ExtractedData {
  const data: ExtractedData = {
    type: "contractor",
  };

  // Determine type
  const isConsultant = /consultant/i.test(text) || /expert-conseil/i.test(text);
  data.type = isConsultant ? "consultant" : "contractor";

  const lines = text.split("\n").map(l => l.trim());

  // Helper: Find value on same line or next lines after matching a pattern
  function findValue(patterns: RegExp[], searchLines = 3): string | undefined {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matchPattern = patterns.find(p => p.test(line));
      if (matchPattern) {
        // First try to extract value on the same line if there's a colon or delimiter
        const colonSplit = line.split(/[:\t]/);
        if (colonSplit.length > 1) {
          const val = colonSplit[1].trim();
          // Make sure it's not another label
          if (val && val.length > 0 && !/^[A-Z\s/-]{5,}$/.test(val)) {
            return val;
          }
        }

        // If not found, search the subsequent lines
        for (let j = 1; j <= searchLines && i + j < lines.length; j++) {
          const nextLine = lines[i + j];
          if (nextLine && nextLine.length > 0 && !patterns.some(p => p.test(nextLine))) {
            // Check it's not a generic label or page footer/header
            if (!nextLine.includes("--") && !/TPSGC|PWGSC/i.test(nextLine) && nextLine.length > 1) {
              return nextLine;
            }
          }
        }
      }
    }
    return undefined;
  }

  // Helper to extract numeric values
  function findNumber(patterns: RegExp[]): string | undefined {
    const val = findValue(patterns);
    if (val) {
      const match = val.match(/\d+([\.,]\d+)?/);
      return match ? match[0].replace(",", ".") : undefined;
    }
    return undefined;
  }

  // Extract common fields
  data.contractNumber = findValue([/Contract Number/i, /N° du contrat/i]);
  data.projectNumber = findValue([/Project Number/i, /N° du projet/i]);
  data.clientReferenceNumber = findValue([/Client Reference/i, /N° de référence du client/i]);
  data.descriptionOfWork = findValue([/Description of work/i, /Description des travaux/i]);
  
  if (data.type === "contractor") {
    data.name = findValue([/Contractor's Business Name/i, /Nom de l'entreprise/i]);
    data.address = findValue([/Contractor's Business Address/i, /Adresse de l'entreprise/i]);
    data.superintendent = findValue([/Superintendent/i, /Surintendant/i]);
    data.changeOrdersCount = findNumber([/Change Orders/i, /ordres de changement/i]);
    data.finalCertificateDate = findValue([/Final Certificate Date/i, /Date du certificat final/i]);
  } else {
    data.name = findValue([/Consultant's Business Name/i, /Nom de l'expert-conseil/i, /Nom de la firme/i]);
    data.address = findValue([/Consultant's Business Address/i, /Adresse de l'expert-conseil/i]);
    data.amendmentsCount = findNumber([/No. of Amendments/i, /Nombre de modifications/i]);
  }

  // PM info
  data.pmName = findValue([/Project Manager/i, /Gestionnaire de projet/i]);
  data.pmTelephone = findValue([/Telephone No/i, /N° de téléphone/i]);
  data.pmFax = findValue([/Fax No/i, /N° de télécopieur/i]);
  data.pmCell = findValue([/Cell No/i, /N° de cellulaire/i]);
  data.pmEmail = findValue([/E-Mail Address/i, /Adresse électronique/i]);

  // Financials and dates
  data.awardAmount = findNumber([/Award Amount/i, /Montant du marché adjugé/i]);
  data.awardDate = findValue([/Award Date/i, /Date de l'adjudication/i]);
  data.finalAmount = findNumber([/Final Amount/i, /Montant Final/i]);
  data.completionDate = findValue([/Completion Date/i, /Date d'achèvement/i]);

  // Extract Scores
  function extractCategoryScore(categoryPatterns: RegExp[]): string | undefined {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (categoryPatterns.some(p => p.test(line))) {
        for (let j = 1; j <= 5 && i + j < lines.length; j++) {
          const nextLine = lines[i + j];
          const match = nextLine.match(/^(\d+)(\s*[\/\\]\s*20)?$/);
          if (match) {
            const scoreVal = parseInt(match[1], 10);
            if (scoreVal >= 0 && scoreVal <= 20) {
              return match[1];
            }
          }
        }
      }
    }
    return undefined;
  }

  if (data.type === "contractor") {
    data.qualityOfWorkmanship = extractCategoryScore([/QUALITY OF WORKMANSHIP/i, /QUALITÉ DES TRAVAUX EXÉCUTÉS/i]);
    data.time = extractCategoryScore([/TIME/i, /DÉLAI D'EXÉCUTION/i]);
    data.projectManagement = extractCategoryScore([/PROJECT MANAGEMENT/i, /GESTION DU PROJET/i]);
    data.contractManagement = extractCategoryScore([/CONTRACT MANAGEMENT/i, /GESTION DU CONTRAT/i]);
    data.healthAndSafety = extractCategoryScore([/HEALTH AND SAFETY/i, /SANTÉ ET SÉCURITÉ/i]);
  } else {
    data.design = extractCategoryScore([/DESIGN/i, /CONCEPTION/i]);
    data.qualityOfResults = extractCategoryScore([/QUALITY OF RESULTS/i, /QUALITÉ DES RÉSULTATS/i]);
    data.management = extractCategoryScore([/MANAGEMENT/i, /GESTION/i]);
    data.time = extractCategoryScore([/TIME/i, /DÉLAI/i]);
    data.cost = extractCategoryScore([/COST/i, /COÛT/i]);
  }

  // Extract comments
  for (let i = 0; i < lines.length; i++) {
    if (/Comments - Commentaires/i.test(lines[i]) || /Comments/i.test(lines[i])) {
      let commentLines: string[] = [];
      for (let j = 1; j <= 10 && i + j < lines.length; j++) {
        const nextLine = lines[i + j];
        if (
          /Signature|Date|PWGSC|TPSGC|Protected "B"|Total points|Total du pointage/i.test(nextLine) ||
          nextLine.includes("--")
        ) {
          break;
        }
        if (nextLine) {
          commentLines.push(nextLine);
        }
      }
      if (commentLines.length > 0) {
        data.comments = commentLines.join("\n").trim();
      }
      break;
    }
  }

  // Total points
  const totalMatch = text.match(/(?:Total points|Total du pointage)\s*[:\t\n]*\s*(\d+)/i);
  if (totalMatch) {
    data.totalPoints = totalMatch[1];
  } else {
    let sum = 0;
    let count = 0;
    if (data.type === "contractor") {
      const scores = [data.qualityOfWorkmanship, data.time, data.projectManagement, data.contractManagement, data.healthAndSafety];
      scores.forEach(s => {
        if (s) { sum += parseInt(s, 10); count++; }
      });
    } else {
      const scores = [data.design, data.qualityOfResults, data.management, data.time, data.cost];
      scores.forEach(s => {
        if (s) { sum += parseInt(s, 10); count++; }
      });
    }
    if (count > 0) {
      data.totalPoints = String(sum);
    }
  }

  return data;
}
