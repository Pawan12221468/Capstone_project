import Groq from 'groq-sdk';

class AiService {
  private groq: Groq | null;
  private model: string = 'llama-3.1-8b-instant';

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('GROQ_API_KEY is not set in environment variables. AI features will be disabled.');
      this.groq = null;
      return;
    }
    this.groq = new Groq({
      apiKey: apiKey,
    });
    console.log('Groq AI service initialized successfully');
  }

  /**
   * Reusable function to generate AI response
   */
  async generateAIResponse(prompt: string, systemMessage?: string, responseFormat?: { type: 'json_object' }): Promise<string> {
    try {
      if (!this.groq) {
        return 'AI is temporarily unavailable, please try again.';
      }

      const messages: any[] = [];
      if (systemMessage) {
        messages.push({ role: 'system', content: systemMessage });
      }
      messages.push({ role: 'user', content: prompt });

      const completion = await this.groq.chat.completions.create({
        messages: messages,
        model: this.model,
        response_format: responseFormat,
        temperature: 0.7,
        max_tokens: 4096,
      });

      return completion.choices[0]?.message?.content || 'AI is temporarily unavailable, please try again.';
    } catch (error: any) {
      console.error('Groq API Error:', error);
      return 'AI is temporarily unavailable, please try again.';
    }
  }

  // --- GeminiService Compatibility Methods ---

  async generateDocumentSummary(documentText: string): Promise<string> {
    const systemMessage = 'You are a helpful assistant that summarizes documents.';
    const prompt = `Please provide a comprehensive summary of the following document. 
Focus on the main points, key concepts, and important information.
Keep the summary concise but informative (2-3 paragraphs).

Document content:
${documentText}`;

    return this.generateAIResponse(prompt, systemMessage);
  }

  async answerQuestion(question: string, documentText: string, chatHistory: any[] = []): Promise<{
    answer: string;
    sources: string[];
    confidence: number;
  }> {
    const historyContext = chatHistory.length > 0 
      ? `\n\nPrevious conversation context:\n${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    const systemMessage = 'You are an intelligent document analysis assistant. Answer the user\'s question based on the provided document content.';
    const prompt = `Document content:
${documentText}

${historyContext}

User question: ${question}

Please provide:
1. A direct, accurate answer based on the document content
2. Quote relevant sections from the document to support your answer
3. If the answer is not found in the document, clearly state this
4. Be concise but comprehensive

Respond in a natural, conversational way. Do not use JSON format.`;

    const answer = await this.generateAIResponse(prompt, systemMessage);
    return {
      answer,
      sources: [],
      confidence: 0.8
    };
  }

  async extractKeyPoints(documentText: string): Promise<string[]> {
    const systemMessage = 'Extract the key points and main topics from the document. Return them as a JSON array of strings.';
    const prompt = `Document content:
${documentText}`;

    const response = await this.generateAIResponse(prompt, systemMessage, { type: 'json_object' });
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : (parsed.keyPoints || parsed.points || [response]);
    } catch (e) {
      return [response];
    }
  }

  async generateQuestions(documentText: string): Promise<string[]> {
    const systemMessage = 'Generate 5 relevant questions about the document. Return them as a JSON array of strings.';
    const prompt = `Document content:
${documentText}`;

    const response = await this.generateAIResponse(prompt, systemMessage, { type: 'json_object' });
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : (parsed.questions || [response]);
    } catch (e) {
      return [response];
    }
  }

  async generateRoadmap(topic: string): Promise<any> {
    const systemMessage = 'You are an expert career and learning path advisor. Generate a detailed learning roadmap in JSON format.';
    const prompt = `Create a detailed learning roadmap for the topic: "${topic}".
Your response MUST be a valid JSON object with the following structure:
{
  "topic": "${topic}",
  "description": "A short overview of what will be learned.",
  "estimatedTotalTime": "e.g., 3 months",
  "phases": [
    {
      "name": "Phase 1: Foundations",
      "level": "Beginner",
      "duration": "e.g., 4 weeks",
      "topics": ["Concept 1", "Concept 2"],
      "projects": ["Project 1 description"]
    }
  ]
}`;

    const response = await this.generateAIResponse(prompt, systemMessage, { type: 'json_object' });
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error('Failed to parse roadmap JSON:', response);
      throw new Error('Failed to parse generated roadmap JSON');
    }
  }

  async tutorChat(
    userMessage: string,
    topic: string,
    history: { role: string; content: string }[]
  ): Promise<string> {
    const historyContext = history.length > 0
      ? `\n\nConversation so far:\n${history.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n\n')}`
      : '';

    const systemMessage = `You are an expert, friendly AI tutor specializing in "${topic}". Your teaching principles:
1. Use simple, clear language that a beginner can understand.
2. Always give real-world examples or code snippets (use markdown code blocks where relevant).
3. After explaining, add a short exercise or quiz question to reinforce learning.
4. Be encouraging, warm, and patient.
5. Use markdown formatting: bold, bullet points, numbered lists, code blocks.
6. Build on the prior conversation to avoid repeating yourself.

Always end your response with one of these (clearly labeled):
- "Try this:" followed by a small exercise
- "Think about it:" followed by a reflection question`;

    const prompt = `${historyContext}

Student: ${userMessage}
Tutor:`;

    return this.generateAIResponse(prompt, systemMessage);
  }

  async extractDocumentInsights(documentText: string): Promise<{ summary: string; importantPoints: string[]; keywords: string[] }> {
    const systemMessage = 'Analyze the document and extract key insights. Return them as a JSON object.';
    const prompt = `Analyze the following document and extract key insights.
Your response MUST be a valid JSON object strictly matching this schema exactly:
{
  "summary": "A concise 2-3 paragraph overview of the entire document.",
  "importantPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Document content:
${documentText.substring(0, 30000)}`;

    const response = await this.generateAIResponse(prompt, systemMessage, { type: 'json_object' });
    try {
      const insights = JSON.parse(response);
      return {
        summary: insights.summary || 'Summary unavailable.',
        importantPoints: Array.isArray(insights.importantPoints) ? insights.importantPoints : [],
        keywords: Array.isArray(insights.keywords) ? insights.keywords : []
      };
    } catch (e) {
      throw new Error('Failed to extract insights');
    }
  }

  async generateQuiz(topic: string, previousQuestions: string[] = [], difficulty: string = 'Medium', tutorContext?: string): Promise<any> {
    const previousContext = previousQuestions.length > 0 
      ? `Here are the questions that have already been asked. DO NOT generate these again:\n${previousQuestions.map((q, i) => `${i+1}. ${q}`).join('\n')}\n`
      : '';
      
    let difficultyContext = '';
    if (difficulty === 'Easy') {
      difficultyContext = `Make the questions focus on basic, foundational conceptual definitions that beginners would quickly recognize. Maintain an Easy difficulty.`;
    } else if (difficulty === 'Hard') {
      difficultyContext = `Make the questions tricky, highly analytical, and heavily focused on complex scenario-based paradigms. Maintain a Hard difficulty.`;
    } else {
      difficultyContext = `Maintain a consistent, balanced Medium difficulty level across all questions.`;
    }

    const tutorChatContext = tutorContext && tutorContext.length > 0
      ? `\nThe user has just learned about this topic through the following conversation with an AI Tutor:\n\n---\n${tutorContext.substring(0, 30000)}\n---\n\nYour generated quiz MUST focus extensively on the specific concepts, ideas, and facts that were actually discussed in the above conversation.`
      : '';

    const systemMessage = 'You are a quiz generator. Generate a 10-question multiple choice quiz in JSON format.';
    const prompt = `Create a 10-question multiple choice quiz about the topic: "${topic}".
${difficultyContext}
${tutorChatContext}
${previousContext}
Your response MUST be a valid JSON object strictly matching this schema exactly:
{
  "topic": "${topic}",
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why Option A is correct"
    }
  ]
}
Ensure exactly 10 questions are generated.`;

    const response = await this.generateAIResponse(prompt, systemMessage, { type: 'json_object' });
    try {
      return JSON.parse(response);
    } catch (e) {
      throw new Error('Failed to generate quiz');
    }
  }
}

export default new AiService();
