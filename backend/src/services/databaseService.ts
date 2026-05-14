import { PrismaClient } from '@prisma/client';

class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  // User operations
  async createUser(userData: {
    email: string;
    name: string;
    password: string;
    avatar?: string;
  }) {
    return await this.prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  async getAllUsers() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Document operations
  async createDocument(documentData: {
    title: string;
    filename: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    userId: string;
    status?: string;
    extractedText?: string;
    summary?: string;
    metadata?: any;
  }) {
    return await this.prisma.document.create({
      data: documentData,
    });
  }

  async updateDocument(id: string, updateData: {
    status?: string;
    extractedText?: string;
    summary?: string;
    metadata?: any;
  }) {
    return await this.prisma.document.update({
      where: { id },
      data: updateData,
    });
  }

  async getDocumentsByUserId(userId: string) {
    return await this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocumentById(id: string) {
    return await this.prisma.document.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteDocument(id: string) {
    return await this.prisma.document.delete({
      where: { id },
    });
  }

  // Chat session operations
  async createChatSession(sessionData: {
    title?: string;
    userId: string;
    documentId: string;
  }) {
    return await this.prisma.chatSession.create({
      data: sessionData,
    });
  }

  async getChatSessionsByUserId(userId: string) {
    return await this.prisma.chatSession.findMany({
      where: { userId },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            filename: true,
          },
        },
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getChatSessionById(id: string) {
    return await this.prisma.chatSession.findUnique({
      where: { id },
      include: {
        document: true,
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });
  }

  async addMessage(messageData: {
    content: string;
    role: string;
    sessionId: string;
  }) {
    return await this.prisma.message.create({
      data: messageData,
    });
  }

  async getMessagesBySessionId(sessionId: string) {
    return await this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async updateChatSession(id: string, updateData: {
    title?: string;
  }) {
    return await this.prisma.chatSession.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteChatSession(id: string) {
    return await this.prisma.chatSession.delete({
      where: { id },
    });
  }

  // Team operations
  async createTeam(teamData: {
    name: string;
    description?: string;
    creatorId: string;
  }) {
    return await this.prisma.team.create({
      data: teamData,
    });
  }

  async addTeamMember(teamMemberData: {
    userId: string;
    teamId: string;
    role: string;
  }) {
    return await this.prisma.teamMember.create({
      data: teamMemberData,
    });
  }

  async getTeamsByUserId(userId: string) {
    return await this.prisma.team.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // Roadmap operations
  async createRoadmap(roadmapData: {
    topic: string;
    content: any;
    userId: string;
  }) {
    return await this.prisma.roadmap.create({
      data: roadmapData,
    });
  }

  async getRoadmapsByUserId(userId: string) {
    return await this.prisma.roadmap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Tutor Chat operations
  async createTutorSession(data: { topic: string; userId: string }) {
    return await this.prisma.tutorSession.create({ data });
  }

  async getTutorSessionsByUserId(userId: string) {
    return await this.prisma.tutorSession.findMany({
      where: { userId },
      include: {
        messages: { orderBy: { timestamp: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getTutorSessionById(id: string) {
    return await this.prisma.tutorSession.findUnique({
      where: { id },
      include: { messages: { orderBy: { timestamp: 'asc' } } },
    });
  }

  async addTutorMessage(data: { content: string; role: string; sessionId: string }) {
    return await this.prisma.tutorMessage.create({ data });
  }

  async deleteTutorSession(id: string) {
    return await this.prisma.tutorSession.delete({ where: { id } });
  }

  // Progress tracking
  async getOrCreateProgress(roadmapId: string, userId: string) {
    return await this.prisma.roadmapProgress.upsert({
      where: { roadmapId_userId: { roadmapId, userId } },
      create: { roadmapId, userId, completedTopics: [], lastActivityAt: new Date() },
      update: {},
    });
  }

  async updateProgress(roadmapId: string, userId: string, completedTopics: string[]) {
    return await this.prisma.roadmapProgress.upsert({
      where: { roadmapId_userId: { roadmapId, userId } },
      create: { roadmapId, userId, completedTopics, lastActivityAt: new Date() },
      update: { completedTopics, lastActivityAt: new Date() },
    });
  }

  async getProgressByUserId(userId: string) {
    return await this.prisma.roadmapProgress.findMany({
      where: { userId },
      include: { roadmap: { select: { id: true, topic: true, content: true } } },
      orderBy: { lastActivityAt: 'desc' },
    });
  }

  async getProgressByRoadmap(roadmapId: string, userId: string) {
    return await this.prisma.roadmapProgress.findUnique({
      where: { roadmapId_userId: { roadmapId, userId } },
    });
  }

  // Statistics
  async getUserStats(userId: string) {
    const [documentCount, chatSessionCount, messageCount, progressRecords] = await Promise.all([
      this.prisma.document.count({ where: { userId } }),
      this.prisma.chatSession.count({ where: { userId } }),
      this.prisma.message.count({ where: { session: { userId } } }),
      this.prisma.roadmapProgress.findMany({
        where: { userId },
        orderBy: { lastActivityAt: 'desc' },
      }),
    ]);

    // Total completed topics across all roadmaps
    const totalTopicsCompleted = progressRecords.reduce((sum: number, rec: any) => {
      const topics = Array.isArray(rec.completedTopics) ? (rec.completedTopics as any[]) : [];
      return sum + topics.length;
    }, 0);

    // Compute learning streak (consecutive days with activity)
    const activityDates = progressRecords
      .map((r: any) => r.lastActivityAt.toDateString())
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
      .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < activityDates.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (activityDates[i] === expected.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return {
      documentCount,
      chatSessionCount,
      messageCount,
      totalTopicsCompleted,
      streak,
    };
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export default new DatabaseService();
