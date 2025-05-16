import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

import PageHeader from "@/components/common/PageHeader";
import DocumentCard from "./components/DocumentCard";
import DocumentUploadForm from "./components/DocumentUploadForm";
import LoadingCard from "@/components/common/LoadingCard";
import ErrorCard from "@/components/common/ErrorCard";
import { useAppSelector } from "@/store/hooks";

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      // This would be replaced with actual API call
      // const response = await documentsService.getDocuments();

      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock documents data
      const mockDocuments = [
        {
          id: "1",
          title: "Company Policy Document",
          description: "Official company policy for employees",
          filePath: "/uploads/policy.pdf",
          fileType: "application/pdf",
          fileSize: 2500000,
          uploadedBy: { username: "admin" },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          title: "Technical Documentation",
          description: "System architecture and components",
          filePath: "/uploads/tech-docs.docx",
          fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          fileSize: 1800000,
          uploadedBy: { username: "editor" },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          title: "Research Paper",
          description: "Latest research findings",
          filePath: "/uploads/research.pdf",
          fileType: "application/pdf",
          fileSize: 3200000,
          uploadedBy: { username: "editor" },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setDocuments(mockDocuments);
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

  const handleDeleteDocument = (id) => {
    // TODO: Implement delete functionality
    console.log("Delete document:", id);
  };

  const handleEditDocument = (id) => {
    // TODO: Implement edit functionality
    console.log("Edit document:", id);
  };

  const handleDownloadDocument = (id) => {
    // TODO: Implement download functionality
    console.log("Download document:", id);
  };

  const handleIngestDocument = (id) => {
    // TODO: Implement ingestion functionality
    console.log("Ingest document:", id);
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
    </Box>
  );
};

export default DocumentsPage;
