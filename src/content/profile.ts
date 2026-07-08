/**
 * Single source of truth for all site copy and data.
 * Compiled from Ericsson Raphael's four resume variants
 * (Backend, FullStack, Web3, Web Scraping) plus his brief.
 */

export const identity = {
  name: 'Ericsson Raphael',
  firstName: 'ERICSSON',
  lastName: 'RAPHAEL',
  headline: 'Software & Data Engineer',
  location: 'Lagos, Nigeria',
  coordinates: '6.5244°N 3.3792°E',
  // Roles cycled in the hero readout ticker: the engineer and the person.
  roles: [
    'SOFTWARE ENGINEER',
    'DATA ENGINEER',
    'MECHANICAL ENGINEER',
    'WEB3 BUILDER',
    'COMMERCIAL MODEL',
    'PHILOSOPHY ENTHUSIAST',
    'MUSIC LOVER',
    'SOCIAL BUTTERFLY',
  ],
};

/**
 * The clock started with the Side Hustle internship, October 2021.
 * Years of experience are computed from it so the site never goes stale.
 */
export const CAREER_START = { year: 2021, month: 10 };

export function yearsOfExperience(date: Date = new Date()): number {
  const months =
    (date.getFullYear() - CAREER_START.year) * 12 +
    (date.getMonth() + 1 - CAREER_START.month);
  return Math.max(1, Math.floor(months / 12));
  // return Math.max(1, Math.round(months / 12));
}

const YEAR_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
];

export function yearsOfExperienceWord(): string {
  const n = yearsOfExperience();
  return YEAR_WORDS[n] ?? String(n);
}

export type StatementSegment = { text: string; outline: boolean };

export const manifesto = {
  kicker: '02 / MANIFESTO',
  // Rendered as oversized statement lines; the outline segment carries
  // the black/white typographic gesture.
  statement: [
    { text: 'Engineer by craft,', outline: false },
    { text: 'adventurer at heart.', outline: true },
  ] as StatementSegment[],
  body: (): string[] => [
    `Ten industries in over ${yearsOfExperienceWord()} years: fintech, healthtech, edtech, HR tech, worktech, foodtech, energy, e-commerce, AI tooling, and web3. Every domain changes the language, but the craft stays the same: understand systems deeply, challenge assumptions early, translate messy business problems into clean architecture, and engineer software that stays scalable, resilient, and dependable long after the novelty fades.`,
    'The rest of me is louder. Philosophy enthusiast, eclectic music lover, commercial model, and adventurer at heart, always curious about people, ideas, and the stories that connect them, collecting experiences as eagerly as knowledge',
  ],
  stats: (): { value: string; label: string }[] => [
    { value: `${yearsOfExperience()}+`, label: 'years in production' },
    { value: '10', label: 'industries shipped for' },
    { value: '3', label: 'national hackathon placements' },
    { value: '1', label: 'team player of the year award' },
  ],
};

export type Engagement = {
  company: string;
  role: string;
  industry: string;
  year: string;
  current?: boolean;
  /** One paragraph: brief, in-depth, complexity-forward. */
  detail: string;
  links?: { label: string; href: string }[];
};

export type EngagementGroup = {
  label: string;
  items: Engagement[];
};

