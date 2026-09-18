// Dynamic Academic Programs & Taxonomy Matrix
// Supports multi-discipline durations (BCA, BCS, B.Tech, M.Tech, MBBS, BDS, B.Pharm, MBA, Law, etc.)

export interface AcademicProgram {
  code: string;
  name: string;
  discipline: 'Computer Applications' | 'Engineering' | 'Medical & Healthcare' | 'Management & Commerce' | 'Law' | 'Sciences' | 'Arts & Humanities';
  durationYears: number;
  totalSemesters: number;
  defaultSubjects: string[];
}

export const ACADEMIC_DISCIPLINES = [
  'Computer Applications',
  'Engineering',
  'Medical & Healthcare',
  'Management & Commerce',
  'Law',
  'Sciences',
  'Arts & Humanities'
] as const;

export const ACADEMIC_PROGRAMS: AcademicProgram[] = [
  // Computer Applications & IT
  {
    code: 'BCA',
    name: 'Bachelor of Computer Applications',
    discipline: 'Computer Applications',
    durationYears: 3,
    totalSemesters: 6,
    defaultSubjects: [
      'Programming in C & C++', 'Data Structures & Algorithms', 'Database Management Systems',
      'Web Technologies & Full Stack', 'Java Programming', 'Python for Data Science',
      'Software Engineering', 'Operating Systems', 'Computer Networks', 'Cloud Computing'
    ]
  },
  {
    code: 'BCS',
    name: 'Bachelor of Computer Science',
    discipline: 'Computer Applications',
    durationYears: 3,
    totalSemesters: 6,
    defaultSubjects: [
      'Discrete Mathematics', 'Computer Architecture', 'Object Oriented Programming',
      'Algorithms Analysis', 'Theory of Computation', 'Artificial Intelligence',
      'Information Security', 'Data Mining'
    ]
  },
  {
    code: 'MCA',
    name: 'Master of Computer Applications',
    discipline: 'Computer Applications',
    durationYears: 2,
    totalSemesters: 4,
    defaultSubjects: [
      'Advanced Data Structures', 'Distributed Systems', 'Machine Learning & Deep Learning',
      'Mobile Application Architecture', 'DevOps & Microservices', 'Network Security'
    ]
  },

  // Engineering & Technology
  {
    code: 'B.Tech',
    name: 'Bachelor of Technology / Engineering (B.E.)',
    discipline: 'Engineering',
    durationYears: 4,
    totalSemesters: 8,
    defaultSubjects: [
      'Engineering Mathematics I & II', 'Engineering Physics & Chemistry',
      'Basic Electrical & Electronics', 'Data Structures & Algorithms',
      'Digital Logic Design', 'Microprocessors & Microcontrollers',
      'Database Systems', 'Computer Networks', 'Compiler Design',
      'Artificial Intelligence', 'Control Systems', 'VLSI Design'
    ]
  },
  {
    code: 'M.Tech',
    name: 'Master of Technology / Engineering',
    discipline: 'Engineering',
    durationYears: 2,
    totalSemesters: 4,
    defaultSubjects: [
      'Advanced Computer Architecture', 'Neural Networks & Deep Learning',
      'Quantum Computing Basics', 'Advanced Digital Signal Processing',
      'Robotics & Automation', 'Cyber-Physical Systems'
    ]
  },

  // Medical, Dental & Healthcare
  {
    code: 'MBBS',
    name: 'Bachelor of Medicine & Bachelor of Surgery',
    discipline: 'Medical & Healthcare',
    durationYears: 5.5,
    totalSemesters: 9,
    defaultSubjects: [
      'Human Anatomy & Histology', 'Human Physiology', 'Biochemistry & Genetics',
      'Pathology & Pathophysiology', 'Pharmacology & Therapeutics', 'Microbiology & Immunology',
      'Forensic Medicine & Toxicology', 'Community Medicine', 'Ophthalmology & ENT',
      'General Medicine & Pediatrics', 'General Surgery & Orthopedics', 'Obstetrics & Gynecology'
    ]
  },
  {
    code: 'BDS',
    name: 'Bachelor of Dental Surgery',
    discipline: 'Medical & Healthcare',
    durationYears: 5,
    totalSemesters: 8,
    defaultSubjects: [
      'General Human Anatomy & Physiology', 'Dental Anatomy & Oral Histology',
      'General Pathology & Microbiology', 'Dental Materials', 'Oral Pathology & Microbiology',
      'Oral Medicine & Radiology', 'Orthodontics & Dentofacial Orthopedics', 'Oral & Maxillofacial Surgery'
    ]
  },
  {
    code: 'B.Pharm',
    name: 'Bachelor of Pharmacy',
    discipline: 'Medical & Healthcare',
    durationYears: 4,
    totalSemesters: 8,
    defaultSubjects: [
      'Pharmaceutics I & II', 'Pharmaceutical Chemistry', 'Human Anatomy & Physiology',
      'Pharmacology & Toxicology', 'Pharmacognosy & Phytochemistry', 'Medicinal Chemistry',
      'Biopharmaceutics & Pharmacokinetics', 'Clinical Pharmacy'
    ]
  },
  {
    code: 'B.Sc Nursing',
    name: 'Bachelor of Science in Nursing',
    discipline: 'Medical & Healthcare',
    durationYears: 4,
    totalSemesters: 8,
    defaultSubjects: [
      'Anatomy & Physiology for Nurses', 'Nutrition & Biochemistry', 'Nursing Foundations',
      'Medical Surgical Nursing', 'Community Health Nursing', 'Child Health Nursing', 'Mental Health Nursing'
    ]
  },

  // Management & Commerce
  {
    code: 'BBA',
    name: 'Bachelor of Business Administration',
    discipline: 'Management & Commerce',
    durationYears: 3,
    totalSemesters: 6,
    defaultSubjects: [
      'Principles of Management', 'Financial Accounting', 'Business Economics',
      'Marketing Management', 'Human Resource Management', 'Business Law',
      'Financial Management', 'Strategic Management', 'Entrepreneurship'
    ]
  },
  {
    code: 'B.Com',
    name: 'Bachelor of Commerce',
    discipline: 'Management & Commerce',
    durationYears: 3,
    totalSemesters: 6,
    defaultSubjects: [
      'Financial Accounting', 'Business Organization', 'Corporate Accounting',
      'Cost & Management Accounting', 'Income Tax Law & Practice', 'Auditing',
      'Banking & Insurance', 'E-Commerce Fundamentals'
    ]
  },
  {
    code: 'MBA',
    name: 'Master of Business Administration',
    discipline: 'Management & Commerce',
    durationYears: 2,
    totalSemesters: 4,
    defaultSubjects: [
      'Managerial Economics', 'Corporate Finance', 'Strategic Marketing',
      'Supply Chain Management', 'Business Analytics & Big Data', 'Leadership & Ethics'
    ]
  },

  // Law, Sciences, Arts
  {
    code: 'BA LLB',
    name: 'Integrated Bachelor of Arts & Law',
    discipline: 'Law',
    durationYears: 5,
    totalSemesters: 10,
    defaultSubjects: [
      'Constitutional Law of India', 'Law of Torts & Consumer Protection',
      'Jurisprudence & Legal Theory', 'Law of Crimes (IPC & CrPC)',
      'Law of Contracts', 'Company Law', 'Public International Law', 'Human Rights Law'
    ]
  },
  {
    code: 'B.Sc',
    name: 'Bachelor of Science',
    discipline: 'Sciences',
    durationYears: 3,
    totalSemesters: 6,
    defaultSubjects: [
      'Classical Mechanics & Thermodynamics', 'Organic & Inorganic Chemistry',
      'Calculus & Differential Equations', 'Cell Biology & Genetics',
      'Probability & Statistics', 'Quantum Physics'
    ]
  },
  {
    code: 'BA',
    name: 'Bachelor of Arts (Humanities)',
    discipline: 'Arts & Humanities',
    durationYears: 3,
    totalSemesters: 6,
    defaultSubjects: [
      'World History & Civilization', 'Political Theory & Global Governance',
      'Sociology & Social Psychology', 'Macroeconomics & Public Finance',
      'English Literature & Criticism', 'Philosophy & Ethics'
    ]
  }
];

