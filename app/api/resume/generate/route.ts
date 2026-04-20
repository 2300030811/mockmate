import { NextResponse } from 'next/server';
import sparticuzChromium from '@sparticuz/chromium';
import { chromium, type Browser, type BrowserContext } from 'playwright-core';
import path from 'path';
import fs from 'fs/promises';
import { pathToFileURL } from 'url';
import { escapeHtml, sanitizeUrl } from '@/utils/sanitize';
import { resumeGeneratePayloadSchema, type ResumeCustomSectionStyle, type ResumeTemplateId } from './schema';

export const runtime = 'nodejs';

const DEFAULT_RESUME_PDF_TIMEOUT_MS = 25000;

const TEMPLATE_FILE_BY_ID: Record<ResumeTemplateId, string> = {
  base: 'resume-base.html',
  rendercv: 'resume-rendercv.html',
};

type PublicationInput = {
  title: string;
  date: string;
  authors: string;
  venue: string;
  link: string;
};

type CustomSectionInput = {
  title: string;
  style: ResumeCustomSectionStyle;
  entries: string[];
};

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

function renderPublicationsList(publications: PublicationInput[]): string {
  return publications
    .map((publication) => {
      const title = compactText(publication.title || '');
      const date = compactText(publication.date || '');
      const authors = compactText(publication.authors || '');
      const venue = compactText(publication.venue || '');
      const link = sanitizeUrl(publication.link || '', '#');

      if (!title && !date && !authors && !venue && link === '#') return '';

      return `
        <div class="publication-item">
          <div class="job-header">
            <span class="publication-title">${escapeHtml(title || 'Publication')}</span>
            <span class="job-period">${escapeHtml(date)}</span>
          </div>
          ${authors ? `<div class="publication-authors">${escapeHtml(authors)}</div>` : ''}
          ${venue ? `<div class="publication-venue">${escapeHtml(venue)}</div>` : ''}
          ${link !== '#' ? `<a href="${link}" class="publication-link">${escapeHtml(link)}</a>` : ''}
        </div>
      `;
    })
    .filter(Boolean)
    .join('');
}

function renderTechnologiesSplit(languages: string[], technologies: string[]): string {
  const rows: string[] = [];

  if (languages.length > 0) {
    rows.push(
      `<div class="tech-row"><span class="skill-category">Languages:</span> ${languages
        .map((language) => escapeHtml(language))
        .join(', ')}</div>`
    );
  }

  if (technologies.length > 0) {
    rows.push(
      `<div class="tech-row"><span class="skill-category">Technologies:</span> ${technologies
        .map((technology) => escapeHtml(technology))
        .join(', ')}</div>`
    );
  }

  return rows.join('');
}

function renderCustomSections(sections: CustomSectionInput[]): string {
  const seenSectionKeys = new Set<string>();

  return sections
    .map((section) => {
      const title = compactText(section.title || '');
      const entries = (section.entries ?? []).map((entry) => compactText(entry)).filter(Boolean).slice(0, 20);
      if (!title || entries.length === 0) return '';

      const dedupeKey = `${title.toLowerCase()}::${section.style}::${entries
        .map((entry) => entry.toLowerCase())
        .join('||')}`;
      if (seenSectionKeys.has(dedupeKey)) return '';
      seenSectionKeys.add(dedupeKey);

      const content =
        section.style === 'text'
          ? `<div class="custom-text-block">${entries
              .map((entry) => `<p class="custom-text-line">${escapeHtml(entry)}</p>`)
              .join('')}</div>`
          : `<ul>${entries.map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')}</ul>`;

      return renderSection(title, content, true);
    })
    .filter(Boolean)
    .join('');
}

function getContactLinkLabel(url: string, fallbackLabel: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace(/^www\./i, '').toLowerCase();

    if (host.includes('linkedin.com')) return 'LinkedIn';
    if (host.includes('github.com')) return 'GitHub';
    if (host.includes('gitlab.com')) return 'GitLab';
    if (host.includes('behance.net')) return 'Behance';
    if (host.includes('medium.com')) return 'Medium';

    return fallbackLabel;
  } catch {
    return fallbackLabel;
  }
}

