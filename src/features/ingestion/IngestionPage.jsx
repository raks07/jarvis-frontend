import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Tooltip } from "@mui/material";
import { Sync as SyncIcon } from "@mui/icons-material";

import PageHeader from "@/components/common/PageHeader";
import IngestionCard from "./components/IngestionCard";
import LoadingCard from "@/components/common/LoadingCard";
import ErrorCard from "@/components/common/ErrorCard";

// Import services
import * as ingestionService from "@/services/ingestion.service";
import * as documentsService from "@/services/documents.service";
import { getUserFromToken } from "@/utils/auth";

const IngestionPage = () => {
  const [ingestions, setIngestions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role from token
    const token = localStorage.getItem("auth_token");
    const user = getUserFromToken(token);
    if (user) {
      setUserRole(user.role);
    }

    fetchData();

    // Set up polling for ingestion status updates
    const interval = setInterval(() => {
      // Only refresh if there are pending or processing ingestions
      if (ingestions.some((ing) => ing.status === "pending" || ing.status === "processing")) {
        fetchIngestions();
      }
    }, 5000); // Check every 5 seconds

    setRefreshInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  // Update the refresh logic when ingestions change
  useEffect(() => {
    if (!refreshInterval) return;

    // If there are no more pending/processing ingestions, clear the interval
    if (!ingestions.some((ing) => ing.status === "pending" || ing.status === "processing")) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [ingestions, refreshInterval]);

  // Check if user has permission to trigger ingestion
  const canTriggerIngestion = userRole === "admin" || userRole === "editor";

  // Show error message if user doesn't have permission
  useEffect(() => {
    if (userRole && !canTriggerIngestion) {
      setError("You don't have permission to trigger ingestion. Contact an admin for assistance.");
    }
  }, [userRole]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchIngestions(), fetchDocuments()]);
    } catch (err) {
      setError("Failed to fetch data: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const fetchIngestions = async () => {
    try {
      const ingestionsResponse = await ingestionService.getIngestions();
      setIngestions(ingestionsResponse.data);
      return ingestionsResponse.data;
    } catch (err) {
      console.error("Error fetching ingestions:", err);
      throw err;
    }
  };

  const fetchDocuments = async () => {
    try {
      const documentsResponse = await documentsService.getDocuments();
      setDocuments(documentsResponse.data);
      return documentsResponse.data;
    } catch (err) {
      console.error("Error fetching documents:", err);
      throw err;
    }
  };

  const handleIngestDocument = async () => {
    if (!selectedDocument) return;

    // Double-check permissions (should already be checked by button disabled state)
    if (!canTriggerIngestion) {
      setError("You don't have permission to trigger ingestion. Contact an admin for assistance.");
      return;
    }

    setError(null); // Clear any previous errors

    try {
      // Start ingestion with the selected document
      await ingestionService.triggerIngestion(selectedDocument);

      // Refresh the ingestion list
      await fetchIngestions();

      // Start polling for updates if not already running
      if (!refreshInterval) {
        const interval = setInterval(() => {
          fetchIngestions();
        }, 5000); // Check every 5 seconds

        setRefreshInterval(interval);
      }

      setOpenDialog(false);
      setSelectedDocument("");
    } catch (err) {
      console.error("Ingestion error:", err);

      if (err.response && err.response.status === 403) {
        setError("Permission denied: You don't have the required role (admin or editor) to trigger ingestion.");
      } else {
        setError("Failed to start ingestion: " + (err.message || "Unknown error"));
      }
    }
  };

  const handleCancelIngestion = async (id) => {
    try {
      await ingestionService.cancelIngestion(id);

      // Refresh the ingestion list
      await fetchIngestions();
    } catch (err) {
      setError("Failed to cancel ingestion: " + (err.message || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <PageHeader title="Ingestion" subtitle="Manage document ingestion processes" icon={<SyncIcon />} />
        <LoadingCard title="Loading" message="Please wait while we load ingestion data..." />
      </Box>
    );
  }

  if (error && ingestions.length === 0) {
    return (
      <Box p={3}>
        <PageHeader title="Ingestion" subtitle="Manage document ingestion processes" icon={<SyncIcon />} />
        <ErrorCard title="Error" message={error} onRetry={fetchData} />
      </Box>
    );
  }

  // Get the list of documents that haven't been ingested
  const notIngestedDocuments = documents.filter((doc) => !ingestions.some((ing) => ing.document.id === doc.id && (ing.status === "pending" || ing.status === "processing")));

  return (
    <Box p={3}>
      <PageHeader
        title="Ingestion"
        subtitle="Manage document ingestion processes"
        icon={<SyncIcon />}
        action={
          <Tooltip title={!canTriggerIngestion ? "You need admin or editor permissions to trigger ingestion" : notIngestedDocuments.length === 0 ? "No documents available for ingestion" : ""}>
            <span>
              <Button variant="contained" startIcon={<SyncIcon />} onClick={() => setOpenDialog(true)} disabled={notIngestedDocuments.length === 0 || !canTriggerIngestion}>
                Ingest Document
              </Button>
            </span>
          </Tooltip>
        }
      />

      {error && <ErrorCard title="Error" message={error} onRetry={fetchData} sx={{ mb: 3 }} />}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ingestion History
              </Typography>

              {ingestions.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                  No ingestion processes found. Start by clicking "Ingest Document".
                </Typography>
              ) : (
                <Box>
                  {ingestions.map((ingestion) => (
                    <IngestionCard key={ingestion.id} ingestion={ingestion} onCancel={handleCancelIngestion} />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About Ingestion
              </Typography>
              <Typography variant="body2">Document ingestion is the process of extracting text from your documents, splitting it into manageable chunks, and generating embeddings for retrieval-based question answering.</Typography>

              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>Why ingest?</strong> Ingestion enables the system to quickly find relevant information when you ask questions, making the Q&A feature more accurate and efficient.
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                Ingestion Statuses:
              </Typography>
              <Typography variant="body2">
                <strong>Pending:</strong> Ingestion request has been received and is waiting to be processed.
              </Typography>
              <Typography variant="body2">
                <strong>Processing:</strong> Document is currently being processed, including text extraction, chunking, and embedding generation.
              </Typography>
              <Typography variant="body2">
                <strong>Completed:</strong> Ingestion has successfully completed and the document is ready for Q&A.
              </Typography>
              <Typography variant="body2">
                <strong>Failed:</strong> An error occurred during ingestion. Review the error message for details.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ingest Document Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ingest Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Select a document to ingest for question answering. This process extracts text and generates embeddings.
          </Typography>

          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="document-selection-label">Document</InputLabel>
            <Select labelId="document-selection-label" id="document-selection" value={selectedDocument} onChange={(e) => setSelectedDocument(e.target.value)} label="Document">
              {notIngestedDocuments.map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>
                  {doc.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleIngestDocument} variant="contained" disabled={!selectedDocument || !canTriggerIngestion}>
            Start Ingestion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IngestionPage;
