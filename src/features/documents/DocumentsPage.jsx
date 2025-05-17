import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

import PageHeader from "@/components/common/PageHeader";
import DocumentCard from "./components/DocumentCard";
import DocumentUploadForm from "./components/DocumentUploadForm";
import LoadingCard from "@/components/common/LoadingCard";
import ErrorCard from "@/components/common/ErrorCard";
import { useAppSelector } from "@/store/hooks";
import * as documentsService from "@/services/documents.service";
import * as ingestionService from "@/services/ingestion.service";

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get documents from NestJS backend
      const response = await documentsService.getDocuments();
      const documentsData = response.data;

      // For each document, check if it has been ingested
      const documentsWithIngestion = await Promise.all(
        documentsData.map(async (document) => {
          try {
            // Check if the document has any ingestion records
            const ingestionResponse = await ingestionService.getIngestionByDocumentId(document.id);
            const latestIngestion = ingestionResponse.data.length > 0 ? ingestionResponse.data[0] : null;

            return {
              ...document,
              ingestionStatus: latestIngestion ? latestIngestion.status : null,
              ingestionId: latestIngestion ? latestIngestion.id : null,
              ingestionError: latestIngestion && latestIngestion.errorMessage ? latestIngestion.errorMessage : null,
            };
          } catch (error) {
            console.error(`Failed to get ingestion for document ${document.id}:`, error);
            return document;
          }
        })
      );

      setDocuments(documentsWithIngestion);
    } catch (err) {
      setError("Failed to fetch documents: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setOpenUploadDialog(false);
    fetchDocuments();
  };

  const handleDeleteDocument = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await documentsService.deleteDocument(id);
        fetchDocuments(); // Refresh the documents list after deletion
      } catch (err) {
        setError("Failed to delete document: " + (err.message || "Unknown error"));
      }
    }
  };

  const handleEditDocument = (id) => {
    const documentToEdit = documents.find((doc) => doc.id === id);
    if (documentToEdit) {
      setSelectedDocument(documentToEdit);
      setOpenEditDialog(true);
    }
  };

  const handleUpdateDocument = async (data) => {
    if (!selectedDocument) return;

    try {
      await documentsService.updateDocument(selectedDocument.id, data);
      setOpenEditDialog(false);
      setSelectedDocument(null);
      fetchDocuments(); // Refresh the documents list after update
    } catch (err) {
      setError("Failed to update document: " + (err.message || "Unknown error"));
    }
  };

  const handleDownloadDocument = async (id) => {
    try {
      const response = await documentsService.getDocumentContent(id);

      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Get the document details to set the filename
      const documentDetails = await documentsService.getDocumentById(id);
      link.setAttribute("download", documentDetails.data.title);

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download document: " + (err.message || "Unknown error"));
    }
  };

  const handleIngestDocument = async (id) => {
    try {
      // Call the ingestion service to trigger document ingestion
      // This will go through NestJS which will forward to Python backend
      await ingestionService.triggerIngestion(id);
      alert("Document ingestion started. This might take a few minutes.");

      // Refresh the document list to show the new ingestion status
      fetchDocuments();

      // Set up a polling mechanism to check ingestion status every 10 seconds
      const checkIngestionStatus = () => {
        const pollingInterval = setInterval(async () => {
          try {
            // Refresh documents to get updated ingestion status
            fetchDocuments();

            // Check if we need to continue polling
            const response = await ingestionService.getIngestionByDocumentId(id);
            const latestIngestion = response.data[0];

            // Stop polling if ingestion is completed or failed
            if (latestIngestion && (latestIngestion.status === "COMPLETED" || latestIngestion.status === "FAILED")) {
              clearInterval(pollingInterval);
            }
          } catch (error) {
            console.error("Error polling for ingestion status:", error);
          }
        }, 10000); // Poll every 10 seconds

        // Clear interval after 5 minutes to avoid endless polling
        setTimeout(() => clearInterval(pollingInterval), 5 * 60 * 1000);
      };

      checkIngestionStatus();
    } catch (err) {
      let errorMessage = "Failed to start document ingestion";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage += ": " + err.response.data.message;
      } else if (err.message) {
        errorMessage += ": " + err.message;
      }
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <PageHeader title="Documents" subtitle="Manage and view your documents" />
        <LoadingCard title="Loading Documents" message="Please wait while we load your documents..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <PageHeader title="Documents" subtitle="Manage and view your documents" />
        <ErrorCard title="Error" message={error} onRetry={fetchDocuments} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <PageHeader
        title="Documents"
        subtitle="Manage and view your documents"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenUploadDialog(true)}>
            Upload Document
          </Button>
        }
      />

      {documents.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography variant="body1" color="text.secondary">
            No documents found. Click on "Upload Document" to add your first document.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {documents.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <DocumentCard document={document} onDelete={handleDeleteDocument} onEdit={handleEditDocument} onDownload={handleDownloadDocument} onIngest={handleIngestDocument} userRole={user?.role} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Document Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Document</DialogTitle>
        <DialogContent>
          <DocumentUploadForm onUploadSuccess={handleUploadSuccess} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Document</DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box
              component="form"
              sx={{ mt: 2 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateDocument({
                  title: e.target.title.value,
                  description: e.target.description.value,
                });
              }}>
              <TextField name="title" label="Title" fullWidth defaultValue={selectedDocument.title} margin="normal" required />
              <TextField name="description" label="Description" fullWidth multiline rows={3} defaultValue={selectedDocument.description} margin="normal" />
              <DialogActions>
                <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                <Button type="submit" variant="contained">
                  Save Changes
                </Button>
              </DialogActions>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;
