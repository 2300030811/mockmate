/**
 * Pure parsing and cleaning utilities for KLU placement report extraction.
 * Deterministic, zero-AI, 0 new dependencies.
 */

export interface PlacementAuditRecord {
  sno: number;
  source_page: number;
  source_row: number;
  raw_company: string;
  cleaned_company: string;
  normalized_company: string;
  drive_name: string;
  role_title: string | null;
  raw_date: string;
  date_of_visit: string | null;
  raw_package_text: string;
  package_min_lpa: number | null;
  package_max_lpa: number | null;
  package_values: number[];
  warnings: string[];
  requires_review: boolean;
}

/**
 * Strips non-alphanumeric characters and lowercases for company deduplication.
 */
export function normalizeCompanyName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Cleans watermark artifacts and normalizes whitespace in raw cell text.
 */
export function cleanWatermarks(str: string): string {
  return str
    .replace(/:unselected:/gi, "")
    .replace(/:selected:/gi, "")
    .trim();
}

/**
 * Cleans raw company strings, filters institutional watermarks,
 * de-hyphenates line wraps, and extracts role / drive names.
 */
export function cleanCompanyName(raw: string): {
  cleanedCompany: string;
  driveName: string;
  roleTitle: string | null;
  warnings: string[];
} {
  const warnings: string[] = [];
  let text = cleanWatermarks(raw);

  // Split lines and filter out pure watermark lines
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((line) => {
      // Filter standalone watermark lines: KLUS, Y23 B, V.2.33 B, Student, 2023-2027, 2023, 27
      if (/^(KLUS|Y23\s*B|V\.2\.33\s*B|Student|2023-2027|2023|27)$/i.test(line)) {
        warnings.push(`Filtered watermark line: "${line}"`);
        return false;
      }
      return line.length > 0;
    });

  let merged = lines.join(" ");

  // Remove leading/trailing watermark artifacts
  if (/^KLUS\s+/i.test(merged)) {
    warnings.push("Removed leading KLUS watermark");
    merged = merged.replace(/^KLUS\s+/i, "");
  }
  if (/\s+LUS$/i.test(merged)) {
    warnings.push("Removed trailing LUS watermark");
    merged = merged.replace(/\s+LUS$/i, "");
  }
  if (/^Student\s+/i.test(merged)) {
    warnings.push("Removed leading Student watermark");
    merged = merged.replace(/^Student\s+/i, "");
  }
  if (/^2023\s+/i.test(merged)) {
    warnings.push("Removed leading 2023 watermark");
    merged = merged.replace(/^2023\s+/i, "");
  }

  // De-hyphenate broken words across line wraps (e.g. "Program- mer" -> "Programmer", "In- dia" -> "India")
  if (/(\w+)-\s+(\w+)/.test(merged)) {
    warnings.push("De-hyphenated line-break word");
    merged = merged.replace(/(\w+)-\s+(\w+)/g, "$1$2");
  }

  // Handle OCR line duplications (e.g. "India Pvt. Ltd. Arshith Fresh India Pvt. Ltd.")
  if (/^India Pvt\. Ltd\.\s+(Arshith Fresh India Pvt\. Ltd\.)$/i.test(merged)) {
    warnings.push("Removed duplicate leading phrase in company name");
    merged = "Arshith Fresh India Pvt. Ltd.";
  }

  merged = merged.replace(/\s+/g, " ").trim();

  const driveName = merged;
  let cleanedCompany = merged;
  let roleTitle: string | null = null;

  // Check for known parenthetical roles / suffixes
  const parenMatch = merged.match(/^(.+?)\s*\((.+?)\)$/);
  if (parenMatch) {
    const main = parenMatch[1].trim();
    const parenContent = parenMatch[2].trim();

    if (/Specialist Programmer/i.test(parenContent)) {
      cleanedCompany = main;
      roleTitle = "Specialist Programmer";
    } else if (/Women/i.test(parenContent)) {
      cleanedCompany = main;
      // driveName preserves "Infosys (Women)"
    } else if (/Domicile Hiring/i.test(parenContent)) {
      cleanedCompany = main;
      // driveName preserves "HCL Tech (Domicile Hiring)"
    }
  }

  return {
    cleanedCompany,
    driveName,
    roleTitle,
    warnings,
  };
}