export const experience: EngagementGroup[] = [
  {
    label: 'FULL-TIME',
    items: [
      {
        company: 'Moniepoint',
        role: 'Backend Engineer',
        industry: 'FINTECH',
        year: '2026-NOW',
        // current: true,
        detail:
          "Core backend engineering inside one of Africa's largest business banking and payments platforms. Millions of businesses feel every decision.",
        links: [{ label: 'SITE', href: 'https://www.moniepoint.com/' }],
      },
      {
        company: 'Tobams Group',
        role: 'Backend Developer',
        industry: 'WORKTECH / EDTECH',
        year: '2024–26',
        detail:
          "Backbone engineering for an enterprise suite spanning a Mentorship-driven Corporate & Enterprise Tech ecosystem, AI-powered kids' edtech, a white-label B2B learning platform and a food supply-chain product. Named Team Player of the Year.",
        links: [
          { label: 'PROJECTS', href: 'https://www.tobamsgroup.com/projects' },
        ],
      },
      {
        company: 'Estrada International',
        role: 'Backend Engineer',
        industry: 'HRTECH',
        year: '2025',
        detail:
          'Led backend development of an NLP-driven applicant tracking system: automated resume parsing and job-description generation, layered onto a monetized social ecosystem with real-time messaging, role-based access control and payment subscriptions. Referral mechanics and live analytics gave product its first honest dashboard.',
        links: [{ label: 'SITE', href: 'https://www.estradaintl.com/' }],
      },
      {
        company: 'N.C.E.E.C',
        role: 'Software Engineer',
        industry: 'ENERGY',
        year: '2024',
        detail:
          'Led a cross-functional team delivering Enerdit, a national energy-audit platform. The hard part was the modeling: turning building and appliance data into audit computations and efficiency recommendations people could act on.',
        links: [{ label: 'LIVE', href: 'https://enerdit.netlify.app/' }],
      },
      {
        company: 'Side Hustle',
        role: 'Backend Developer Intern',
        industry: 'EDTECH',
        year: '2021–22',
        detail:
          'Where the clock started, October 2021. Python, JavaScript and data-structures drills under professional mentorship, with a capstone shipped every week applying backend concepts to real scenarios. The habit of shipping something weekly never left.',
        links: [{ label: 'PROGRAM', href: 'https://internship5.terrahq.co/' }],
      },
    ],
  },
  {
    label: 'CONTRACT',
    items: [
      {
        company: 'Baaraku',
        role: 'FullStack Automation Engineer',
        industry: 'AI / JOBTECH',
        year: '2026',
        detail:
          "Built an AI job-application engine for African talent and global seekers: candidates create or upload a CV, set titles, industries, locations and salary expectations, and the platform tailors resumes to specific openings, discovers matches across multiple job boards and assists the application itself. The complexity lives in the orchestration: discovery at scraping scale, LLM-driven tailoring, and automation that has to behave responsibly on someone's career.",
        links: [{ label: 'LIVE', href: 'https://jobpilot.baaraku.io/' }],
      },
      {
        company: 'Gloria & Young',
        role: 'FullStack Engineer',
        industry: 'HRTECH',
        year: '2025',
        detail:
          'Designed and shipped the corporate web platform end to end: physics-based simulations with Matter.js, scroll-driven choreography in Framer Motion, and an inquiry pipeline with client-side validation, API-driven email delivery and honest failure states on every path.',
        links: [
          { label: 'SITE', href: 'https://gloriaandyounghrconsulting.org/' },
        ],
      },
    ],
  },
  {
    label: 'FREELANCE',
    items: [
      {
        company: 'Elony-26',
        role: 'Frontend Engineer',
        industry: 'EVENTS',
        year: '2026',
        detail:
          "A wedding website where the stakes were personal: invitation-grade typography, a gallery and an RSVP flow that had to be flawless on every relative's phone. Sometimes the highest-pressure deploy is a wedding date.",
        links: [
          { label: 'CODE', href: 'https://github.com/gitEricsson/Elony-26' },
          { label: 'LIVE', href: 'https://elony26.netlify.app/' },
        ],
      },
      {
        company: 'Financial News Aggregator',
        role: 'Data Engineer',
        industry: 'QUANT FINANCE',
        year: '2024',
        detail:
          'A distributed Python scraping framework covering 450+ S&P 500 companies across a five-year span: intelligent proxy rotation, adaptive rate-limit recovery, multi-language date parsing, automatic failover and deduplication pipelines. Delivered 130K+ clean, structured articles at 99%+ extraction reliability for quantitative analysis.',
        links: [
          {
            label: 'CODE',
            href: 'https://github.com/gitEricsson/Financial-News-Aggregator',
          },
        ],
      },
      {
        company: 'Solar Energy Sizer',
        role: 'Software Engineer',
        industry: 'ENERGY',
        year: '2023',
        detail:
          'A server-rendered Flask tool estimating energy yield, efficiency and required cells for solar installations. The challenge was the math: integrating complex formulas, with a user-friendly interface and interactive visualizations for decision support.',
        links: [
          {
            label: 'CODE',
            href: 'https://github.com/gitEricsson/Solar_Energy_Sizer',
          },
        ],
      },
      {
        company: 'Bioproduct Flowrate Evaluator',
        role: 'Software Engineer',
        industry: 'INDUSTRIAL',
        year: '2022',
        detail:
          'A calculation engine for bioproduct flow rates across industrial processes: complex formula integration over 50+ unique parameter combinations, with interactive visualization built for decision support rather than decoration.',
        links: [
          {
            label: 'CODE',
            href: 'https://github.com/gitEricsson/Bioproduct_Flowrate_Evaluator',
          },
        ],
      },
    ],
  },
];

export const education = {
  school: 'University of Lagos',
  degree: 'B.Sc. Mechanical Engineering',
  industry: 'ENGINEERING',
};

