// src/types/index.ts — Brainbox AI Type Definitions

// ─── Enums ──────────────────────────────────────────

export enum Role {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  ADMIN = "ADMIN",
}

export enum QuestionType {
  MCQ = "MCQ",
  SHORT_ANSWER = "SHORT_ANSWER",
  LONG_ANSWER = "LONG_ANSWER",
}

// ─── User Types ─────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

// ─── Auth Types ─────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string | null;
  };
}

// ─── Course Types ───────────────────────────────────

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  subject: string;
  code: string;
  imageUrl?: string | null;
  createdAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  role: Role;
  joinedAt: Date;
  course?: Course;
  user?: User;
}

// ─── Note Types ─────────────────────────────────────

export interface Note {
  id: string;
  title: string;
  subject: string;
  topic?: string | null;
  fileUrl: string;
  fileType: string;
  fileSize?: number | null;
  summary?: string | null;
  uploadedBy: string;
  courseId?: string | null;
  createdAt: Date;
  uploader?: User;
  course?: Course;
}

export interface NoteUploadData {
  title: string;
  subject: string;
  topic?: string;
  courseId?: string;
  file: File;
}

// ─── Video Types ────────────────────────────────────

export interface Video {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  uploadedBy: string;
  courseId?: string | null;
  createdAt: Date;
  uploader?: User;
  progress?: VideoProgress;
}

export interface VideoProgress {
  id: string;
  userId: string;
  videoId: string;
  watchedSeconds: number;
  completed: boolean;
  lastWatchedAt: Date;
}

// ─── Quiz Types ─────────────────────────────────────

export interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  courseId?: string | null;
  createdById: string;
  timeLimit?: number | null;
  isPublished: boolean;
  createdAt: Date;
  questions?: QuizQuestion[];
  _count?: { questions: number; attempts: number };
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  question: string;
  options?: string[] | null;
  correctAnswer: string;
  points: number;
  order: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score?: number | null;
  maxScore?: number | null;
  percentage?: number | null;
  startedAt: Date;
  submittedAt?: Date | null;
  answers?: QuizAnswer[];
  quiz?: Quiz;
}

export interface QuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer: string;
  isCorrect?: boolean | null;
  aiFeedback?: string | null;
}

// ─── Exam Types ─────────────────────────────────────

export interface Exam {
  id: string;
  title: string;
  description?: string | null;
  courseId?: string | null;
  createdById: string;
  timeLimit: number;
  isPublished: boolean;
  startTime?: Date | null;
  endTime?: Date | null;
  createdAt: Date;
  sections?: ExamSection[];
}

export interface ExamSection {
  id: string;
  examId: string;
  title: string;
  description?: string | null;
  order: number;
  questions?: ExamQuestion[];
}

export interface ExamQuestion {
  id: string;
  sectionId: string;
  type: QuestionType;
  question: string;
  options?: string[] | null;
  correctAnswer?: string | null;
  points: number;
  order: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  score?: number | null;
  maxScore?: number | null;
  percentage?: number | null;
  startedAt: Date;
  submittedAt?: Date | null;
  autoSubmit: boolean;
  answers?: ExamAnswer[];
  exam?: Exam;
}

export interface ExamAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer: string;
  isCorrect?: boolean | null;
  score?: number | null;
  aiFeedback?: string | null;
}

// ─── AI / Chat Types ────────────────────────────────

export interface ChatSession {
  id: string;
  userId: string;
  title?: string | null;
  context?: string | null;
  createdAt: Date;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface AISummarizeRequest {
  noteId: string;
  content?: string;
}

export interface AIQuizGenerateRequest {
  topic: string;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard";
  questionType: QuestionType;
}

export interface AIFeedbackRequest {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
}

// ─── Analytics Types ────────────────────────────────

export interface StudentPerformance {
  quizScores: { quizTitle: string; percentage: number; date: Date }[];
  examScores: { examTitle: string; percentage: number; date: Date }[];
  averageScore: number;
  totalAttempts: number;
  completionRate: number;
}

export interface ClassAnalytics {
  averageScore: number;
  topPerformers: { name: string; average: number }[];
  weakTopics: { topic: string; averageScore: number }[];
  scoreDistribution: { range: string; count: number }[];
}

// ─── API Response Types ─────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Contact Types ──────────────────────────────────

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}