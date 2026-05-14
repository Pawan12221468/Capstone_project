import {
  AuthResponse,
  DocumentResponse,
  DocumentsResponse,
  ChatSessionResponse,
  ChatSessionsResponse,
  MessagesResponse,
  SendMessageResponse,
  SummaryResponse,
  QuestionsResponse,
  RoadmapResponse,
  RoadmapsResponse,
  TutorSessionResponse,
  TutorSessionsResponse,
  TutorChatResponse,
  UserStats,
  ProgressResponse,
  RoadmapProgressRecord,
  RoadmapProgressDetailResponse,
  SaveProgressResponse,
  QuizGenerationResponse
} from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    // Don't set Content-Type for FormData - let browser set it automatically
    const isFormData = options.body instanceof FormData;
    
    const config: RequestInit = {
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('Making API request:', {
        url,
        method: config.method || 'GET',
        hasBody: !!config.body,
        bodyType: config.body instanceof FormData ? 'FormData' : typeof config.body,
        headers: config.headers
      });
      
      const response = await fetch(url, config);
      
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error body:', errorText);
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
        } catch (e) {
          // If it isn't JSON or misses .error, that's fine. Ignore parser loop.
          if (e instanceof Error && e.message === JSON.parse(errorText)?.error) {
            throw e;
          }
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Response JSON:', result);
      return result;
    } catch (error) {
      console.error('API request failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url,
        method: config.method || 'GET'
      });
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  // Admin Authentication (separate from normal users)
  async adminLogin(email: string, password: string): Promise<{ message: string; token: string }> {
    return this.request<{ message: string; token: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Documents
  async getDocuments(): Promise<DocumentsResponse> {
    return this.request<DocumentsResponse>('/documents');
  }

  async getDocument(id: string): Promise<DocumentResponse> {
    return this.request<DocumentResponse>(`/documents/${id}`);
  }

  async uploadDocument(file: File): Promise<DocumentResponse> {
    console.log('Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
    const formData = new FormData();
    formData.append('document', file);
    
    console.log('FormData created, sending request to:', `${API_BASE_URL}/documents/upload`);

    return this.request<DocumentResponse>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteDocument(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async reprocessDocument(id: string): Promise<{ message: string; documentId: string; status: string }> {
    return this.request<{ message: string; documentId: string; status: string }>(`/documents/${id}/reprocess`, {
      method: 'POST',
    });
  }

  async testDocumentExtraction(id: string): Promise<any> {
    return this.request<any>(`/documents/${id}/test-extraction`);
  }

  // Chat Sessions
  async createChatSession(documentId: string, userId: string, title?: string): Promise<ChatSessionResponse> {
    console.log('API: Creating chat session with documentId:', documentId, 'userId:', userId);
    return this.request<ChatSessionResponse>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ documentId, userId, title }),
    });
  }

  async getChatSessions(userId: string): Promise<ChatSessionsResponse> {
    return this.request<ChatSessionsResponse>(`/chat/sessions?userId=${userId}`);
  }

  async getChatSession(sessionId: string, userId: string): Promise<MessagesResponse> {
    return this.request<MessagesResponse>(`/chat/sessions/${sessionId}?userId=${userId}`);
  }

  async sendMessage(sessionId: string, message: string, userId: string): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, userId }),
    });
  }

  async getMessages(sessionId: string, userId: string): Promise<MessagesResponse> {
    return this.request<MessagesResponse>(`/chat/sessions/${sessionId}/messages?userId=${userId}`);
  }

  async deleteChatSession(sessionId: string, userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/chat/sessions/${sessionId}?userId=${userId}`, {
      method: 'DELETE',
    });
  }

  // AI Features
  async generateSummary(documentId: string, userId: string): Promise<SummaryResponse> {
    return this.request<SummaryResponse>(`/documents/${documentId}/summary`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async generateQuestions(documentId: string, userId: string): Promise<QuestionsResponse> {
    return this.request<QuestionsResponse>(`/documents/${documentId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Roadmaps
  async generateRoadmap(topic: string): Promise<RoadmapResponse> {
    return this.request<RoadmapResponse>('/roadmaps/generate', {
      method: 'POST',
      body: JSON.stringify({ topic }),
    });
  }

  async getRoadmaps(): Promise<RoadmapsResponse> {
    return this.request<RoadmapsResponse>('/roadmaps');
  }

  // AI Tutor
  async createTutorSession(topic: string): Promise<TutorSessionResponse> {
    return this.request<TutorSessionResponse>('/tutor/sessions', {
      method: 'POST',
      body: JSON.stringify({ topic }),
    });
  }

  async getTutorSessions(): Promise<TutorSessionsResponse> {
    return this.request<TutorSessionsResponse>('/tutor/sessions');
  }

  async getTutorSession(sessionId: string): Promise<{ session: any }> {
    return this.request<{ session: any }>(`/tutor/sessions/${sessionId}`);
  }

  async sendTutorMessage(sessionId: string, message: string): Promise<TutorChatResponse> {
    return this.request<TutorChatResponse>(`/tutor/sessions/${sessionId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async deleteTutorSession(sessionId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tutor/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Progress Tracking
  async getUserStats(): Promise<{ stats: UserStats }> {
    return this.request<{ stats: UserStats }>('/auth/stats');
  }

  async getProgress(): Promise<ProgressResponse> {
    return this.request<ProgressResponse>('/progress');
  }

  async getRoadmapProgress(roadmapId: string): Promise<RoadmapProgressDetailResponse> {
    return this.request<RoadmapProgressDetailResponse>(`/progress/${roadmapId}`);
  }

  async saveRoadmapProgress(roadmapId: string, completedTopics: string[]): Promise<SaveProgressResponse> {
    return this.request<SaveProgressResponse>(`/progress/${roadmapId}`, {
      method: 'POST',
      body: JSON.stringify({ completedTopics }),
    });
  }

  // Quiz Generator
  async generateQuiz(topic: string, previousQuestions?: string[], difficulty?: string, tutorContext?: string): Promise<QuizGenerationResponse> {
    return this.request<QuizGenerationResponse>('/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, previousQuestions, difficulty, tutorContext }),
    });
  }

  // Admin
  async getUsers(): Promise<{ id: string; name: string; email: string; createdAt: string }[]> {
    const adminToken = localStorage.getItem('adminToken');
    return this.request<{ id: string; name: string; email: string; createdAt: string }[]>('/admin/users', {
      headers: {
        ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
      },
    });
  }
}

const apiService = new ApiService();
export default apiService;