function renderContactRow(input: {
  templateId: ResumeTemplateId;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
}): string {
  const parts: string[] = [];

  const pushText = (value: string) => {
    if (value) {
      parts.push(`<span>${escapeHtml(value)}</span>`);
    }
  };

  const pushLink = (url: string, label: string) => {
    if (url !== '#') {
      parts.push(`<a href="${url}">${escapeHtml(label)}</a>`);
    }
  };

  if (input.templateId === 'rendercv') {
    pushText(input.location);
    pushText(input.email);
    pushText(input.phone);
    pushLink(input.portfolioUrl, getContactLinkLabel(input.portfolioUrl, 'Portfolio'));
    pushLink(input.linkedinUrl, getContactLinkLabel(input.linkedinUrl, 'LinkedIn'));

    return parts.join('<span class="separator">|</span>');
  }

  pushText(input.email);
  pushText(input.phone);
  pushLink(input.linkedinUrl, 'LinkedIn');
  pushLink(input.portfolioUrl, 'Portfolio');
  pushText(input.location);

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
    const templateFilename = TEMPLATE_FILE_BY_ID[data.templateId];
    const templatePath = path.join(process.cwd(), 'templates', templateFilename);
    const templateBaseUrl = new URL('./', pathToFileURL(templatePath)).href;
    let html = await fs.readFile(templatePath, 'utf-8');

    const linkedinUrl = sanitizeUrl(data.linkedin, '#');
    const portfolioUrl = sanitizeUrl(data.portfolio, '#');
    const email = compactText(data.email || '');
    const phone = compactText(data.phone || '');
    const location = compactText(data.location || '');

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

    const cleanLanguages = data.languages
      .map((language) => compactText(language))
      .filter(Boolean)
      .slice(0, 30);

    const cleanTechnologies = data.technologies
      .map((technology) => compactText(technology))
      .filter(Boolean)
      .slice(0, 40);

    const publicationItems = renderPublicationsList(data.publications);
    const customSectionsMarkup = renderCustomSections(data.customSections);

    if (cleanLanguages.length === 0 && cleanTechnologies.length === 0 && cleanSkills.length > 0) {
      cleanTechnologies.push(...cleanSkills.slice(0, 20));
    }

    const additionalSkills = cleanSkills.slice(competencyLimit);

    const competenciesMarkup = cleanSkills
      .slice(0, competencyLimit)
      .map((skill) => `<span class="competency-tag">${escapeHtml(skill)}</span>`)
      .join(' ');

    const skillsSectionTitle = data.templateId === 'rendercv' ? 'Skills' : 'Additional Skills';
    const skillsForSection = data.templateId === 'rendercv' ? cleanSkills : additionalSkills;
    const shouldRenderSkillsSection =
      data.templateId === 'rendercv' ? cleanLanguages.length === 0 && cleanTechnologies.length === 0 : true;

    // 2. Replace placeholders
    const replacements: Record<string, string> = {
      '{{LANG}}': 'en',
      '{{NAME}}': escapeHtml(data.name || 'Candidate Name'),
      '{{PAGE_WIDTH}}': data.templateId === 'rendercv' ? '645px' : '800px',
      '{{CONTACT_ROW}}': renderContactRow({
        templateId: data.templateId,
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
      '{{PUBLICATIONS_SECTION}}': renderSection('Publications', publicationItems, true),
      '{{TECHNOLOGIES_SECTION}}': renderSection(
        'Technologies',
        renderTechnologiesSplit(cleanLanguages, cleanTechnologies),
        true
      ),
      '{{SKILLS_SECTION}}': shouldRenderSkillsSection
        ? renderSection(skillsSectionTitle, renderSkillsList(skillsForSection), true)
        : '',
      '{{CUSTOM_SECTIONS}}': customSectionsMarkup,
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

    const pdfMargins =
      data.templateId === 'rendercv'
        ? {
            top: '0.79in',
            right: '0.79in',
            bottom: '0.79in',
            left: '0.79in',
          }
        : {
            top: '0.6in',
            right: '0.6in',
            bottom: '0.6in',
            left: '0.6in',
          };

    const pdfBuffer = await withTimeout(
      page.pdf({
        format: 'a4',
        printBackground: true,
        margin: pdfMargins,
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
