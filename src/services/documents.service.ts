import { nestJsApi } from './api';

export interface Document {
  id: string;
  title: string;
  description: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: {
    id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  title: string;
  description: string;
  file: File;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
}

// Document service
export const getDocuments = async () => {
  return await nestJsApi.get<Document[]>('/documents');
};

export const getDocumentById = async (id: string) => {
  return await nestJsApi.get<Document>(`/documents/${id}`);
};

export const uploadDocument = async (documentData: CreateDocumentRequest) => {
  const formData = new FormData();
  formData.append('title', documentData.title);
  formData.append('description', documentData.description);
  formData.append('file', documentData.file);

  return await nestJsApi.post<Document>('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateDocument = async (id: string, documentData: UpdateDocumentRequest) => {
  return await nestJsApi.patch<Document>(`/documents/${id}`, documentData);
};

export const deleteDocument = async (id: string) => {
  return await nestJsApi.delete(`/documents/${id}`);
};