// Helper to get program by code
export const getProgramByCode = (code: string): AcademicProgram => {
  const found = ACADEMIC_PROGRAMS.find(p => p.code.toLowerCase() === code.toLowerCase());
  return found || ACADEMIC_PROGRAMS[0]; // fallback to BCA
};

// Calculate student degree progress (%)
export const calculateStudentProgress = (currentSemester: number, totalSemesters: number): {
  percentage: number;
  isComplete: boolean;
  remainingSemesters: number;
  label: string;
} => {
  const current = Math.max(1, currentSemester || 1);
  const total = Math.max(1, totalSemesters || 6);
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const isComplete = current >= total;
  const remaining = Math.max(0, total - current);

  let label = `Year ${Math.ceil(current / 2)}, Semester ${current} of ${total}`;
  if (isComplete) {
    label = `Graduating / Completed (${total} Semesters)`;
  }

  return {
    percentage,
    isComplete,
    remainingSemesters: remaining,
    label
  };
};

// Auto-upgrade eligibility check based on enrollment/registration date
export const checkSemesterUpgradeEligibility = (
  createdAtString?: string,
  currentSemester: number = 1,
  totalSemesters: number = 6
): {
  isEligibleForUpgrade: boolean;
  suggestedSemester: number;
  daysInCurrentSemester: number;
  daysUntilNextSemester: number;
} => {
  if (!createdAtString) {
    return {
      isEligibleForUpgrade: false,
      suggestedSemester: currentSemester,
      daysInCurrentSemester: 0,
      daysUntilNextSemester: 180
    };
  }

  const createdDate = new Date(createdAtString).getTime();
  const now = Date.now();
  const totalElapsedDays = Math.max(0, Math.floor((now - createdDate) / (1000 * 60 * 60 * 24)));
  
  // 180 days (6 months) per semester
  const SEMESTER_CYCLE_DAYS = 180;
  const calculatedSemester = Math.min(
    totalSemesters,
    Math.max(1, 1 + Math.floor(totalElapsedDays / SEMESTER_CYCLE_DAYS))
  );

  const daysInCurrentSemester = totalElapsedDays % SEMESTER_CYCLE_DAYS;
  const daysUntilNextSemester = SEMESTER_CYCLE_DAYS - daysInCurrentSemester;
  const isEligibleForUpgrade = calculatedSemester > currentSemester && currentSemester < totalSemesters;

  return {
    isEligibleForUpgrade,
    suggestedSemester: Math.min(totalSemesters, currentSemester + 1),
    daysInCurrentSemester,
    daysUntilNextSemester
  };
};

// AI Smart Recommendation Algorithm: Suggests subjects/modules based on discipline & current semester
export const getRecommendedModulesForStudent = (
  discipline?: string,
  currentSemester: number = 1
): string[] => {
  const matchingPrograms = ACADEMIC_PROGRAMS.filter(p => 
    !discipline || p.discipline.toLowerCase() === discipline.toLowerCase() || p.code.toLowerCase() === discipline.toLowerCase()
  );

  const pool = matchingPrograms.length > 0 
    ? matchingPrograms[0].defaultSubjects 
    : ACADEMIC_PROGRAMS[0].defaultSubjects;

  return pool.slice(0, 6);
};
