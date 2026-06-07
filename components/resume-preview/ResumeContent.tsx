import React from 'react';

export interface ResumeContentProps {
  name: string;
  templateId: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  skills: string[];
  languages: string[];
  technologies: string[];
  experienceItems: any[];
  projectItems: any[];
  educationItems: any[];
  certificationItems: any[];
  publicationItems: any[];
  customSectionItems: any[];
}

export function ResumeContent({
  name,
  templateId,
  location,
  phone,
  email,
  linkedin,
  portfolio,
  summary,
  skills,
  languages,
  technologies,
  experienceItems,
  projectItems,
  educationItems,
  certificationItems,
  publicationItems,
  customSectionItems,
}: ResumeContentProps) {
  // We use serif for RenderCV classic, sans for Modern
  const fontClass = templateId === 'rendercv' ? 'font-serif' : 'font-sans';
  const headerFontClass = templateId === 'rendercv' ? 'font-serif' : 'font-sans';

  return (
    <div className={`w-full bg-white text-black p-8 ${fontClass}`} style={{ minHeight: '100%' }}>
      {/* Header section - we consider this unbreakable */}
      <div className="resume-item text-center mb-6" data-no-break="true">
        <h1 className={`text-4xl font-bold mb-2 ${headerFontClass}`}>{name.trim() || 'Your Name'}</h1>
        <div className="text-sm flex flex-wrap justify-center gap-2 text-gray-700">
          {[location.trim(), phone.trim(), email.trim()].filter(Boolean).map((item, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1">•</span>}
              {item}
            </span>
          ))}
        </div>
        <div className="text-sm flex flex-wrap justify-center gap-2 mt-1 text-gray-700">
          {[linkedin.trim(), portfolio.trim()].filter(Boolean).map((item, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1">•</span>}
              {item}
            </span>
          ))}
        </div>
      </div>

      {summary.trim() && (
        <div className="resume-section mb-6">
          <h2 className={`resume-section-title text-lg font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider ${headerFontClass}`}>
            Summary
          </h2>
          <div className="resume-item text-sm leading-relaxed text-justify">
            {summary.trim()}
          </div>
        </div>
      )}

      {(skills.length > 0 || languages.length > 0 || technologies.length > 0) && (
        <div className="resume-section mb-6">
          <h2 className={`resume-section-title text-lg font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider ${headerFontClass}`}>
            Skills
          </h2>
          <div className="resume-item text-sm leading-relaxed space-y-1">
            {skills.length > 0 && (
              <div><span className="font-bold">Core Competencies:</span> {skills.join(', ')}</div>
            )}
            {languages.length > 0 && (
              <div><span className="font-bold">Languages:</span> {languages.join(', ')}</div>
            )}
            {technologies.length > 0 && (
              <div><span className="font-bold">Technologies:</span> {technologies.join(', ')}</div>
            )}
          </div>
        </div>
      )}

      {experienceItems.length > 0 && (
        <div className="resume-section mb-6">
          <h2 className={`resume-section-title text-lg font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider ${headerFontClass}`}>
            Experience
          </h2>
          {experienceItems.map((item, idx) => (
            <div key={idx} className="resume-item mb-4 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-[15px]">{item.role || 'Role'}</h3>
                <span className="text-sm font-medium">{item.period || 'Period'}</span>
              </div>
              {item.company && <div className="text-sm font-semibold mb-2">{item.company}</div>}
              {item.highlights && item.highlights.length > 0 && (
                <ul className="list-disc pl-5 space-y-1 text-sm text-justify">
                  {item.highlights.map((highlight: string, hIdx: number) => (
                    <li key={hIdx} className="pl-1 leading-relaxed">{highlight}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {projectItems.length > 0 && (
        <div className="resume-section mb-6">
          <h2 className={`resume-section-title text-lg font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider ${headerFontClass}`}>
            Projects
          </h2>
          {projectItems.map((item, idx) => (
            <div key={idx} className="resume-item mb-4 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-[15px]">{item.title || 'Project Title'}</h3>
                {item.period && <span className="text-sm font-medium">{item.period}</span>}
              </div>
              {item.description && <div className="text-sm leading-relaxed text-justify mb-1">{item.description}</div>}
              {item.techStack && item.techStack.length > 0 && (
                <div className="text-sm italic text-gray-700">Technologies: {item.techStack.join(', ')}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {educationItems.length > 0 && (
        <div className="resume-section mb-6">
          <h2 className={`resume-section-title text-lg font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider ${headerFontClass}`}>
            Education
          </h2>
          {educationItems.map((item, idx) => (
            <div key={idx} className="resume-item mb-3 last:mb-0 flex justify-between items-start">
              <div>
                <div className="font-bold text-[15px]">{item.institution || 'Institution'}</div>
                <div className="text-sm">{item.program || 'Program'}</div>
              </div>
              {item.period && <div className="text-sm font-medium shrink-0 ml-4">{item.period}</div>}
            </div>
          ))}
        </div>
      )}

      {certificationItems.length > 0 && (
        <div className="resume-section mb-6">
          <h2 className={`resume-section-title text-lg font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider ${headerFontClass}`}>
            Certifications
          </h2>
          {certificationItems.map((item, idx) => (
            <div key={idx} className="resume-item mb-2 last:mb-0 flex justify-between items-start">
              <div>
                <span className="font-bold text-sm">{item.name || 'Certification'}</span>
                {item.issuer && <span className="text-sm"> - {item.issuer}</span>}
              </div>
              {item.year && <span className="text-sm shrink-0 ml-4">{item.year}</span>}
            </div>
          ))}
        </div>
      )}

      {publicationItems.length > 0 && (
        <div className="resume-section mb-6">
          <h2 className={`resume-section-title text-lg font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider ${headerFontClass}`}>
            Publications
          </h2>
          {publicationItems.map((item, idx) => (
            <div key={idx} className="resume-item mb-2 last:mb-0">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm">{item.title || 'Publication'}</span>
                {item.date && <span className="text-sm shrink-0 ml-4">{item.date}</span>}
              </div>
              {item.venue && <div className="text-sm italic">{item.venue}</div>}
            </div>
          ))}
        </div>
      )}

      {customSectionItems.length > 0 && (
        <>
          {customSectionItems.map((section, idx) => (
            <div key={idx} className="resume-section mb-6">
              <h2 className={`resume-section-title text-lg font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider ${headerFontClass}`}>
                {section.title || 'Custom Section'}
              </h2>
              {section.entries && section.entries.length > 0 && (
                <div className="resume-item">
                  <ul className="list-disc pl-5 space-y-1 text-sm text-justify">
                    {section.entries.map((entry: string, eIdx: number) => (
                      <li key={eIdx} className="pl-1 leading-relaxed">{entry}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
