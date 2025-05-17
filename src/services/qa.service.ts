import { pythonApi } from "./api";

export interface Question {
  text: string;
  documentIds?: string[];
}

export interface Answer {
  text: string;
  sources: {
    documentId: string;
    documentTitle: string;
    excerpt: string;
    relevanceScore: number;
  }[];
}

export interface QASession {
  id: string;
  userId: string;
  questions: {
    id: string;
    text: string;
    timestamp: string;
    answer: {
      text: string;
      sources: {
        documentId: string;
        documentTitle: string;
        excerpt: string;
        relevanceScore: number;
      }[];
    };
  }[];
  createdAt: string;
  updatedAt: string;
}

// Q&A service
export const askQuestion = async (question: Question) => {
  return await pythonApi.post<Answer>("/qa", question);
};

export const getQASessions = async (userId: string) => {
  return await pythonApi.get<QASession[]>("/qa/history", { params: { user_id: userId } });
};

export const getQASessionById = async (id: string) => {
  return await pythonApi.get<QASession>(`/qa/history/${id}`);
};

export const selectDocuments = async (documentIds: string[]) => {
  return await pythonApi.post("/selection", { documentIds });
};

export const getSelectedDocuments = async () => {
  return await pythonApi.get<string[]>("/selection");
};
