import { describe, it, expect } from 'vitest';
import { estimateExperienceYears } from '@/lib/career-utils';

describe('estimateExperienceYears', () => {
  it('should extract years from "X years of experience" pattern', () => {
    expect(estimateExperienceYears('I have 5 years of experience in React.')).toBe(5);
    expect(estimateExperienceYears('10+ years of exp.')).toBe(10);
    expect(estimateExperienceYears('Experience of about 3 yrs in sales.')).toBe(3);
  });

  it('should extract years from date ranges', () => {
    const currentYear = new Date().getFullYear();
    // 2020 - present
    expect(estimateExperienceYears('Worked at Google from 2020 - present')).toBe(currentYear - 2020);
    // 2015 to now
    expect(estimateExperienceYears('Software Engineer (2015 to now)')).toBe(currentYear - 2015);
  });

  it('should handle multiple date ranges and pick the earliest start', () => {
    const currentYear = new Date().getFullYear();
    const resume = `
      Senior Dev (2022-present)
      Junior Dev (2018-2022)
      Intern (2017-2018)
    `;
    // Note: The current implementation finds the earliest start year among ALL matched ranges.
    // Earliest start in this text is 2017.
    expect(estimateExperienceYears(resume)).toBe(currentYear - 2017);
  });

  it('should return undefined if no experience pattern is found', () => {
    expect(estimateExperienceYears('Hello, I am a software engineer.')).toBeUndefined();
    expect(estimateExperienceYears('')).toBeUndefined();
  });

  it('should ignore unrealistic year counts', () => {
    expect(estimateExperienceYears('I have 99 years of experience.')).toBeUndefined();
  });
});
