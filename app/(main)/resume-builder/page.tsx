"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import {
  Award,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  GraduationCap,
  ListChecks,

  Plus,
  Sparkles,
  Trash2,
  TriangleAlert,
  Upload,
  Wand2,
  X,
  MessageSquareText,
} from "lucide-react";
import { parseResumeAction } from "@/app/actions/resume";
import { generateCoverLetterAction, generateOutreachMessageAction } from "@/app/actions/cover-letter";
import { processWizardTurnAction } from "@/app/actions/resume-wizard";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { PaginatedPreview } from "@/components/resume-preview/paginated-preview";

type ExperienceDraft = {
  id: string;
  company: string;
  role: string;
  period: string;
  highlightsText: string;
};

type ProjectDraft = {
  id: string;
  title: string;
  period: string;
  description: string;
  link: string;
  techStackText: string;
};

type EducationDraft = {
  id: string;
  program: string;
  institution: string;
  period: string;
  details: string;
};

type CertificationDraft = {
  id: string;
  name: string;
  issuer: string;
  year: string;
};

type ResumeTemplateId = "base" | "rendercv";

type PublicationDraft = {
  id: string;
  title: string;
  date: string;
  authors: string;
  venue: string;
  link: string;
};

type CustomSectionStyle = "bullets" | "text";

type CustomSectionDraft = {
  id: string;
  title: string;
  style: CustomSectionStyle;
  entriesText: string;
};

const TEMPLATE_OPTIONS: Array<{ id: ResumeTemplateId; label: string; description: string }> = [
  {
    id: "base",
    label: "Modern Gradient",
    description: "Current template with color accents and compact badges.",
  },
  {
    id: "rendercv",
    label: "RenderCV Classic",
    description: "Overleaf-inspired professional layout with ruled sections.",
  },
];

const RESUME_DRAFT_STORAGE_KEY = "resume-builder-draft-v1";
const MAX_EXPERIENCE_ITEMS = 8;
const MAX_PROJECT_ITEMS = 8;
const MAX_EDUCATION_ITEMS = 6;
const MAX_CERTIFICATION_ITEMS = 10;

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 160;
const MAX_PHONE_LENGTH = 40;
const MAX_LINKEDIN_LENGTH = 300;
const MAX_PORTFOLIO_LENGTH = 300;
const MAX_LOCATION_LENGTH = 120;
const MAX_SUMMARY_LENGTH = 2500;
const MAX_SKILL_LENGTH = 80;
const MAX_SKILLS = 60;
const MAX_LANGUAGE_ITEMS = 30;
const MAX_TECHNOLOGY_ITEMS = 40;

const MAX_EXPERIENCE_COMPANY_LENGTH = 120;
const MAX_EXPERIENCE_ROLE_LENGTH = 120;
const MAX_EXPERIENCE_PERIOD_LENGTH = 80;
const MAX_EXPERIENCE_HIGHLIGHT_LENGTH = 300;

const MAX_PROJECT_TITLE_LENGTH = 120;
const MAX_PROJECT_PERIOD_LENGTH = 80;
const MAX_PROJECT_DESCRIPTION_LENGTH = 500;
const MAX_PROJECT_LINK_LENGTH = 300;
const MAX_PROJECT_TECHSTACK_LENGTH = 80;
const MAX_PROJECT_TECHSTACK_ITEMS = 20;

const MAX_EDUCATION_PROGRAM_LENGTH = 140;
const MAX_EDUCATION_INSTITUTION_LENGTH = 140;
const MAX_EDUCATION_PERIOD_LENGTH = 80;
const MAX_EDUCATION_DETAILS_LENGTH = 300;

const MAX_CERTIFICATION_NAME_LENGTH = 140;
const MAX_CERTIFICATION_ISSUER_LENGTH = 140;
const MAX_CERTIFICATION_YEAR_LENGTH = 20;

const MAX_PUBLICATION_ITEMS = 10;
const MAX_PUBLICATION_TITLE_LENGTH = 180;
const MAX_PUBLICATION_DATE_LENGTH = 80;
const MAX_PUBLICATION_AUTHORS_LENGTH = 320;
const MAX_PUBLICATION_VENUE_LENGTH = 180;
const MAX_PUBLICATION_LINK_LENGTH = 300;

const MAX_CUSTOM_SECTIONS = 6;
const MAX_CUSTOM_SECTION_TITLE_LENGTH = 80;
const MAX_CUSTOM_SECTION_ENTRY_LENGTH = 400;
const MAX_CUSTOM_SECTION_ENTRIES = 20;

const EMPTY_EXPERIENCE: Omit<ExperienceDraft, "id"> = {
  company: "",
  role: "",
  period: "",
  highlightsText: "",
};

const EMPTY_PROJECT: Omit<ProjectDraft, "id"> = {
  title: "",
  period: "",
  description: "",
  link: "",
  techStackText: "",
};

const EMPTY_EDUCATION: Omit<EducationDraft, "id"> = {
  program: "",
  institution: "",
  period: "",
  details: "",
};

const EMPTY_CERTIFICATION: Omit<CertificationDraft, "id"> = {
  name: "",
  issuer: "",
  year: "",
};

const EMPTY_PUBLICATION: Omit<PublicationDraft, "id"> = {
  title: "",
  date: "",
  authors: "",
  venue: "",
  link: "",
};

const EMPTY_CUSTOM_SECTION: Omit<CustomSectionDraft, "id"> = {
  title: "",
  style: "bullets",
  entriesText: "",
};

