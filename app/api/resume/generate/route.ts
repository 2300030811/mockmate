import { NextResponse } from 'next/server';
import sparticuzChromium from '@sparticuz/chromium';
import { chromium, type Browser, type BrowserContext } from 'playwright-core';
import path from 'path';
import fs from 'fs/promises';
import { pathToFileURL } from 'url';
import { escapeHtml, sanitizeUrl } from '@/utils/sanitize';
import { resumeGeneratePayloadSchema } from './schema';

export const runtime = 'nodejs';

const DEFAULT_RESUME_PDF_TIMEOUT_MS = 25000;

function getResumePdfTimeoutMs(): number {
  const raw = process.env.RESUME_PDF_TIMEOUT_MS;
  if (!raw) return DEFAULT_RESUME_PDF_TIMEOUT_MS;

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_RESUME_PDF_TIMEOUT_MS;
  }

  return parsed;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  }) as Promise<T>;
}

function getRemainingTimeoutMs(deadline: number, timeoutMessage: string): number {
  const remaining = deadline - Date.now();
  if (remaining <= 0) {
    throw new Error(timeoutMessage);
  }
  return remaining;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasSectionContent(content: string): boolean {
  return content.replace(/<[^>]*>/g, '').trim().length > 0;
}

function renderSection(title: string, content: string, avoidBreak = false): string {
  if (!hasSectionContent(content)) return '';

  const classes = avoidBreak ? 'section avoid-break' : 'section';
  return `
    <div class="${classes}">
      <div class="section-title">${escapeHtml(title)}</div>
      ${content}
    </div>
  `;
}

function compactText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function renderSkillsList(skills: string[]): string {
  if (skills.length === 0) return '';

  return `
    <div class="skills-grid">
      ${skills.map((skill) => `<span class="skill-item">${escapeHtml(skill)}</span>`).join('')}
    </div>
  `;
}

function renderContactRow(input: {
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
}): string {
  const parts: string[] = [];

  if (input.email) {
    parts.push(`<span>${escapeHtml(input.email)}</span>`);
  }

  if (input.phone) {
    parts.push(`<span>${escapeHtml(input.phone)}</span>`);
  }

  if (input.linkedinUrl !== '#') {
    parts.push(`<a href="${input.linkedinUrl}">LinkedIn</a>`);
  }

  if (input.portfolioUrl !== '#') {
    parts.push(`<a href="${input.portfolioUrl}">Portfolio</a>`);
  }

  if (input.location) {
    parts.push(`<span>${escapeHtml(input.location)}</span>`);
  }

  return parts.join('<span class="separator">|</span>');
}

function injectBaseHref(html: string, baseHref: string): string {
  if (/<base\s/i.test(html)) return html;

  const escapedBaseHref = escapeHtml(baseHref);
  return html.replace('<head>', `<head>\n<base href="${escapedBaseHref}">`);
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === '1';
}

function getLocalChromiumExecutablePath(): string | undefined {
  const raw = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (!raw) return undefined;

  const normalized = raw.trim();
  return normalized.length > 0 ? normalized : undefined;
}

async function launchPdfBrowser(): Promise<Browser> {
  if (isVercelRuntime()) {
    return chromium.launch({
      args: sparticuzChromium.args,
      executablePath: await sparticuzChromium.executablePath(),
      headless: true,
    });
  }

  const localExecutablePath = getLocalChromiumExecutablePath();

  return chromium.launch({
    headless: true,
    ...(localExecutablePath ? { executablePath: localExecutablePath } : {}),
  });
}

export async function POST(req: Request) {
  const timeoutMs = getResumePdfTimeoutMs();
  const deadline = Date.now() + timeoutMs;
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const parsedPayload = resumeGeneratePayloadSchema.safeParse(payload);
    if (!parsedPayload.success) {
      return NextResponse.json(
        { error: 'Invalid resume payload.', details: parsedPayload.error.format() },
        { status: 400 }
      );
    }
    const data = parsedPayload.data;

    // 1. Read the template
    const templatePath = path.join(process.cwd(), 'templates', 'resume-base.html');
    const templateBaseUrl = new URL('./', pathToFileURL(templatePath)).href;
    let html = await fs.readFile(templatePath, 'utf-8');

    const linkedinUrl = sanitizeUrl(data.linkedin, '#');
    const portfolioUrl = sanitizeUrl(data.portfolio, '#');
    const email = compactText(data.email || 'email@example.com');
    const phone = compactText(data.phone || '');
    const location = compactText(data.location || 'Remote');

    const experienceItems = data.experience
      .map((experienceItem) => {
        const highlights = (experienceItem.highlights ?? [])
          .map((highlight) => compactText(highlight))
          .filter(Boolean)
          .slice(0, 12);

        const company = compactText(experienceItem.company || '');
        const role = compactText(experienceItem.role || '');
        const period = compactText(experienceItem.period || '');

        if (!company && !role && !period && highlights.length === 0) return '';

        return `
          <div class="job">
            <div class="job-header">
              <span class="job-company">${escapeHtml(company || 'Company')}</span>
              <span class="job-period">${escapeHtml(period)}</span>
            </div>
            <div class="job-role">${escapeHtml(role)}</div>
            ${highlights.length > 0 ? `<ul>${highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('')}</ul>` : ''}
          </div>
        `;
      })
      .filter(Boolean)
      .join('');

    const projectItems = data.projects
      .map((projectItem) => {
        const title = compactText(projectItem.title || '');
        const period = compactText(projectItem.period || '');
        const description = compactText(projectItem.description || '');
        const techStack = (projectItem.techStack ?? [])
          .map((skill) => compactText(skill))
          .filter(Boolean)
          .slice(0, 20);
        const link = sanitizeUrl(projectItem.link || '', '#');

        if (!title && !period && !description && techStack.length === 0 && link === '#') return '';

        const titleMarkup = title
          ? link !== '#'
            ? `<a href="${link}" class="project-title">${escapeHtml(title)}</a>`
            : `<span class="project-title">${escapeHtml(title)}</span>`
          : '';

        return `
          <div class="project">
            <div class="job-header">
              <div>${titleMarkup}</div>
              <span class="job-period">${escapeHtml(period)}</span>
            </div>
            ${description ? `<div class="project-desc">${escapeHtml(description)}</div>` : ''}
            ${techStack.length > 0 ? `<div class="project-tech">Tech: ${techStack.map((skill) => escapeHtml(skill)).join(', ')}</div>` : ''}
          </div>
        `;
      })
      .filter(Boolean)
      .join('');

    const educationItems = data.education
      .map((educationItem) => {
        const program = compactText(educationItem.program || '');
        const institution = compactText(educationItem.institution || '');
        const period = compactText(educationItem.period || '');
        const details = compactText(educationItem.details || '');

        if (!program && !institution && !period && !details) return '';

        return `
          <div class="edu-item">
            <div class="edu-header">
              <div class="edu-title">${escapeHtml(program || 'Program')}</div>
              <div class="edu-year">${escapeHtml(period)}</div>
            </div>
            ${institution ? `<div class="edu-org">${escapeHtml(institution)}</div>` : ''}
            ${details ? `<div class="edu-desc">${escapeHtml(details)}</div>` : ''}
          </div>
        `;
      })
      .filter(Boolean)
      .join('');

    const certificationItems = data.certifications
      .map((certificationItem) => {
        const name = compactText(certificationItem.name || '');
        const issuer = compactText(certificationItem.issuer || '');
        const year = compactText(certificationItem.year || '');

        if (!name && !issuer && !year) return '';

        return `
          <div class="cert-item">
            <div class="cert-title">
              ${escapeHtml(name || 'Certification')}
              ${issuer ? `<span class="cert-org"> - ${escapeHtml(issuer)}</span>` : ''}
            </div>
            <div class="cert-year">${escapeHtml(year)}</div>
          </div>
        `;
      })
      .filter(Boolean)
      .join('');

    const competencyLimit = 18;
    const cleanSkills = data.skills
      .map((skill) => compactText(skill))
      .filter(Boolean)
      .slice(0, 60);

    const additionalSkills = cleanSkills.slice(competencyLimit);

    const competenciesMarkup = cleanSkills
      .slice(0, competencyLimit)
      .map((skill) => `<span class="competency-tag">${escapeHtml(skill)}</span>`)
      .join(' ');

    // 2. Replace placeholders
    const replacements: Record<string, string> = {
      '{{LANG}}': 'en',
      '{{NAME}}': escapeHtml(data.name || 'Candidate Name'),
      '{{PAGE_WIDTH}}': '800px',
      '{{CONTACT_ROW}}': renderContactRow({
        email,
        phone,
        location,
        linkedinUrl,
        portfolioUrl,
      }),

      '{{SUMMARY_SECTION}}': renderSection(
        'Summary',
        `<div class="summary-text">${escapeHtml(data.summary || 'A highly skilled professional...')}</div>`,
        true
      ),
      '{{COMPETENCIES_SECTION}}': renderSection(
        'Core Competencies',
        `<div class="competencies-grid">${competenciesMarkup}</div>`
      ),
      '{{EXPERIENCE_SECTION}}': renderSection('Experience', experienceItems),
      '{{PROJECTS_SECTION}}': renderSection('Projects', projectItems, true),
      '{{EDUCATION_SECTION}}': renderSection('Education', educationItems, true),
      '{{CERTIFICATIONS_SECTION}}': renderSection('Certifications', certificationItems, true),
      '{{SKILLS_SECTION}}': renderSection('Additional Skills', renderSkillsList(additionalSkills), true),
    };

    for (const [key, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(escapeRegExp(key), 'g'), () => value);
    }

    const htmlWithBaseHref = injectBaseHref(html, templateBaseUrl);

    // 3. Generate PDF using Playwright
    browser = await withTimeout(
      launchPdfBrowser(),
      getRemainingTimeoutMs(deadline, 'Timed out launching browser for PDF generation.'),
      'Timed out launching browser for PDF generation.'
    );
    context = await withTimeout(
      browser.newContext({ baseURL: templateBaseUrl }),
      getRemainingTimeoutMs(deadline, 'Timed out creating browser context for PDF generation.'),
      'Timed out creating browser context for PDF generation.'
    );
    const page = await withTimeout(
      context.newPage(),
      getRemainingTimeoutMs(deadline, 'Timed out opening page for PDF generation.'),
      'Timed out opening page for PDF generation.'
    );

    await withTimeout(
      page.setContent(htmlWithBaseHref, { waitUntil: 'networkidle' }),
      getRemainingTimeoutMs(deadline, 'Timed out rendering resume HTML content.'),
      'Timed out rendering resume HTML content.'
    );
    // Wait for fonts to load
    await withTimeout(
      page.evaluate(() => document.fonts.ready),
      getRemainingTimeoutMs(deadline, 'Timed out waiting for resume fonts to load.'),
      'Timed out waiting for resume fonts to load.'
    );

    const pdfBuffer = await withTimeout(
      page.pdf({
        format: 'a4',
        printBackground: true,
        margin: {
          top: '0.6in',
          right: '0.6in',
          bottom: '0.6in',
          left: '0.6in',
        },
      }),
      getRemainingTimeoutMs(deadline, 'Timed out generating resume PDF.'),
      'Timed out generating resume PDF.'
    );

    // 4. Return the PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });

  } catch (error: unknown) {
    console.error('PDF Generation Error:', error);
    const message = error instanceof Error ? error.message : 'Unexpected PDF generation failure.';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (context) {
      try {
        await context.close();
      } catch (closeError) {
        console.error('PDF Context Cleanup Error:', closeError);
      }
    }

    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('PDF Browser Cleanup Error:', closeError);
      }
    }
  }
}
