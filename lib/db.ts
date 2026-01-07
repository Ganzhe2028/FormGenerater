import fs from 'fs';
import path from 'path';
import { FormSchema } from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const DATA_DIR = path.join(process.cwd(), 'data');

interface Submission {
  id: string;
  formId: string;
  data: any;
  submittedAt: string;
}

interface Database {
  forms: FormSchema[];
  submissions: Submission[];
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure db file exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ forms: [], submissions: [] }, null, 2));
}

function readDb(): Database {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { forms: [], submissions: [] };
  }
}

function writeDb(data: Database) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const db = {
  getForms: () => readDb().forms,
  getForm: (id: string) => readDb().forms.find((f) => f.id === id),
  saveForm: (form: FormSchema) => {
    const data = readDb();
    // Check if form exists
    const existingIndex = data.forms.findIndex(f => f.id === form.id);
    if (existingIndex >= 0) {
      data.forms[existingIndex] = form;
    } else {
      data.forms.push(form);
    }
    writeDb(data);
  },
  getSubmissions: (formId: string) => readDb().submissions.filter((s) => s.formId === formId),
  addSubmission: (submission: Submission) => {
    const data = readDb();
    data.submissions.push(submission);
    writeDb(data);
  },
};
