import fs from 'fs';
import path from 'path';
import { FormSchema, Submission } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FORMS_DIR = path.join(DATA_DIR, 'forms');
const SUBMISSIONS_DIR = path.join(DATA_DIR, 'submissions');

// Ensure directories exist
[DATA_DIR, FORMS_DIR, SUBMISSIONS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export const db = {
  getForms: (): FormSchema[] => {
    try {
      const files = fs.readdirSync(FORMS_DIR);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const content = fs.readFileSync(path.join(FORMS_DIR, f), 'utf-8');
          return JSON.parse(content) as FormSchema;
        })
        .sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error reading forms:', error);
      return [];
    }
  },

  getForm: (id: string): FormSchema | undefined => {
    const filePath = path.join(FORMS_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) return undefined;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return undefined;
    }
  },

  saveForm: (form: FormSchema) => {
    const filePath = path.join(FORMS_DIR, `${form.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(form, null, 2));
  },

  deleteForm: (id: string) => {
    const formPath = path.join(FORMS_DIR, `${id}.json`);
    const submissionsPath = path.join(SUBMISSIONS_DIR, `${id}.json`);
    if (fs.existsSync(formPath)) fs.unlinkSync(formPath);
    if (fs.existsSync(submissionsPath)) fs.unlinkSync(submissionsPath);
  },

  getSubmissions: (formId: string): Submission[] => {
    const filePath = path.join(SUBMISSIONS_DIR, `${formId}.json`);
    if (!fs.existsSync(filePath)) return [];
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return [];
    }
  },

  addSubmission: (submission: Submission) => {
    const filePath = path.join(SUBMISSIONS_DIR, `${submission.formId}.json`);
    let submissions: Submission[] = [];
    if (fs.existsSync(filePath)) {
      try {
        submissions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch {}
    }
    submissions.push(submission);
    fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));
  },
};