export type Project = {
  index: string;
  title: string;
  category: string;
  year: string;
  stack: string;
  metric: string;
  /** Drives the generative hover preview pattern. */
  pattern: 'pulse' | 'blocks' | 'stream' | 'geo' | 'bridge' | 'wave' | 'bars';
  href?: string;
};

export const projects: Project[] = [
  {
    index: '01',
    title: 'MediBook',
    category: 'Healthcare Infrastructure',
    year: '2026',
    stack: 'Spring-Boot / Kafka / Cassandra / GCP',
    metric: 'Telemedicine, FHIR-compliant, event-driven',
    pattern: 'pulse',
    href: 'https://github.com/gitEricsson/MediBook',
  },
  {
    index: '02',
    title: 'MantleMuse',
    category: 'Web3 / Real World Assets',
    year: '2026',
    stack: 'Solidity / Foundry / Next.js / Pyth',
    metric: 'Fractional blue-chip art from $10, ERC-1155',
    pattern: 'blocks',
    href: 'https://github.com/gitEricsson/MantleMuse',
  },
  {
    index: '03',
    title: 'Tixxety',
    category: 'Geospatial API',
    year: '2025',
    stack: 'FastAPI / PostGIS / Celery',
    metric: 'Location-aware ticketing with a proximity feed',
    pattern: 'geo',
    href: 'https://github.com/gitEricsson/TIXXETY',
  },
  {
    index: '04',
    title: 'DeflexBridge',
    category: 'Cross-chain Bridge',
    year: '2024',
    stack: 'Rust / ICP / Azle',
    metric: 'Top 17 national, ICP hackathon',
    pattern: 'bridge',
    href: 'https://github.com/gitEricsson/DeflexBridge',
  },
  {
    index: '05',
    title: 'Billboard Hot 100 Engine',
    category: 'Music Data Extraction',
    year: '2023',
    stack: 'Python / Selenium / lxml',
    metric: 'Dual-layer engine with JS-rendering fallback',
    pattern: 'bars',
    href: 'https://github.com/gitEricsson/Billboard-Hot-100-Scraper',
  },
];

/**
 * The stack credits. Five disciplines, equal billing, rolled like the
 * cast of a film. Order here = column order on screen.
 */
export type StackRow = { label: string; items: string[] };

export const stackRows: StackRow[] = [
  {
    label: 'LANGUAGES',
    items: [
      'TypeScript',
      'Python',
      'Java',
      'Rust',
      'C#',
      'JavaScript',
      'SQL',
      'Solidity',
    ],
  },
  {
    label: 'FULLSTACK',
    items: [
      'Next.js',
      'React',
      'Tailwind CSS',
      'Framer Motion',
      'Node.js',
      'Express',
      'NestJS',
      'Spring Boot',
      'Django',
      'FastAPI',
      'Flask',
      'GraphQL',
      'gRPC',
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'RabbitMQ',
    ],
  },
  {
    label: 'DATA ENGINEERING',
    items: [
      'Apache Spark',
      'Hadoop',
      'Flink',
      'Airflow',
      'Kafka',
      'dbt',
      'Snowflake',
      'BigQuery',
      'Redshift',
      'Databricks',
      'Delta Lake',
      'Iceberg',
      'Trino',
      'Hive',
      'Cassandra',
      'Data Lakes',
      'Warehousing',
      'ETL / ELT',
      'Pandas',
      'NumPy',
      'BeautifulSoup',
      'Selenium',
    ],
  },
  {
    label: 'INFRA',
    items: [
      'AWS',
      'GCP',
      'Docker',
      'Kubernetes',
      'Nginx',
      'GitHub Actions',
      'Prometheus',
      'OpenTelemetry',
      'Grafana',
    ],
  },
  {
    label: 'WEB3',
    items: [
      'Ethers.js',
      'Foundry',
      'Hardhat',
      'ICP',
      'Wagmi',
      'Pyth',
      'IPFS',
      'OpenZeppelin',
    ],
  },
];

export const contact = {
  kicker: '06 / SIGNAL',
  headline: 'OUR STORY STARTS HERE',
  line: 'Lagos-based, remote-ready. Open to software and data roles, web3 builds, and modeling work.',
  email: 'ericssonraphael@gmail.com',
  links: [
    { label: 'GITHUB', href: 'https://github.com/gitEricsson' },
    { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/ericssonraphael' },
    { label: 'INSTAGRAM', href: 'https://www.instagram.com/ericssonraphael' },
    { label: 'EMAIL', href: 'mailto:ericssonraphael@gmail.com' },
  ],
};
