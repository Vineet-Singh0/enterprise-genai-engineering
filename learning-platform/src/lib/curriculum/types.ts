export type DomainId = 'ENG' | 'AIF' | 'LLM' | 'RET' | 'AGT' | 'PROD' | 'ENT';

export interface DocumentNode {
  id: string;
  title: string;
  fileName: string;
  relativePath: string;
  slug: string;
  href: string;
  isReadme: boolean;
  order: number;
}

export interface ChapterNode {
  id: string;
  code: string;
  title: string;
  folderName: string;
  relativePath: string;
  slug: string;
  href: string;
  readme?: DocumentNode;
  documents: DocumentNode[];
}

export interface DomainNode {
  id: DomainId;
  name: string;
  folderName: string;
  slug: string;
  href: string;
  description: string;
  chapters: ChapterNode[];
}

export interface CurriculumGraph {
  domains: DomainNode[];
  documentsByHref: Record<string, DocumentNode & { domainId: DomainId; chapterSlug: string }>;
  shortIdIndex: Record<string, string>;
}

export const DOMAIN_ORDER: DomainId[] = ['ENG', 'AIF', 'LLM', 'RET', 'AGT', 'PROD', 'ENT'];

export const DOMAIN_META: Record<
  DomainId,
  { name: string; description: string; accent: string }
> = {
  ENG: {
    name: 'Engineering Foundations',
    description: 'Computer science, software engineering, networking, databases, and concurrency foundations.',
    accent: '#2f6fed',
  },
  AIF: {
    name: 'AI Foundations',
    description: 'Mathematics, machine learning, deep learning, and transformer foundations.',
    accent: '#0f8a5f',
  },
  LLM: {
    name: 'LLM Engineering',
    description: 'Tokenization, inference, context engineering, evaluation, and model decisions.',
    accent: '#8a5a00',
  },
  RET: {
    name: 'Retrieval Engineering',
    description: 'Retrieval pipelines, indexing, hybrid search, ranking, and evaluation.',
    accent: '#b45309',
  },
  AGT: {
    name: 'Agent Engineering',
    description: 'Agent systems, tools, memory, workflows, multi-agent design, and reliability.',
    accent: '#7c3aed',
  },
  PROD: {
    name: 'Production AI Engineering',
    description: 'Serving, deployment, observability, reliability, security, and operations.',
    accent: '#be123c',
  },
  ENT: {
    name: 'Enterprise AI Systems',
    description: 'Enterprise architecture, governance, risk, FinOps, and platform strategy.',
    accent: '#0e7490',
  },
};
