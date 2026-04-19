import { NextResponse } from 'next/server';
import { chromium, type Browser } from 'playwright';
import path from 'path';
import fs from 'fs/promises';
import { escapeHtml, sanitizeUrl } from '@/utils/sanitize';
import { resumeGeneratePayloadSchema } from './schema';

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

export async function POST(req: Request) {
  const timeoutMs = getResumePdfTimeoutMs();
  let browser: Browser | null = null;

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
    let html = await fs.readFile(templatePath, 'utf-8');

    const linkedinUrl = sanitizeUrl(data.linkedin, '#');
    const portfolioUrl = sanitizeUrl(data.portfolio, '#');

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

    const cleanSkills = data.skills
      .map((skill) => compactText(skill))
      .filter(Boolean)
      .slice(0, 60);

    const competenciesMarkup = cleanSkills
      .slice(0, 18)
      .map((skill) => `<span class="competency-tag">${escapeHtml(skill)}</span>`)
      .join(' ');

    // 2. Replace placeholders
    const replacements: Record<string, string> = {
      '{{LANG}}': 'en',
      '{{NAME}}': escapeHtml(data.name || 'Candidate Name'),
      '{{PAGE_WIDTH}}': '800px',
      '{{EMAIL}}': escapeHtml(data.email || 'email@example.com'),
      '{{LINKEDIN_URL}}': linkedinUrl,
      '{{LINKEDIN_DISPLAY}}': linkedinUrl === '#' ? '' : 'LinkedIn',
      '{{PORTFOLIO_URL}}': portfolioUrl,
      '{{PORTFOLIO_DISPLAY}}': portfolioUrl === '#' ? '' : 'Portfolio',
      '{{LOCATION}}': escapeHtml(data.location || 'Remote'),

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
      '{{SKILLS_SECTION}}': renderSection('Skills', renderSkillsList(cleanSkills), true),
    };

    for (const [key, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(key, 'g'), value);
    }

    // 3. Generate PDF using Playwright
    browser = await withTimeout(
      chromium.launch({ headless: true }),
      timeoutMs,
      'Timed out launching browser for PDF generation.'
    );
    const page = await withTimeout(
      browser.newPage(),
      timeoutMs,
      'Timed out opening page for PDF generation.'
    );

    await withTimeout(
      page.setContent(html, { waitUntil: 'networkidle' }),
      timeoutMs,
      'Timed out rendering resume HTML content.'
    );
    // Wait for fonts to load
    await withTimeout(
      page.evaluate(() => document.fonts.ready),
      timeoutMs,
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
      timeoutMs,
      'Timed out generating resume PDF.'
    );

    // 4. Return the PDF
    return new NextResponse(pdfBuffer, {
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
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('PDF Browser Cleanup Error:', closeError);
      }
    }
  }
}