type ResumeGeneratePayload = {
  templateId: ResumeTemplateId;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  location: string;
  summary: string;
  skills: string[];
  languages: string[];
  technologies: string[];
  experience: Array<{
    company: string;
    role: string;
    period: string;
    highlights: string[];
  }>;
  projects: Array<{
    title: string;
    period: string;
    description: string;
    link: string;
    techStack: string[];
  }>;
  education: Array<{
    program: string;
    institution: string;
    period: string;
    details: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  publications: Array<{
    title: string;
    date: string;
    authors: string;
    venue: string;
    link: string;
  }>;
  customSections: Array<{
    title: string;
    style: CustomSectionStyle;
    entries: string[];
  }>;
};

type ResumeBuilderDraft = {
  templateId: ResumeTemplateId;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  location: string;
  summary: string;
  skillsInput: string;
  languagesInput: string;
  technologiesInput: string;
  experiences: ExperienceDraft[];
  projects: ProjectDraft[];
  education: EducationDraft[];
  certifications: CertificationDraft[];
  publications: PublicationDraft[];
  customSections: CustomSectionDraft[];
};

const SAMPLE_DRAFT: ResumeBuilderDraft = {
  templateId: "rendercv",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone: "+91 98765 43210",
  linkedin: "https://linkedin.com/in/alex-johnson",
  portfolio: "https://alex-builds.dev",
  location: "Bengaluru, India",
  summary:
    "Product-focused full stack engineer with 5+ years shipping SaaS platforms end-to-end. Strong in TypeScript, React, and backend architecture with a track record of improving performance, reliability, and developer velocity.",
  skillsInput:
    "TypeScript, React, Next.js, Node.js, PostgreSQL, Supabase, Redis, Playwright, Tailwind CSS, API Design",
  languagesInput: "TypeScript, JavaScript, SQL, Python",
  technologiesInput: "Next.js, React, Node.js, PostgreSQL, Supabase, Redis, Playwright",
  experiences: [
    {
      id: "sample-exp-1",
      company: "NovaStack",
      role: "Senior Software Engineer",
      period: "Jan 2023 - Present",
      highlightsText:
        "Reduced API response latency by 42% through query optimization and caching.\nLed migration from pages router to app router, improving release cycle speed by 30%.\nMentored 4 engineers and introduced testing standards that cut production regressions by 35%.",
    },
    {
      id: "sample-exp-2",
      company: "BlueOrbit Labs",
      role: "Software Engineer",
      period: "Jul 2020 - Dec 2022",
      highlightsText:
        "Built a role-based dashboard used by 20k+ monthly active users.\nImplemented CI quality gates and cut hotfix volume by 28%.\nCollaborated with product and design to ship a new onboarding flow increasing activation by 18%.",
    },
  ],
  projects: [
    {
      id: "sample-project-1",
      title: "Mock Interview Arena",
      period: "2025",
      description:
        "Designed and shipped a competitive mock interview platform with real-time scoring and session analytics.",
      link: "https://github.com/example/mock-interview-arena",
      techStackText: "Next.js, TypeScript, Supabase, Framer Motion",
    },
  ],
  education: [
    {
      id: "sample-education-1",
      program: "B.Tech in Computer Science",
      institution: "RV College of Engineering",
      period: "2016 - 2020",
      details: "Graduated with distinction. Focused on distributed systems and software engineering.",
    },
  ],
  certifications: [
    {
      id: "sample-cert-1",
      name: "AWS Certified Solutions Architect - Associate",
      issuer: "Amazon Web Services",
      year: "2024",
    },
  ],
  publications: [
    {
      id: "sample-publication-1",
      title: "Scaling Session-Aware Learning Platforms with Event-Driven Analytics",
      date: "Sep 2024",
      authors: "A. Johnson, S. Rao",
      venue: "Engineering Systems Journal",
      link: "https://doi.org/10.1109/TASC.2023.3340648",
    },
  ],
  customSections: [
    {
      id: "sample-custom-1",
      title: "Leadership",
      style: "bullets",
      entriesText:
        "Led a cross-functional team of 6 engineers for a migration initiative.\nCreated onboarding playbooks that reduced new-hire ramp-up time by 35%.",
    },
  ],
};

function toLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function toSkills(value: string): string[] {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function clampText(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function sanitizeFilenamePart(value: string): string {
  const cleaned = value.trim().replace(/[^a-zA-Z0-9_-]+/g, "-");
  return cleaned.replace(/-+/g, "-").replace(/^-|-$/g, "") || "resume";
}

function textOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeTemplateId(value: unknown): ResumeTemplateId {
  return value === "rendercv" ? "rendercv" : "base";
}

function createDraftId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function draftIdOrNew(value: unknown): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  return createDraftId();
}

function draftTimestampLabel(value: Date | null): string {
  if (!value) return "Not saved yet";
  return `Saved ${value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function counterTone(current: number, max: number): string {
  if (current > max) return "text-rose-600 dark:text-rose-300";
  if (current >= Math.floor(max * 0.9)) return "text-amber-600 dark:text-amber-300";
  return "text-gray-400 dark:text-gray-500";
}

function moveItemInArray<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;

  const clone = [...items];
  const [moved] = clone.splice(index, 1);
  clone.splice(nextIndex, 0, moved);
  return clone;
}

function previewSnippet(value: string, max: number): string {
  const normalized = value.trim();
  if (normalized.length <= max) return normalized;

  const truncated = normalized.slice(0, max).trimEnd();
  const lastSpace = truncated.lastIndexOf(" ");
  const safeWordBoundary = Math.floor(max * 0.8);
  const boundaryAware = lastSpace > safeWordBoundary ? truncated.slice(0, lastSpace) : truncated;

  return `${boundaryAware.trimEnd()}...`;
}

function hasExperienceContent(item: ExperienceDraft): boolean {
  return Boolean(
    item.company.trim() || item.role.trim() || item.period.trim() || toLines(item.highlightsText).length > 0
  );
}

function hasProjectContent(item: ProjectDraft): boolean {
  return Boolean(
    item.title.trim() ||
      item.period.trim() ||
      item.description.trim() ||
      item.link.trim() ||
      toSkills(item.techStackText).length > 0
  );
}

function hasEducationContent(item: EducationDraft): boolean {
  return Boolean(item.program.trim() || item.institution.trim() || item.period.trim() || item.details.trim());
}

function hasCertificationContent(item: CertificationDraft): boolean {
  return Boolean(item.name.trim() || item.issuer.trim() || item.year.trim());
}

function hasPublicationContent(item: PublicationDraft): boolean {
  return Boolean(
    item.title.trim() || item.date.trim() || item.authors.trim() || item.venue.trim() || item.link.trim()
  );
}

function customSectionEntries(value: string): string[] {
  return toLines(value)
    .map((entry) => clampText(entry, MAX_CUSTOM_SECTION_ENTRY_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_CUSTOM_SECTION_ENTRIES);
}

function hasCustomSectionContent(item: CustomSectionDraft): boolean {
  return Boolean(item.title.trim() && customSectionEntries(item.entriesText).length > 0);
}

function extractFirstZodError(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;

  const stack: unknown[] = [details];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;

    if (Array.isArray(current)) {
      for (let i = 0; i < current.length; i++) {
        stack.push(current[i]);
      }
      continue;
    }

    const record = current as Record<string, unknown>;
    const errors = record._errors;
    if (Array.isArray(errors)) {
      const firstString = errors.find((value): value is string => typeof value === "string" && value.length > 0);
      if (firstString) return firstString;
    }

    for (const value of Object.values(record)) {
      stack.push(value);
    }
  }

  return null;
}

export default function ResumeBuilderPage() {
  const [templateId, setTemplateId] = useState<ResumeTemplateId>("base");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [technologiesInput, setTechnologiesInput] = useState("");

  const [experiences, setExperiences] = useState<ExperienceDraft[]>([
    { id: createDraftId(), ...EMPTY_EXPERIENCE },
  ]);
  const [projects, setProjects] = useState<ProjectDraft[]>([{ id: createDraftId(), ...EMPTY_PROJECT }]);
  const [education, setEducation] = useState<EducationDraft[]>([
    { id: createDraftId(), ...EMPTY_EDUCATION },
  ]);
  const [certifications, setCertifications] = useState<CertificationDraft[]>([
    { id: createDraftId(), ...EMPTY_CERTIFICATION },
  ]);
  const [publications, setPublications] = useState<PublicationDraft[]>([
    { id: createDraftId(), ...EMPTY_PUBLICATION },
  ]);
  const [customSections, setCustomSections] = useState<CustomSectionDraft[]>([
    { id: createDraftId(), ...EMPTY_CUSTOM_SECTION },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isTailoringModalOpen, setIsTailoringModalOpen] = useState(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [clJobDescription, setClJobDescription] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [generatedOutreach, setGeneratedOutreach] = useState("");
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  
  const [isWizardModalOpen, setIsWizardModalOpen] = useState(false);
  const [wizardMessages, setWizardMessages] = useState<{role: 'ai'|'user', content: string}[]>([
    { role: 'ai', content: "Hi! I'm your resume building assistant. Let's build your master resume. What's your name, and what kind of role are you targeting?" }
  ]);
  const [wizardInput, setWizardInput] = useState("");
  const [currentWizardSection, setCurrentWizardSection] = useState("intro");
  const [isWizardLoading, setIsWizardLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [jobDescription, setJobDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(RESUME_DRAFT_STORAGE_KEY);
      if (!rawDraft) {
        setIsDraftReady(true);
        return;
      }

      const parsed = JSON.parse(rawDraft) as Partial<ResumeBuilderDraft>;

      setTemplateId(normalizeTemplateId(parsed.templateId));

      setName(textOrEmpty(parsed.name));
      setEmail(textOrEmpty(parsed.email));
      setPhone(textOrEmpty(parsed.phone));
      setLinkedin(textOrEmpty(parsed.linkedin));
      setPortfolio(textOrEmpty(parsed.portfolio));
      setLocation(textOrEmpty(parsed.location));
      setSummary(textOrEmpty(parsed.summary));
      setSkillsInput(textOrEmpty(parsed.skillsInput));
      setLanguagesInput(textOrEmpty(parsed.languagesInput));
      setTechnologiesInput(textOrEmpty(parsed.technologiesInput));

      if (Array.isArray(parsed.experiences) && parsed.experiences.length > 0) {
        setExperiences(
          parsed.experiences.map((item) => ({
            id: draftIdOrNew(item?.id),
            company: textOrEmpty(item?.company),
            role: textOrEmpty(item?.role),
            period: textOrEmpty(item?.period),
            highlightsText: textOrEmpty(item?.highlightsText),
          }))
        );
      }

      if (Array.isArray(parsed.projects) && parsed.projects.length > 0) {
        setProjects(
          parsed.projects.map((item) => ({
            id: draftIdOrNew(item?.id),
            title: textOrEmpty(item?.title),
            period: textOrEmpty(item?.period),
            description: textOrEmpty(item?.description),
            link: textOrEmpty(item?.link),
            techStackText: textOrEmpty(item?.techStackText),
          }))
        );
      }

      if (Array.isArray(parsed.education) && parsed.education.length > 0) {
        setEducation(
          parsed.education.map((item) => ({
            id: draftIdOrNew(item?.id),
            program: textOrEmpty(item?.program),
            institution: textOrEmpty(item?.institution),
            period: textOrEmpty(item?.period),
            details: textOrEmpty(item?.details),
          }))
        );
      }

      if (Array.isArray(parsed.certifications) && parsed.certifications.length > 0) {
        setCertifications(
          parsed.certifications.map((item) => ({
            id: draftIdOrNew(item?.id),
            name: textOrEmpty(item?.name),
            issuer: textOrEmpty(item?.issuer),
            year: textOrEmpty(item?.year),
          }))
        );
      }

      if (Array.isArray(parsed.publications) && parsed.publications.length > 0) {
        setPublications(
          parsed.publications.map((item) => ({
            id: draftIdOrNew(item?.id),
            title: textOrEmpty(item?.title),
            date: textOrEmpty(item?.date),
            authors: textOrEmpty(item?.authors),
            venue: textOrEmpty(item?.venue),
            link: textOrEmpty(item?.link),
          }))
        );
      }

      if (Array.isArray(parsed.customSections) && parsed.customSections.length > 0) {
        setCustomSections(
          parsed.customSections.map((item) => ({
            id: draftIdOrNew(item?.id),
            title: textOrEmpty(item?.title),
            style: item?.style === "text" ? "text" : "bullets",
            entriesText: textOrEmpty(item?.entriesText),
          }))
        );
      }

      setLastSavedAt(new Date());
    } catch {
      localStorage.removeItem(RESUME_DRAFT_STORAGE_KEY);
    } finally {
      setIsDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isDraftReady) return;

    const timeoutId = window.setTimeout(() => {
      const draft: ResumeBuilderDraft = {
        templateId,
        name,
        email,
        phone,
        linkedin,
        portfolio,
        location,
        summary,
        skillsInput,
        languagesInput,
        technologiesInput,
        experiences,
        projects,
        education,
        certifications,
        publications,
        customSections,
      };

      localStorage.setItem(RESUME_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setLastSavedAt(new Date());
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [
    templateId,
    name,
    email,
    phone,
    linkedin,
    portfolio,
    location,
    summary,
    skillsInput,
    languagesInput,
    technologiesInput,
    experiences,
    projects,
    education,
    certifications,
    publications,
    customSections,
    isDraftReady,
  ]);

  const setDraft = (data: any) => {
    setName(data.name || name);
    setEmail(data.email || email);
    setPhone(data.phone || phone);
    setLocation(data.location || location);
    setLinkedin(data.linkedin || linkedin);
    setPortfolio(data.portfolio || portfolio);
    setSummary(data.summary || summary);
    setSkillsInput(Array.isArray(data.skills) ? data.skills.join(", ") : skillsInput);
    setLanguagesInput(Array.isArray(data.languages) ? data.languages.join(", ") : languagesInput);
    setTechnologiesInput(Array.isArray(data.technologies) ? data.technologies.join(", ") : technologiesInput);
  };

  const parsedSkills = useMemo(
    () =>
      toSkills(skillsInput)
        .map((skill) => clampText(skill, MAX_SKILL_LENGTH))
        .filter(Boolean)
        .slice(0, MAX_SKILLS),
    [skillsInput]
  );

  const parsedLanguages = useMemo(
    () =>
      toSkills(languagesInput)
        .map((language) => clampText(language, MAX_SKILL_LENGTH))
        .filter(Boolean)
        .slice(0, MAX_LANGUAGE_ITEMS),
    [languagesInput]
  );

  const parsedTechnologies = useMemo(
    () =>
      toSkills(technologiesInput)
        .map((technology) => clampText(technology, MAX_SKILL_LENGTH))
        .filter(Boolean)
        .slice(0, MAX_TECHNOLOGY_ITEMS),
    [technologiesInput]
  );

  const skillCount = parsedSkills.length;
  const languageCount = parsedLanguages.length;
  const technologyCount = parsedTechnologies.length;
  const experienceCount = useMemo(
    () => experiences.filter((item) => hasExperienceContent(item)).length,
    [experiences]
  );
  const projectCount = useMemo(() => projects.filter((item) => hasProjectContent(item)).length, [projects]);
  const educationCount = useMemo(() => education.filter((item) => hasEducationContent(item)).length, [education]);
  const certificationCount = useMemo(
    () => certifications.filter((item) => hasCertificationContent(item)).length,
    [certifications]
  );
  const publicationCount = useMemo(
    () => publications.filter((item) => hasPublicationContent(item)).length,
    [publications]
  );
  const customSectionCount = useMemo(
    () => customSections.filter((item) => hasCustomSectionContent(item)).length,
    [customSections]
  );

  const previewExperiences = useMemo(
    () => experiences.filter((item) => hasExperienceContent(item)).slice(0, 2),
    [experiences]
  );
  const previewProjects = useMemo(
    () => projects.filter((item) => hasProjectContent(item)).slice(0, 2),
    [projects]
  );
  const previewEducation = useMemo(
    () => education.filter((item) => hasEducationContent(item)).slice(0, 1),
    [education]
  );
  const previewCertifications = useMemo(
    () => certifications.filter((item) => hasCertificationContent(item)).slice(0, 2),
    [certifications]
  );
  const previewPublications = useMemo(
    () => publications.filter((item) => hasPublicationContent(item)).slice(0, 2),
    [publications]
  );
  const previewCustomSections = useMemo(
    () => customSections.filter((item) => hasCustomSectionContent(item)).slice(0, 2),
    [customSections]
  );

  const previewExperienceItems = useMemo(
    () =>
      previewExperiences.map((item) => ({
        company: clampText(item.company, MAX_EXPERIENCE_COMPANY_LENGTH),
        role: clampText(item.role, MAX_EXPERIENCE_ROLE_LENGTH),
        period: clampText(item.period, MAX_EXPERIENCE_PERIOD_LENGTH),
        highlights: toLines(item.highlightsText)
          .map((line) => clampText(line, MAX_EXPERIENCE_HIGHLIGHT_LENGTH))
          .filter(Boolean)
          .slice(0, 2),
      })),
    [previewExperiences]
  );

  const previewProjectItems = useMemo(
    () =>
      previewProjects.map((item) => ({
        title: clampText(item.title, MAX_PROJECT_TITLE_LENGTH),
        period: clampText(item.period, MAX_PROJECT_PERIOD_LENGTH),
        description: clampText(item.description, MAX_PROJECT_DESCRIPTION_LENGTH),
        techStack: toSkills(item.techStackText)
          .map((skill) => clampText(skill, MAX_PROJECT_TECHSTACK_LENGTH))
          .filter(Boolean)
          .slice(0, 5),
      })),
    [previewProjects]
  );

  const previewEducationItems = useMemo(
    () =>
      previewEducation.map((item) => ({
        program: clampText(item.program, MAX_EDUCATION_PROGRAM_LENGTH),
        institution: clampText(item.institution, MAX_EDUCATION_INSTITUTION_LENGTH),
        period: clampText(item.period, MAX_EDUCATION_PERIOD_LENGTH),
      })),
    [previewEducation]
  );

  const previewCertificationItems = useMemo(
    () =>
      previewCertifications.map((item) => ({
        name: clampText(item.name, MAX_CERTIFICATION_NAME_LENGTH),
        issuer: clampText(item.issuer, MAX_CERTIFICATION_ISSUER_LENGTH),
        year: clampText(item.year, MAX_CERTIFICATION_YEAR_LENGTH),
      })),
    [previewCertifications]
  );

  const previewPublicationItems = useMemo(
    () =>
      previewPublications.map((item) => ({
        title: clampText(item.title, MAX_PUBLICATION_TITLE_LENGTH),
        date: clampText(item.date, MAX_PUBLICATION_DATE_LENGTH),
        authors: clampText(item.authors, MAX_PUBLICATION_AUTHORS_LENGTH),
        venue: clampText(item.venue, MAX_PUBLICATION_VENUE_LENGTH),
        link: clampText(item.link, MAX_PUBLICATION_LINK_LENGTH),
      })),
    [previewPublications]
  );

  const previewCustomSectionItems = useMemo(
    () =>
      previewCustomSections.map((item) => ({
        title: clampText(item.title, MAX_CUSTOM_SECTION_TITLE_LENGTH),
        style: item.style,
        entries: customSectionEntries(item.entriesText).slice(0, 3),
      })),
    [previewCustomSections]
  );

  const updateExperience = (index: number, patch: Partial<ExperienceDraft>) => {
    setExperiences((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  };

  const addExperience = () => {
    setExperiences((current) => {
      if (current.length >= MAX_EXPERIENCE_ITEMS) return current;
      return [...current, { id: createDraftId(), ...EMPTY_EXPERIENCE }];
    });
  };

  const removeExperience = (index: number) => {
    setExperiences((current) => {
      if (current.length === 1) return [{ id: createDraftId(), ...EMPTY_EXPERIENCE }];
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const moveExperience = (index: number, direction: -1 | 1) => {
    setExperiences((current) => moveItemInArray(current, index, direction));
  };

  const updateProject = (index: number, patch: Partial<ProjectDraft>) => {
    setProjects((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  };

  const addProject = () => {
    setProjects((current) => {
      if (current.length >= MAX_PROJECT_ITEMS) return current;
      return [...current, { id: createDraftId(), ...EMPTY_PROJECT }];
    });
  };

  const removeProject = (index: number) => {
    setProjects((current) => {
      if (current.length === 1) return [{ id: createDraftId(), ...EMPTY_PROJECT }];
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const moveProject = (index: number, direction: -1 | 1) => {
    setProjects((current) => moveItemInArray(current, index, direction));
  };

  const updateEducation = (index: number, patch: Partial<EducationDraft>) => {
    setEducation((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  };

  const addEducation = () => {
    setEducation((current) => {
      if (current.length >= MAX_EDUCATION_ITEMS) return current;
      return [...current, { id: createDraftId(), ...EMPTY_EDUCATION }];
    });
  };

  const removeEducation = (index: number) => {
    setEducation((current) => {
      if (current.length === 1) return [{ id: createDraftId(), ...EMPTY_EDUCATION }];
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const moveEducation = (index: number, direction: -1 | 1) => {
    setEducation((current) => moveItemInArray(current, index, direction));
  };

  const updateCertification = (index: number, patch: Partial<CertificationDraft>) => {
    setCertifications((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  };

  const addCertification = () => {
    setCertifications((current) => {
      if (current.length >= MAX_CERTIFICATION_ITEMS) return current;
      return [...current, { id: createDraftId(), ...EMPTY_CERTIFICATION }];
    });
  };

  const removeCertification = (index: number) => {
    setCertifications((current) => {
      if (current.length === 1) return [{ id: createDraftId(), ...EMPTY_CERTIFICATION }];
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const moveCertification = (index: number, direction: -1 | 1) => {
    setCertifications((current) => moveItemInArray(current, index, direction));
  };

  const updatePublication = (index: number, patch: Partial<PublicationDraft>) => {
    setPublications((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  };

  const addPublication = () => {
    setPublications((current) => {
      if (current.length >= MAX_PUBLICATION_ITEMS) return current;
      return [...current, { id: createDraftId(), ...EMPTY_PUBLICATION }];
    });
  };

  const removePublication = (index: number) => {
    setPublications((current) => {
      if (current.length === 1) return [{ id: createDraftId(), ...EMPTY_PUBLICATION }];
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const movePublication = (index: number, direction: -1 | 1) => {
    setPublications((current) => moveItemInArray(current, index, direction));
  };

  const updateCustomSection = (index: number, patch: Partial<CustomSectionDraft>) => {
    setCustomSections((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  };

  const addCustomSection = () => {
    setCustomSections((current) => {
      if (current.length >= MAX_CUSTOM_SECTIONS) return current;
      return [...current, { id: createDraftId(), ...EMPTY_CUSTOM_SECTION }];
    });
  };

  const removeCustomSection = (index: number) => {
    setCustomSections((current) => {
      if (current.length === 1) return [{ id: createDraftId(), ...EMPTY_CUSTOM_SECTION }];
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const moveCustomSection = (index: number, direction: -1 | 1) => {
    setCustomSections((current) => moveItemInArray(current, index, direction));
  };

  const resetForm = () => {
    setTemplateId("base");
    setName("");
    setEmail("");
    setPhone("");
    setLinkedin("");
    setPortfolio("");
    setLocation("");
    setSummary("");
    setSkillsInput("");
    setLanguagesInput("");
    setTechnologiesInput("");
    setExperiences([{ id: createDraftId(), ...EMPTY_EXPERIENCE }]);
    setProjects([{ id: createDraftId(), ...EMPTY_PROJECT }]);
    setEducation([{ id: createDraftId(), ...EMPTY_EDUCATION }]);
    setCertifications([{ id: createDraftId(), ...EMPTY_CERTIFICATION }]);
    setPublications([{ id: createDraftId(), ...EMPTY_PUBLICATION }]);
    setCustomSections([{ id: createDraftId(), ...EMPTY_CUSTOM_SECTION }]);
    setError(null);
    setSuccessMessage(null);
    setLastSavedAt(null);
    localStorage.removeItem(RESUME_DRAFT_STORAGE_KEY);
  };

  const loadSampleData = () => {
    const hasContent = Boolean(
      templateId !== "base" ||
      name.trim() ||
        email.trim() ||
        phone.trim() ||
        linkedin.trim() ||
        portfolio.trim() ||
        location.trim() ||
        summary.trim() ||
        parsedSkills.length > 0 ||
        parsedLanguages.length > 0 ||
        parsedTechnologies.length > 0 ||
        experiences.some((item) => hasExperienceContent(item)) ||
        projects.some((item) => hasProjectContent(item)) ||
        education.some((item) => hasEducationContent(item)) ||
        certifications.some((item) => hasCertificationContent(item)) ||
        publications.some((item) => hasPublicationContent(item)) ||
        customSections.some((item) => hasCustomSectionContent(item))
    );

    if (
      hasContent &&
      !window.confirm("This will replace your current entries with sample data. Continue?")
    ) {
      return;
    }

    setTemplateId(SAMPLE_DRAFT.templateId);
    setName(SAMPLE_DRAFT.name);
    setEmail(SAMPLE_DRAFT.email);
    setPhone(SAMPLE_DRAFT.phone);
    setLinkedin(SAMPLE_DRAFT.linkedin);
    setPortfolio(SAMPLE_DRAFT.portfolio);
    setLocation(SAMPLE_DRAFT.location);
    setSummary(SAMPLE_DRAFT.summary);
    setSkillsInput(SAMPLE_DRAFT.skillsInput);
    setLanguagesInput(SAMPLE_DRAFT.languagesInput);
    setTechnologiesInput(SAMPLE_DRAFT.technologiesInput);
    setExperiences(SAMPLE_DRAFT.experiences.map((item) => ({ ...item, id: createDraftId() })));
    setProjects(SAMPLE_DRAFT.projects.map((item) => ({ ...item, id: createDraftId() })));
    setEducation(SAMPLE_DRAFT.education.map((item) => ({ ...item, id: createDraftId() })));
    setCertifications(SAMPLE_DRAFT.certifications.map((item) => ({ ...item, id: createDraftId() })));
    setPublications(SAMPLE_DRAFT.publications.map((item) => ({ ...item, id: createDraftId() })));
    setCustomSections(SAMPLE_DRAFT.customSections.map((item) => ({ ...item, id: createDraftId() })));
    setError(null);
    setSuccessMessage("Sample profile loaded. Customize and generate your own PDF.");
  };

  const clearSavedDraft = () => {
    localStorage.removeItem(RESUME_DRAFT_STORAGE_KEY);
    setLastSavedAt(null);
    setSuccessMessage("Saved draft cleared. Current form remains on screen and will autosave on your next edit.");
  };

  const buildPayload = (selectedTemplateId: ResumeTemplateId = templateId): ResumeGeneratePayload => {
    const trimmedExperiences = experiences
      .map((item) => {
        const highlights = toLines(item.highlightsText)
          .map((highlight) => clampText(highlight, MAX_EXPERIENCE_HIGHLIGHT_LENGTH))
          .filter(Boolean)
          .slice(0, 12);
        return {
          company: clampText(item.company, MAX_EXPERIENCE_COMPANY_LENGTH),
          role: clampText(item.role, MAX_EXPERIENCE_ROLE_LENGTH),
          period: clampText(item.period, MAX_EXPERIENCE_PERIOD_LENGTH),
          highlights,
        };
      })
      .filter(
        (item) =>
          item.company.length > 0 || item.role.length > 0 || item.period.length > 0 || item.highlights.length > 0
      )
      .slice(0, 20);

    const trimmedProjects = projects
      .map((item) => ({
        title: clampText(item.title, MAX_PROJECT_TITLE_LENGTH),
        period: clampText(item.period, MAX_PROJECT_PERIOD_LENGTH),
        description: clampText(item.description, MAX_PROJECT_DESCRIPTION_LENGTH),
        link: clampText(item.link, MAX_PROJECT_LINK_LENGTH),
        techStack: toSkills(item.techStackText)
          .map((skill) => clampText(skill, MAX_PROJECT_TECHSTACK_LENGTH))
          .filter(Boolean)
          .slice(0, MAX_PROJECT_TECHSTACK_ITEMS),
      }))
      .filter(
        (item) =>
          item.title.length > 0 ||
          item.period.length > 0 ||
          item.description.length > 0 ||
          item.link.length > 0 ||
          item.techStack.length > 0
      )
      .slice(0, 20);

    const trimmedEducation = education
      .map((item) => ({
        program: clampText(item.program, MAX_EDUCATION_PROGRAM_LENGTH),
        institution: clampText(item.institution, MAX_EDUCATION_INSTITUTION_LENGTH),
        period: clampText(item.period, MAX_EDUCATION_PERIOD_LENGTH),
        details: clampText(item.details, MAX_EDUCATION_DETAILS_LENGTH),
      }))
      .filter(
        (item) =>
          item.program.length > 0 ||
          item.institution.length > 0 ||
          item.period.length > 0 ||
          item.details.length > 0
      )
      .slice(0, 10);

    const trimmedCertifications = certifications
      .map((item) => ({
        name: clampText(item.name, MAX_CERTIFICATION_NAME_LENGTH),
        issuer: clampText(item.issuer, MAX_CERTIFICATION_ISSUER_LENGTH),
        year: clampText(item.year, MAX_CERTIFICATION_YEAR_LENGTH),
      }))
      .filter((item) => item.name.length > 0 || item.issuer.length > 0 || item.year.length > 0)
      .slice(0, 20);

    const trimmedPublications = publications
      .map((item) => ({
        title: clampText(item.title, MAX_PUBLICATION_TITLE_LENGTH),
        date: clampText(item.date, MAX_PUBLICATION_DATE_LENGTH),
        authors: clampText(item.authors, MAX_PUBLICATION_AUTHORS_LENGTH),
        venue: clampText(item.venue, MAX_PUBLICATION_VENUE_LENGTH),
        link: clampText(item.link, MAX_PUBLICATION_LINK_LENGTH),
      }))
      .filter(
        (item) =>
          item.title.length > 0 ||
          item.date.length > 0 ||
          item.authors.length > 0 ||
          item.venue.length > 0 ||
          item.link.length > 0
      )
      .slice(0, MAX_PUBLICATION_ITEMS);

    const trimmedCustomSections = customSections
      .map((item) => ({
        title: clampText(item.title, MAX_CUSTOM_SECTION_TITLE_LENGTH),
        style: item.style,
        entries: customSectionEntries(item.entriesText),
      }))
      .filter((item) => item.title.length > 0 && item.entries.length > 0)
      .slice(0, MAX_CUSTOM_SECTIONS);

    return {
      templateId: selectedTemplateId,
      name: clampText(name, MAX_NAME_LENGTH),
      email: clampText(email, MAX_EMAIL_LENGTH),
      phone: clampText(phone, MAX_PHONE_LENGTH),
      linkedin: clampText(linkedin, MAX_LINKEDIN_LENGTH),
      portfolio: clampText(portfolio, MAX_PORTFOLIO_LENGTH),
      location: clampText(location, MAX_LOCATION_LENGTH),
      summary: clampText(summary, MAX_SUMMARY_LENGTH),
      skills: parsedSkills,
      languages: parsedLanguages,
      technologies: parsedTechnologies,
      experience: trimmedExperiences,
      projects: trimmedProjects,
      education: trimmedEducation,
      certifications: trimmedCertifications,
      publications: trimmedPublications,
      customSections: trimmedCustomSections,
    };
  };

  const parseApiError = async (response: Response): Promise<string> => {
    try {
      const data = (await response.json()) as { error?: string; details?: unknown };
      const firstDetail = extractFirstZodError(data?.details);

      if (data?.error && firstDetail) {
        return `${data.error} ${firstDetail}`;
      }

      if (data?.error) return data.error;
    } catch {
      // Fall back to generic error if body is not JSON.
    }

    return "Failed to process request. Please check your entries and try again.";
  };

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a Job Description first.");
      return;
    }

    try {
      setIsTailoring(true);
      setError(null);
      setSuccessMessage(null);

      const payload = buildPayload(templateId);

      const response = await fetch("/api/resume/tailor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ baseResume: payload, jobDescription }),
      });

      if (!response.ok) {
        const message = await parseApiError(response);
        throw new Error(message);
      }

      const data = await response.json();

      if (data.summary) setSummary(data.summary);
      if (data.skills) setSkillsInput(data.skills.join(", "));
      if (data.technologies) setTechnologiesInput(data.technologies.join(", "));

      if (data.experience) {
        setExperiences(
          data.experience.map((item: any) => ({
            id: createDraftId(),
            company: item.company || "",
            period: item.period || "",
            role: item.role || "",
            highlightsText: (item.highlights || []).join("\n"),
          }))
        );
      }

      if (data.projects) {
        setProjects(
          data.projects.map((item: any) => ({
            id: createDraftId(),
            title: item.title || "",
            period: item.period || "",
            description: item.description || "",
            link: item.link || "",
            techStackText: (item.techStack || []).join(", "),
          }))
        );
      }

      setSuccessMessage("Resume tailored successfully to match the Job Description!");
      setIsTailoringModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to tailor resume. Please try again.");
    } finally {
      setIsTailoring(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!clJobDescription.trim()) return;
    setIsGeneratingCL(true);
    setGeneratedCoverLetter("");
    setGeneratedOutreach("");
    try {
      const resumeJson = JSON.stringify(buildPayload());
      const [clRes, outRes] = await Promise.all([
        generateCoverLetterAction(resumeJson, clJobDescription),
        generateOutreachMessageAction(resumeJson, clJobDescription)
      ]);
      
      if (clRes.data) setGeneratedCoverLetter(clRes.data);
      if (outRes.data) setGeneratedOutreach(outRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingCL(false);
    }
  };

  const handleWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardInput.trim()) return;

    const userMessage = wizardInput;
    setWizardInput("");
    setWizardMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsWizardLoading(true);

    try {
      const resumeJson = JSON.stringify(buildPayload());
      const res = await processWizardTurnAction(resumeJson, currentWizardSection, userMessage);
      
      if (res.error) {
        setWizardMessages(prev => [...prev, { role: 'ai', content: "I encountered an error. Could you try answering that again?" }]);
        return;
      }

      if (res.data) {
        const data = res.data.resume_data;
        if (data) {
          if (data.name) setName(data.name);
          if (data.email) setEmail(data.email);
          if (data.phone) setPhone(data.phone);
          if (data.location) setLocation(data.location);
          if (data.linkedin) setLinkedin(data.linkedin);
          if (data.portfolio) setPortfolio(data.portfolio);
          if (data.summary) setSummary(data.summary);
          if (data.skills) setSkillsInput(data.skills.join(", "));
          if (data.technologies) setTechnologiesInput(data.technologies.join(", "));

          if (data.experience && data.experience.length > 0) {
            setExperiences(
              data.experience.map((item: any) => ({
                id: createDraftId(),
                company: item.company || "",
                period: item.period || "",
                role: item.role || "",
                highlightsText: (item.highlights || []).join("\n"),
              }))
            );
          }

          if (data.projects && data.projects.length > 0) {
            setProjects(
              data.projects.map((item: any) => ({
                id: createDraftId(),
                title: item.title || "",
                period: item.period || "",
                description: item.description || "",
                link: item.link || "",
                techStackText: (item.techStack || []).join(", "),
              }))
            );
          }
          
          if (data.education && data.education.length > 0) {
            setEducation(
              data.education.map((item: any) => ({
                id: createDraftId(),
                program: item.program || "",
                institution: item.institution || "",
                period: item.period || "",
                details: item.details || "",
              }))
            );
          }
        }
        
        // Add the next question
        const nextQ = res.data.next_question;
        if (nextQ) {
          setWizardMessages(prev => [...prev, { role: 'ai', content: nextQ.text }]);
          setCurrentWizardSection(nextQ.section);
        }

        if (res.data.is_complete) {
          setWizardMessages(prev => [...prev, { role: 'ai', content: "It looks like we have all the basics! You can close this chat and review your resume, or keep giving me more details." }]);
        }
      }
    } catch (err) {
      console.error(err);
      setWizardMessages(prev => [...prev, { role: 'ai', content: "Something went wrong. Let's try again." }]);
    } finally {
      setIsWizardLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setError(null);
      setSuccessMessage(null);

      const formData = new FormData();
      formData.append("file", file);

      const result = await parseResumeAction(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      const data = result.data;
      if (!data) throw new Error("No data returned from AI parsing.");

      if (data.name) setName(data.name);
      if (data.email) setEmail(data.email);
      if (data.phone) setPhone(data.phone);
      if (data.location) setLocation(data.location);
      if (data.linkedin) setLinkedin(data.linkedin);
      if (data.portfolio) setPortfolio(data.portfolio);
      if (data.summary) setSummary(data.summary);
      if (data.skills) setSkillsInput(data.skills.join(", "));
      if (data.technologies) setTechnologiesInput(data.technologies.join(", "));

      if (data.experience && data.experience.length > 0) {
        setExperiences(
          data.experience.map((item: any) => ({
            id: createDraftId(),
            company: item.company || "",
            period: item.period || "",
            role: item.role || "",
            highlightsText: (item.highlights || []).join("\n"),
          }))
        );
      }

      if (data.projects && data.projects.length > 0) {
        setProjects(
          data.projects.map((item: any) => ({
            id: createDraftId(),
            title: item.title || "",
            period: item.period || "",
            description: item.description || "",
            link: item.link || "",
            techStackText: (item.techStack || []).join(", "),
          }))
        );
      }
      
      if (data.education && data.education.length > 0) {
        setEducation(
          data.education.map((item: any) => ({
            id: createDraftId(),
            program: item.program || "",
            institution: item.institution || "",
            period: item.period || "",
            details: item.details || "",
          }))
        );
      }
      
      if (data.certifications && data.certifications.length > 0) {
        setCertifications(
          data.certifications.map((item: any) => ({
            id: createDraftId(),
            name: item.name || "",
            issuer: item.issuer || "",
            year: item.year || "",
          }))
        );
      }

      setSuccessMessage("Resume imported successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to import resume.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setError("Full name is required to generate a resume.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required to generate a resume.");
      return;
    }

    setIsGenerating(true);

    try {
      const templateField = event.currentTarget.elements.namedItem("templateId");
      const selectedTemplateId =
        templateField instanceof HTMLSelectElement
          ? normalizeTemplateId(templateField.value)
          : templateId;

      if (selectedTemplateId !== templateId) {
        setTemplateId(selectedTemplateId);
      }

      const payload = buildPayload(selectedTemplateId);

      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseApiError(response);
        throw new Error(message);
      }

      const pdfBlob = await response.blob();
      const objectUrl = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement("a");
      const fileName = `${sanitizeFilenamePart(payload.name || "resume")}.pdf`;

      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);

      setSuccessMessage("Resume PDF generated and downloaded.");
    } catch (generationError) {
      const message =
        generationError instanceof Error
          ? generationError.message
          : "Something went wrong while generating your resume.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen relative transition-colors duration-500 bg-gradient-to-br from-gray-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950 pt-24 px-4 sm:px-6 pb-16">
      <NavigationPill />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-16 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        <m.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-[11px] font-black uppercase tracking-widest mb-4">
            <Sparkles size={13} /> Resume Builder
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3">
            Build a polished, AI-tailored resume in seconds
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
            Import your existing resume, let the AI automatically tailor it to any job description, and download a beautifully formatted PDF instantly.
          </p>
        </m.header>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-2 space-y-6">
            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-4">
                <FileText size={15} /> Identity
              </h2>

              <label className="space-y-1.5 block mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Resume template
                </span>
                <select
                  name="templateId"
                  value={templateId}
                  onChange={(event) => setTemplateId(normalizeTemplateId(event.target.value))}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  {TEMPLATE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {TEMPLATE_OPTIONS.find((option) => option.id === templateId)?.description}
                </p>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between gap-3">
                    <span>Full name</span>
                    <span className={`text-[10px] font-semibold ${counterTone(name.length, MAX_NAME_LENGTH)}`}>
                      {name.length}/{MAX_NAME_LENGTH}
                    </span>
                  </span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={MAX_NAME_LENGTH}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    placeholder="Alex Johnson"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between gap-3">
                    <span>Email</span>
                    <span className={`text-[10px] font-semibold ${counterTone(email.length, MAX_EMAIL_LENGTH)}`}>
                      {email.length}/{MAX_EMAIL_LENGTH}
                    </span>
                  </span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    maxLength={MAX_EMAIL_LENGTH}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    placeholder="alex@email.com"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between gap-3">
                    <span>Phone</span>
                    <span className={`text-[10px] font-semibold ${counterTone(phone.length, MAX_PHONE_LENGTH)}`}>
                      {phone.length}/{MAX_PHONE_LENGTH}
                    </span>
                  </span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    maxLength={MAX_PHONE_LENGTH}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    placeholder="+1 555 123 4567"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between gap-3">
                    <span>LinkedIn URL</span>
                    <span className={`text-[10px] font-semibold ${counterTone(linkedin.length, MAX_LINKEDIN_LENGTH)}`}>
                      {linkedin.length}/{MAX_LINKEDIN_LENGTH}
                    </span>
                  </span>
                  <input
                    value={linkedin}
                    onChange={(event) => setLinkedin(event.target.value)}
                    maxLength={MAX_LINKEDIN_LENGTH}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between gap-3">
                    <span>Portfolio URL</span>
                    <span className={`text-[10px] font-semibold ${counterTone(portfolio.length, MAX_PORTFOLIO_LENGTH)}`}>
                      {portfolio.length}/{MAX_PORTFOLIO_LENGTH}
                    </span>
                  </span>
                  <input
                    value={portfolio}
                    onChange={(event) => setPortfolio(event.target.value)}
                    maxLength={MAX_PORTFOLIO_LENGTH}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    placeholder="https://your-portfolio.dev"
                  />
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between gap-3">
                    <span>Location</span>
                    <span className={`text-[10px] font-semibold ${counterTone(location.length, MAX_LOCATION_LENGTH)}`}>
                      {location.length}/{MAX_LOCATION_LENGTH}
                    </span>
                  </span>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    maxLength={MAX_LOCATION_LENGTH}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    placeholder="Bengaluru, India"
                  />
                </label>
              </div>
            </section>

            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-4">
                <ListChecks size={15} /> Summary and Skills
              </h2>

              <div className="space-y-4">
                <label className="space-y-1.5 block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between gap-3">
                    <span>Professional summary</span>
                    <span className={`text-[10px] font-semibold ${counterTone(summary.length, MAX_SUMMARY_LENGTH)}`}>
                      {summary.length}/{MAX_SUMMARY_LENGTH}
                    </span>
                  </span>
                  <textarea
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    maxLength={MAX_SUMMARY_LENGTH}
                    className="w-full min-h-[130px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-y"
                    placeholder="Results-driven engineer with 5+ years building scalable web applications..."
                  />
                </label>

                <label className="space-y-1.5 block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between gap-3">
                    <span>Skills (comma-separated)</span>
                    <span className={`text-[10px] font-semibold ${counterTone(parsedSkills.length, MAX_SKILLS)}`}>
                      {parsedSkills.length}/{MAX_SKILLS} skills
                    </span>
                  </span>
                  <textarea
                    value={skillsInput}
                    onChange={(event) => setSkillsInput(event.target.value)}
                    maxLength={MAX_SKILLS * (MAX_SKILL_LENGTH + 2)}
                    className="w-full min-h-[100px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-y"
                    placeholder="TypeScript, React, Next.js, Supabase, PostgreSQL, Playwright"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1.5 block">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between gap-3">
                      <span>Languages (comma-separated)</span>
                      <span className={`text-[10px] font-semibold ${counterTone(parsedLanguages.length, MAX_LANGUAGE_ITEMS)}`}>
                        {parsedLanguages.length}/{MAX_LANGUAGE_ITEMS}
                      </span>
                    </span>
                    <textarea
                      value={languagesInput}
                      onChange={(event) => setLanguagesInput(event.target.value)}
                      maxLength={MAX_LANGUAGE_ITEMS * (MAX_SKILL_LENGTH + 2)}
                      className="w-full min-h-[90px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-y"
                      placeholder="TypeScript, JavaScript, SQL, Python"
                    />
                  </label>

                  <label className="space-y-1.5 block">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between gap-3">
                      <span>Technologies (comma-separated)</span>
                      <span className={`text-[10px] font-semibold ${counterTone(parsedTechnologies.length, MAX_TECHNOLOGY_ITEMS)}`}>
                        {parsedTechnologies.length}/{MAX_TECHNOLOGY_ITEMS}
                      </span>
                    </span>
                    <textarea
                      value={technologiesInput}
                      onChange={(event) => setTechnologiesInput(event.target.value)}
                      maxLength={MAX_TECHNOLOGY_ITEMS * (MAX_SKILL_LENGTH + 2)}
                      className="w-full min-h-[90px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-y"
                      placeholder="Next.js, React, Node.js, PostgreSQL, Redis"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <BriefcaseBusiness size={15} /> Experience
                </h2>
                <button
                  type="button"
                  onClick={addExperience}
                  disabled={experiences.length >= MAX_EXPERIENCE_ITEMS}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={12} /> Add role
                </button>
              </div>

              <div className="space-y-4">
                {experiences.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-950/30 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Role {index + 1}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveExperience(index, -1)}
                          disabled={index === 0}
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move role up"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExperience(index, 1)}
                          disabled={index === experiences.length - 1}
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move role down"
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        value={item.company}
                        onChange={(event) => updateExperience(index, { company: event.target.value })}
                        maxLength={MAX_EXPERIENCE_COMPANY_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Company"
                      />
                      <input
                        value={item.role}
                        onChange={(event) => updateExperience(index, { role: event.target.value })}
                        maxLength={MAX_EXPERIENCE_ROLE_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Role"
                      />
                      <input
                        value={item.period}
                        onChange={(event) => updateExperience(index, { period: event.target.value })}
                        maxLength={MAX_EXPERIENCE_PERIOD_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Jan 2022 - Present"
                      />
                    </div>

                    <textarea
                      value={item.highlightsText}
                      onChange={(event) => updateExperience(index, { highlightsText: event.target.value })}
                      maxLength={MAX_EXPERIENCE_HIGHLIGHT_LENGTH * 12}
                      className="w-full min-h-[110px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-y"
                      placeholder={"One bullet per line\nImproved API response time by 42%\nLed migration to Next.js app router"}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <BookOpenCheck size={15} /> Projects
                </h2>
                <button
                  type="button"
                  onClick={addProject}
                  disabled={projects.length >= MAX_PROJECT_ITEMS}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={12} /> Add project
                </button>
              </div>

              <div className="space-y-4">
                {projects.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-950/30 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Project {index + 1}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveProject(index, -1)}
                          disabled={index === 0}
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move project up"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveProject(index, 1)}
                          disabled={index === projects.length - 1}
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move project down"
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProject(index)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        value={item.title}
                        onChange={(event) => updateProject(index, { title: event.target.value })}
                        maxLength={MAX_PROJECT_TITLE_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Project title"
                      />
                      <input
                        value={item.period}
                        onChange={(event) => updateProject(index, { period: event.target.value })}
                        maxLength={MAX_PROJECT_PERIOD_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="2025"
                      />
                      <input
                        value={item.link}
                        onChange={(event) => updateProject(index, { link: event.target.value })}
                        maxLength={MAX_PROJECT_LINK_LENGTH}
                        className="md:col-span-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Project link (optional)"
                      />
                    </div>

                    <textarea
                      value={item.description}
                      onChange={(event) => updateProject(index, { description: event.target.value })}
                      maxLength={MAX_PROJECT_DESCRIPTION_LENGTH}
                      className="w-full min-h-[90px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-y"
                      placeholder="What did you build and what impact did it create?"
                    />

                    <input
                      value={item.techStackText}
                      onChange={(event) => updateProject(index, { techStackText: event.target.value })}
                      maxLength={MAX_PROJECT_TECHSTACK_ITEMS * (MAX_PROJECT_TECHSTACK_LENGTH + 2)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                      placeholder="Tech stack (comma-separated)"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <GraduationCap size={15} /> Education
                </h2>
                <button
                  type="button"
                  onClick={addEducation}
                  disabled={education.length >= MAX_EDUCATION_ITEMS}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={12} /> Add education
                </button>
              </div>

              <div className="space-y-4">
                {education.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-950/30 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Education {index + 1}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveEducation(index, -1)}
                          disabled={index === 0}
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move education up"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveEducation(index, 1)}
                          disabled={index === education.length - 1}
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move education down"
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        value={item.program}
                        onChange={(event) => updateEducation(index, { program: event.target.value })}
                        maxLength={MAX_EDUCATION_PROGRAM_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Program"
                      />
                      <input
                        value={item.period}
                        onChange={(event) => updateEducation(index, { period: event.target.value })}
                        maxLength={MAX_EDUCATION_PERIOD_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="2019 - 2023"
                      />
                      <input
                        value={item.institution}
                        onChange={(event) => updateEducation(index, { institution: event.target.value })}
                        maxLength={MAX_EDUCATION_INSTITUTION_LENGTH}
                        className="md:col-span-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Institution"
                      />
                    </div>

                    <textarea
                      value={item.details}
                      onChange={(event) => updateEducation(index, { details: event.target.value })}
                      maxLength={MAX_EDUCATION_DETAILS_LENGTH}
                      className="w-full min-h-[80px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-y"
                      placeholder="Notable achievements, GPA, thesis, coursework (optional)"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Award size={15} /> Certifications
                </h2>
                <button
                  type="button"
                  onClick={addCertification}
                  disabled={certifications.length >= MAX_CERTIFICATION_ITEMS}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={12} /> Add cert
                </button>
              </div>

              <div className="space-y-3">
                {certifications.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-950/30 p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
                  >
                    <input
                      value={item.name}
                      onChange={(event) => updateCertification(index, { name: event.target.value })}
                      maxLength={MAX_CERTIFICATION_NAME_LENGTH}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                      placeholder="Certification name"
                    />
                    <input
                      value={item.issuer}
                      onChange={(event) => updateCertification(index, { issuer: event.target.value })}
                      maxLength={MAX_CERTIFICATION_ISSUER_LENGTH}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                      placeholder="Issuer"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveCertification(index, -1)}
                        disabled={index === 0}
                        className="shrink-0 inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Move certification up"
                      >
                        <ChevronUp size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCertification(index, 1)}
                        disabled={index === certifications.length - 1}
                        className="shrink-0 inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Move certification down"
                      >
                        <ChevronDown size={11} />
                      </button>
                      <input
                        value={item.year}
                        onChange={(event) => updateCertification(index, { year: event.target.value })}
                        maxLength={MAX_CERTIFICATION_YEAR_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Year"
                      />
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="shrink-0 inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <BookOpenCheck size={15} /> Publications
                </h2>
                <button
                  type="button"
                  onClick={addPublication}
                  disabled={publications.length >= MAX_PUBLICATION_ITEMS}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={12} /> Add publication
                </button>
              </div>

              <div className="space-y-4">
                {publications.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-950/30 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Publication {index + 1}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => movePublication(index, -1)}
                          disabled={index === 0}
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move publication up"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePublication(index, 1)}
                          disabled={index === publications.length - 1}
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move publication down"
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePublication(index)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        value={item.title}
                        onChange={(event) => updatePublication(index, { title: event.target.value })}
                        maxLength={MAX_PUBLICATION_TITLE_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Publication title"
                      />
                      <input
                        value={item.date}
                        onChange={(event) => updatePublication(index, { date: event.target.value })}
                        maxLength={MAX_PUBLICATION_DATE_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Sep 2024"
                      />
                      <input
                        value={item.authors}
                        onChange={(event) => updatePublication(index, { authors: event.target.value })}
                        maxLength={MAX_PUBLICATION_AUTHORS_LENGTH}
                        className="md:col-span-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Author list"
                      />
                      <input
                        value={item.venue}
                        onChange={(event) => updatePublication(index, { venue: event.target.value })}
                        maxLength={MAX_PUBLICATION_VENUE_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Journal / Conference"
                      />
                      <input
                        value={item.link}
                        onChange={(event) => updatePublication(index, { link: event.target.value })}
                        maxLength={MAX_PUBLICATION_LINK_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="https://doi.org/..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <ListChecks size={15} /> Custom Sections
                </h2>
                <button
                  type="button"
                  onClick={addCustomSection}
                  disabled={customSections.length >= MAX_CUSTOM_SECTIONS}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={12} /> Add section
                </button>
              </div>

              <div className="space-y-4">
                {customSections.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-950/30 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Section {index + 1}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveCustomSection(index, -1)}
                          disabled={index === 0}
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move custom section up"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCustomSection(index, 1)}
                          disabled={index === customSections.length - 1}
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move custom section down"
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCustomSection(index)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        value={item.title}
                        onChange={(event) => updateCustomSection(index, { title: event.target.value })}
                        maxLength={MAX_CUSTOM_SECTION_TITLE_LENGTH}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        placeholder="Section title"
                      />
                      <select
                        value={item.style}
                        onChange={(event) => updateCustomSection(index, { style: event.target.value === "text" ? "text" : "bullets" })}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                      >
                        <option value="bullets">Bullet list</option>
                        <option value="text">Text paragraphs</option>
                      </select>
                    </div>

                    <textarea
                      value={item.entriesText}
                      onChange={(event) => updateCustomSection(index, { entriesText: event.target.value })}
                      maxLength={MAX_CUSTOM_SECTION_ENTRY_LENGTH * MAX_CUSTOM_SECTION_ENTRIES}
                      className="w-full min-h-[110px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-y"
                      placeholder={"One entry per line\nMentored 8 junior engineers\nCreated internal onboarding guides"}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24">
            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300 space-y-2.5">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider px-4 py-3 transition-all inline-flex items-center justify-center gap-2"
              >
                <Download size={15} /> {isGenerating ? "Generating..." : "Generate PDF"}
              </button>
              
              <input 
                type="file" 
                accept=".pdf,.txt,.md" 
                ref={fileInputRef} 
                onChange={handleFileImport} 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-full rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold text-sm px-4 py-3 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Upload size={15} /> {isImporting ? "Importing..." : "Import Profile"}
              </button>

              <button
                type="button"
                onClick={() => setIsTailoringModalOpen(true)}
                className="w-full rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold text-sm px-4 py-3 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Wand2 size={15} /> Tailor with AI
              </button>

              <button
                type="button"
                onClick={() => setIsCoverLetterModalOpen(true)}
                className="w-full rounded-xl bg-teal-600/10 hover:bg-teal-600/20 border border-teal-500/30 text-teal-600 dark:text-teal-400 font-bold text-sm px-4 py-3 transition-colors inline-flex items-center justify-center gap-2"
              >
                <FileText size={15} /> Cover Letter & Outreach
              </button>

              <button
                type="button"
                onClick={() => setIsWizardModalOpen(true)}
                className="w-full rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm px-4 py-3 transition-colors inline-flex items-center justify-center gap-2"
              >
                <MessageSquareText size={15} /> Chat to Build
              </button>

              <button
                type="button"
                onClick={loadSampleData}
                className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold text-sm px-4 py-2.5 transition-colors"
              >
                Load Sample Profile
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm px-4 py-2.5 transition-colors"
              >
                Reset Form
              </button>

              <button
                type="button"
                onClick={clearSavedDraft}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm px-4 py-2.5 transition-colors"
              >
                Clear Saved Draft Only
              </button>

              <Link
                href="/resume-roaster"
                className="block w-full rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-sm px-4 py-2.5 transition-colors text-center"
              >
                Need ATS critique first?
              </Link>
            </section>
            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                Quick Snapshot
              </h2>
              <div className="space-y-2.5">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Template
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    {templateId === "rendercv" ? "RenderCV" : "Modern"}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Skills
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{skillCount}</span>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Languages
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{languageCount}</span>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Technologies
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{technologyCount}</span>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Experience Items
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{experienceCount}</span>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Projects
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{projectCount}</span>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Education
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{educationCount}</span>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Certifications
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{certificationCount}</span>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Publications
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{publicationCount}</span>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Custom Sections
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{customSectionCount}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                <p>Use one highlight per line for each role.</p>
                <p>Draft is stored locally in your browser.</p>
                <p>{draftTimestampLabel(lastSavedAt)}</p>
              </div>
            </section>

            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Live Preview
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
                  Auto-updates
                </span>
              </div>

              <div className="h-[40rem] w-full mt-4">
                <PaginatedPreview
                  name={name}
                  templateId={templateId}
                  location={location}
                  phone={phone}
                  email={email}
                  linkedin={linkedin}
                  portfolio={portfolio}
                  summary={summary}
                  skills={parsedSkills}
                  languages={parsedLanguages}
                  technologies={parsedTechnologies}
                  experienceItems={experiences}
                  projectItems={projects}
                  educationItems={education}
                  certificationItems={certifications}
                  publicationItems={publications}
                  customSectionItems={customSections}
                />
              </div>
            </section>

            {error && (
              <section className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </section>
            )}

            {successMessage && (
              <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <p>{successMessage}</p>
              </section>
            )}


          </aside>
        </form>
      </div>

      {isTailoringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-lg font-black tracking-wide text-gray-900 dark:text-white flex items-center gap-2">
                <Wand2 size={20} className="text-purple-500" /> Auto-Tailor Resume
              </h3>
              <button
                onClick={() => setIsTailoringModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                disabled={isTailoring}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Paste the Job Description below. Our AI will automatically rewrite your Professional Summary, 
                reorder your Experience bullets based on relevance, and select the top matching Skills and Projects.
                <strong className="block mt-2 text-purple-600 dark:text-purple-400">Your form state will be instantly updated. Make sure you load your base profile first!</strong>
              </p>
              
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target Job Description here..."
                className="w-full h-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-4 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none font-mono"
                disabled={isTailoring}
              />
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button
                onClick={() => setIsTailoringModalOpen(false)}
                disabled={isTailoring}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTailor}
                disabled={isTailoring || !jobDescription.trim()}
                className="px-5 py-2.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isTailoring ? "Tailoring..." : "Tailor Resume"}
              </button>
            </div>
          </m.div>
        </div>
      )}

      {isCoverLetterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-lg font-black tracking-wide text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={20} className="text-teal-500" /> Cover Letter & Outreach Generator
              </h3>
              <button
                onClick={() => setIsCoverLetterModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Target Job Description
                </label>
                <textarea
                  value={clJobDescription}
                  onChange={(e) => setClJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateCoverLetter}
                  disabled={isGeneratingCL || !clJobDescription.trim()}
                  className="rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold px-6 py-3 transition-colors flex items-center gap-2"
                >
                  <Wand2 size={16} /> {isGeneratingCL ? "Generating..." : "Generate Materials"}
                </button>
              </div>

              {generatedCoverLetter && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">Tailored Cover Letter</h4>
                    <textarea 
                      className="w-full h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm"
                      value={generatedCoverLetter}
                      onChange={(e) => setGeneratedCoverLetter(e.target.value)}
                    />
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">LinkedIn Cold Outreach Message</h4>
                    <textarea 
                      className="w-full h-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm"
                      value={generatedOutreach}
                      onChange={(e) => setGeneratedOutreach(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </m.div>
        </div>
      )}

      {isWizardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
              <div>
                <h3 className="text-lg font-black tracking-wide text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquareText size={20} className="text-indigo-500" /> Resume Wizard
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Chat with AI to build your master resume progressively.</p>
              </div>
              <button
                onClick={() => setIsWizardModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wizardMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isWizardLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl p-4 bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm rounded-bl-none flex items-center gap-2">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse animation-delay-200">●</span>
                    <span className="animate-pulse animation-delay-400">●</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
              <form onSubmit={handleWizardSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={wizardInput}
                  onChange={(e) => setWizardInput(e.target.value)}
                  placeholder="Type your answer here..."
                  className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  disabled={isWizardLoading}
                />
                <button
                  type="submit"
                  disabled={isWizardLoading || !wizardInput.trim()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                >
                  Send
                </button>
              </form>
              <div className="mt-2 text-xs text-center text-gray-500">
                You can close this chat at any time. Your resume updates in real-time in the background!
              </div>
            </div>
          </m.div>
        </div>
      )}
    </div>
  );
}
