
export interface JobInfo {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  url: string;
  description: string;
  requirements: string[];
  dateCaptured: string;
  status: 'captured' | 'applied' | 'interview' | 'rejected';
}

export type ExtractionMode = 'auto' | 'ocr';

export interface ExtractionResult {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  description?: string;
  requirements?: string[];
}
