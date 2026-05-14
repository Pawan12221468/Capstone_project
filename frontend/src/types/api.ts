// API Response Types
export interface ApiResponse<T> {
  message: string;
  data?: T;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Document Types
export interface Document {
  id: string;
  title: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: string;
  extractedText?: string;
  summary?: string;
  metadata?: {
    importantPoints?: string[];
    keywords?: string[];
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface DocumentResponse {
  message: string;
  document: Document;
}

export interface DocumentsResponse {
  documents: Document[];
}

// Chat Types
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  sources?: string[];
  confidence?: number;
}

export interface ChatSession {
  id: string;
  title?: string;
  documentId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionWithDocument extends ChatSession {
  document: {
    id: string;
    title: string;
    filename: string;
  };
  messages: Message[];
}

export interface ChatSessionResponse {
  message: string;
  session: ChatSession;
}

export interface MessagesResponse {
  sessionId: string;
  document: {
    id: string;
    title: string;
    filename: string;
  };
  messages: Message[];
}

export interface SendMessageResponse {
  message: string;
  userMessage: Message;
  assistantMessage: Message;
}

export interface ChatSessionsResponse {
  sessions: ChatSessionWithDocument[];
}

// AI Types
export interface SummaryResponse {
  message: string;
  summary: string;
}

export interface QuestionsResponse {
  message: string;
  questions: string[];
}

// Roadmap Types
export interface RoadmapPhase {
  name: string;
  level: string;
  duration: string;
  topics: string[];
  projects: string[];
}

export interface RoadmapData {
  topic: string;
  description: string;
  estimatedTotalTime: string;
  phases: RoadmapPhase[];
}

export interface Roadmap {
  id: string;
  topic: string;
  content: RoadmapData;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface RoadmapResponse {
  message: string;
  roadmap: Roadmap;
}

export interface RoadmapsResponse {
  roadmaps: Roadmap[];
}

// AI Tutor Types
export interface TutorMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface TutorSession {
  id: string;
  topic: string;
  messages: TutorMessage[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface TutorSessionResponse {
  message: string;
  session: TutorSession;
}

export interface TutorSessionsResponse {
  sessions: TutorSession[];
}

export interface TutorChatResponse {
  message: string;
  userMessage: TutorMessage;
  assistantMessage: TutorMessage;
}

// Progress Tracking Types
export interface RoadmapProgressRecord {
  roadmapId: string;
  topic: string;
  completedTopics: string[];
  totalTopics: number;
  percent: number;
  lastActivityAt: string;
}

export interface ProgressResponse {
  progress: RoadmapProgressRecord[];
}

export interface RoadmapProgressDetailResponse {
  roadmapId: string;
  completedTopics: string[];
}

export interface SaveProgressResponse {
  message: string;
}

export interface UserStats {
  documentCount: number;
  chatSessionCount: number;
  messageCount: number;
  totalTopicsCompleted: number;
  streak: number;
}

// Quiz Generation Types
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizData {
  topic: string;
  questions: QuizQuestion[];
}

export interface QuizGenerationResponse {
  success: boolean;
  quiz: QuizData;
}
