import { nestJsApi } from './api';

export interface Ingestion {
  id: string;
  documentId: string;
  document: {
    id: string;
    title: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
}

// Ingestion service
export const getIngestions = async () => {
  return await nestJsApi.get<Ingestion[]>('/ingestion');
};

export const getIngestionById = async (id: string) => {
  return await nestJsApi.get<Ingestion>(`/ingestion/${id}`);
};

export const getIngestionByDocumentId = async (documentId: string) => {
  return await nestJsApi.get<Ingestion[]>(`/ingestion/document/${documentId}`);
};

export const triggerIngestion = async (documentId: string) => {
  return await nestJsApi.post<Ingestion>('/ingestion', { documentId });
};

export const cancelIngestion = async (id: string) => {
  return await nestJsApi.delete(`/ingestion/${id}`);
};