/**
 * Parses raw date string into ISO date string (YYYY-MM-DD).
 * Cleans date watermarks like Co / C0 prefixes and trailing characters.
 */
export function parsePlacementDate(raw: string): {
  isoDate: string | null;
  warning?: string;
} {
  const cleaned = cleanWatermarks(raw);
  // Match DD-MM-YYYY or DD/MM/YYYY pattern anywhere in the string
  const match = cleaned.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
  if (!match) {
    return { isoDate: null, warning: `Unparseable date: "${raw}"` };
  }

  const day = match[1];
  const month = match[2];
  const year = match[3];
  const isoDate = `${year}-${month}-${day}`;

  const d = new Date(isoDate);
  if (isNaN(d.getTime())) {
    return { isoDate: null, warning: `Invalid calendar date: "${isoDate}"` };
  }

  let warning: string | undefined;
  if (cleaned !== `${day}-${month}-${year}`) {
    warning = `Cleaned date "${raw}" -> "${isoDate}"`;
  }

  return { isoDate, warning };
}

/**
 * Parses raw package strings into numeric LPA boundaries and values.
 * Handles "6.3 LPA", "4 to 6 LPA", "3.6, 6.25, 9.5 LPA", and strips trailing watermark digits.
 */
export function parsePlacementPackage(raw: string): {
  min: number | null;
  max: number | null;
  values: number[];
  raw: string;
  warning?: string;
} {
  const cleaned = cleanWatermarks(raw);
  let warning: string | undefined;

  // Extract the text portion before "LPA" (allowing &, and, to, commas, hyphens)
  const lpaMatch = cleaned.match(/([\d.,\s&/\-]|(?:\bto\b)|(?:\band\b))+\s*LPA/i);
  const targetText = lpaMatch ? lpaMatch[0].replace(/\s*LPA/i, "") : cleaned;

  // If there were extra trailing characters after LPA (like the '7' from watermark '2023 27')
  const fullMatch = cleaned.match(/.*?\bLPA\b/i);
  if (fullMatch && cleaned.length > fullMatch[0].length + 1) {
    warning = `Filtered trailing package watermark tokens from "${raw}"`;
  }

  const numMatches = targetText.match(/(\d+(?:\.\d+)?)/g);
  if (!numMatches || numMatches.length === 0) {
    return {
      min: null,
      max: null,
      values: [],
      raw: cleaned,
      warning: `No numeric LPA found in "${raw}"`,
    };
  }

  const values = numMatches.map(Number);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    min,
    max,
    values,
    raw: cleaned,
    warning,
  };
}

/**
 * Transforms a raw 4-cell table row into a fully validated PlacementAuditRecord.
 */
export function processRawRow(
  rawSno: string,
  rawCompany: string,
  rawDate: string,
  rawPackage: string,
  page: number,
  tableRow: number
): PlacementAuditRecord {
  const sno = parseInt(rawSno.replace(/\D/g, ""), 10) || tableRow;
  const warnings: string[] = [];

  const companyResult = cleanCompanyName(rawCompany);
  warnings.push(...companyResult.warnings);

  const dateResult = parsePlacementDate(rawDate);
  if (dateResult.warning) warnings.push(dateResult.warning);

  const packageResult = parsePlacementPackage(rawPackage);
  if (packageResult.warning) warnings.push(packageResult.warning);

  const requiresReview =
    !dateResult.isoDate ||
    packageResult.min === null ||
    companyResult.cleanedCompany.length === 0;

  return {
    sno,
    source_page: page,
    source_row: tableRow,
    raw_company: rawCompany,
    cleaned_company: companyResult.cleanedCompany,
    normalized_company: normalizeCompanyName(companyResult.cleanedCompany),
    drive_name: companyResult.driveName,
    role_title: companyResult.roleTitle,
    raw_date: rawDate,
    date_of_visit: dateResult.isoDate,
    raw_package_text: packageResult.raw,
    package_min_lpa: packageResult.min,
    package_max_lpa: packageResult.max,
    package_values: packageResult.values,
    warnings,
    requires_review: requiresReview,
  };
}
