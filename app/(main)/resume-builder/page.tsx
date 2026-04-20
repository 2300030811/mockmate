"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { NavigationPill } from "@/components/ui/NavigationPill";

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

type ResumeGeneratePayload = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  location: string;
  summary: string;
  skills: string[];
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
};

type ResumeBuilderDraft = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  location: string;
  summary: string;
  skillsInput: string;
  experiences: ExperienceDraft[];
  projects: ProjectDraft[];
  education: EducationDraft[];
  certifications: CertificationDraft[];
};

const SAMPLE_DRAFT: ResumeBuilderDraft = {
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

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

  const [isGenerating, setIsGenerating] = useState(false);
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

      setName(textOrEmpty(parsed.name));
      setEmail(textOrEmpty(parsed.email));
      setPhone(textOrEmpty(parsed.phone));
      setLinkedin(textOrEmpty(parsed.linkedin));
      setPortfolio(textOrEmpty(parsed.portfolio));
      setLocation(textOrEmpty(parsed.location));
      setSummary(textOrEmpty(parsed.summary));
      setSkillsInput(textOrEmpty(parsed.skillsInput));

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
        name,
        email,
        phone,
        linkedin,
        portfolio,
        location,
        summary,
        skillsInput,
        experiences,
        projects,
        education,
        certifications,
      };

      localStorage.setItem(RESUME_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setLastSavedAt(new Date());
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [
    name,
    email,
    phone,
    linkedin,
    portfolio,
    location,
    summary,
    skillsInput,
    experiences,
    projects,
    education,
    certifications,
    isDraftReady,
  ]);

  const parsedSkills = useMemo(
    () =>
      toSkills(skillsInput)
        .map((skill) => clampText(skill, MAX_SKILL_LENGTH))
        .filter(Boolean)
        .slice(0, MAX_SKILLS),
    [skillsInput]
  );

  const skillCount = parsedSkills.length;
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

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setLinkedin("");
    setPortfolio("");
    setLocation("");
    setSummary("");
    setSkillsInput("");
    setExperiences([{ id: createDraftId(), ...EMPTY_EXPERIENCE }]);
    setProjects([{ id: createDraftId(), ...EMPTY_PROJECT }]);
    setEducation([{ id: createDraftId(), ...EMPTY_EDUCATION }]);
    setCertifications([{ id: createDraftId(), ...EMPTY_CERTIFICATION }]);
    setError(null);
    setSuccessMessage(null);
    setLastSavedAt(null);
    localStorage.removeItem(RESUME_DRAFT_STORAGE_KEY);
  };

  const loadSampleData = () => {
    const hasContent = Boolean(
      name.trim() ||
        email.trim() ||
        phone.trim() ||
        linkedin.trim() ||
        portfolio.trim() ||
        location.trim() ||
        summary.trim() ||
        parsedSkills.length > 0 ||
        experiences.some((item) => hasExperienceContent(item)) ||
        projects.some((item) => hasProjectContent(item)) ||
        education.some((item) => hasEducationContent(item)) ||
        certifications.some((item) => hasCertificationContent(item))
    );

    if (
      hasContent &&
      !window.confirm("This will replace your current entries with sample data. Continue?")
    ) {
      return;
    }

    setName(SAMPLE_DRAFT.name);
    setEmail(SAMPLE_DRAFT.email);
    setPhone(SAMPLE_DRAFT.phone);
    setLinkedin(SAMPLE_DRAFT.linkedin);
    setPortfolio(SAMPLE_DRAFT.portfolio);
    setLocation(SAMPLE_DRAFT.location);
    setSummary(SAMPLE_DRAFT.summary);
    setSkillsInput(SAMPLE_DRAFT.skillsInput);
    setExperiences(SAMPLE_DRAFT.experiences.map((item) => ({ ...item, id: createDraftId() })));
    setProjects(SAMPLE_DRAFT.projects.map((item) => ({ ...item, id: createDraftId() })));
    setEducation(SAMPLE_DRAFT.education.map((item) => ({ ...item, id: createDraftId() })));
    setCertifications(SAMPLE_DRAFT.certifications.map((item) => ({ ...item, id: createDraftId() })));
    setError(null);
    setSuccessMessage("Sample profile loaded. Customize and generate your own PDF.");
  };

  const clearSavedDraft = () => {
    localStorage.removeItem(RESUME_DRAFT_STORAGE_KEY);
    setLastSavedAt(null);
    setSuccessMessage("Saved draft cleared. Current form remains on screen and will autosave on your next edit.");
  };

  const buildPayload = (): ResumeGeneratePayload => {
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

    return {
      name: clampText(name, MAX_NAME_LENGTH),
      email: clampText(email, MAX_EMAIL_LENGTH),
      phone: clampText(phone, MAX_PHONE_LENGTH),
      linkedin: clampText(linkedin, MAX_LINKEDIN_LENGTH),
      portfolio: clampText(portfolio, MAX_PORTFOLIO_LENGTH),
      location: clampText(location, MAX_LOCATION_LENGTH),
      summary: clampText(summary, MAX_SUMMARY_LENGTH),
      skills: parsedSkills,
      experience: trimmedExperiences,
      projects: trimmedProjects,
      education: trimmedEducation,
      certifications: trimmedCertifications,
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

    return "Failed to generate resume PDF. Please check your entries and try again.";
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
      const payload = buildPayload();

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
            Build a polished resume PDF in minutes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
            Fill your details once, generate a clean resume instantly, and download it as PDF using the built-in template engine.
          </p>
        </m.header>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-2 space-y-6">
            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-4">
                <FileText size={15} /> Identity
              </h2>

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
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24">
            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                Quick Snapshot
              </h2>
              <div className="space-y-2.5">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Skills
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{skillCount}</span>
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

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 p-4">
                <div className="max-h-[34rem] overflow-y-auto pr-1 space-y-4">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                    <p className="text-base font-black text-gray-900 dark:text-white leading-tight">
                      {name.trim() || "Your Name"}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      {[location.trim(), phone.trim(), email.trim()].filter(Boolean).join(" • ") ||
                        "Location • email@example.com"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {linkedin.trim() && (
                        <span className="text-[10px] font-medium px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                          LinkedIn: {previewSnippet(clampText(linkedin, MAX_LINKEDIN_LENGTH), 34)}
                        </span>
                      )}
                      {portfolio.trim() && (
                        <span className="text-[10px] font-medium px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                          Portfolio: {previewSnippet(clampText(portfolio, MAX_PORTFOLIO_LENGTH), 34)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      Summary
                    </p>
                    <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">
                      {summary.trim()
                        ? previewSnippet(clampText(summary, MAX_SUMMARY_LENGTH), 300)
                        : "Add your professional summary to preview your narrative here."}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedSkills.length === 0 ? (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">No skills added yet</span>
                      ) : (
                        <>
                          {parsedSkills.slice(0, 12).map((skill, index) => (
                            <span
                              key={`preview-skill-${index}-${skill}`}
                              className="text-[10px] font-semibold px-2 py-1 rounded-md border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                            >
                              {skill}
                            </span>
                          ))}
                          {parsedSkills.length > 12 && (
                            <span className="text-[10px] font-semibold px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                              +{parsedSkills.length - 12} more
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      Experience
                    </p>
                    {previewExperienceItems.length === 0 ? (
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">No roles added yet</p>
                    ) : (
                      <div className="space-y-2.5">
                        {previewExperienceItems.map((item, index) => (
                          <div
                            key={`preview-exp-${index}`}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-black/20 px-2.5 py-2"
                          >
                            <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">
                              {item.role || "Role"}
                              {item.company ? ` • ${item.company}` : ""}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">{item.period || "Period"}</p>
                            {item.highlights.length > 0 && (
                              <div className="space-y-1">
                                {item.highlights.map((highlight, highlightIndex) => (
                                  <p
                                    key={`preview-exp-highlight-${index}-${highlightIndex}`}
                                    className="text-[10px] text-gray-600 dark:text-gray-300 leading-relaxed"
                                  >
                                    • {previewSnippet(highlight, 120)}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      Projects
                    </p>
                    {previewProjectItems.length === 0 ? (
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">No projects added yet</p>
                    ) : (
                      <div className="space-y-2.5">
                        {previewProjectItems.map((item, index) => (
                          <div
                            key={`preview-project-${index}`}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-black/20 px-2.5 py-2"
                          >
                            <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">
                              {item.title || "Project"}
                              {item.period ? ` • ${item.period}` : ""}
                            </p>
                            <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-relaxed mt-1">
                              {item.description
                                ? previewSnippet(item.description, 120)
                                : "Add project details to preview impact."}
                            </p>
                            {item.techStack.length > 0 && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
                                {item.techStack.join(" • ")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-black/20 px-2.5 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                        Education
                      </p>
                      {previewEducationItems.length === 0 ? (
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Not added</p>
                      ) : (
                        previewEducationItems.map((item, index) => (
                          <p key={`preview-education-${index}`} className="text-[10px] text-gray-700 dark:text-gray-300">
                            {item.program || "Program"}
                            {item.institution ? `, ${item.institution}` : ""}
                            {item.period ? ` (${item.period})` : ""}
                          </p>
                        ))
                      )}
                    </div>

                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-black/20 px-2.5 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                        Certifications
                      </p>
                      {previewCertificationItems.length === 0 ? (
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Not added</p>
                      ) : (
                        previewCertificationItems.map((item, index) => (
                          <p
                            key={`preview-cert-${index}`}
                            className="text-[10px] text-gray-700 dark:text-gray-300 leading-relaxed"
                          >
                            {item.name || "Certification"}
                            {item.issuer ? ` • ${item.issuer}` : ""}
                            {item.year ? ` (${item.year})` : ""}
                          </p>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[10px] text-gray-500 dark:text-gray-400">
                Preview shows the first 2 entries from each section to keep it readable while you edit.
              </p>
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

            <section className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300 space-y-2.5">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider px-4 py-3 transition-all inline-flex items-center justify-center gap-2"
              >
                <Download size={15} /> {isGenerating ? "Generating..." : "Generate PDF"}
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
          </aside>
        </form>
      </div>
    </div>
  );
}
