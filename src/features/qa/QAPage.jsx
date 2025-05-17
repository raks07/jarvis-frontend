import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, Divider, Button, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText, Chip } from "@mui/material";
import { QuestionAnswer as QuestionAnswerIcon } from "@mui/icons-material";

import PageHeader from "@/components/common/PageHeader";
import QAForm from "./components/QAForm";
import AnswerCard from "./components/AnswerCard";
import LoadingCard from "@/components/common/LoadingCard";
import ErrorCard from "@/components/common/ErrorCard";

// Import services
import * as documentsService from "@/services/documents.service";
import * as qaService from "@/services/qa.service";
import { getUserFromToken } from "@/utils/auth";

const QAPage = () => {
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qaLoading, setQaLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qaHistory, setQaHistory] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    // Get current user ID from token
    const token = localStorage.getItem("auth_token");
    const user = getUserFromToken(token);
    if (user && user.id) {
      setUserId(user.id);
    }

    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get documents from the API
      const response = await documentsService.getDocuments();
      const documentsData = response.data;

      setDocuments(documentsData);
      // By default, select all documents
      setSelectedDocuments(documentsData.map((doc) => doc.id));

      try {
        // If there's a selection API, fetch previously selected documents
        const selectionResponse = await qaService.getSelectedDocuments();
        if (selectionResponse.data && selectionResponse.data.length > 0) {
          setSelectedDocuments(selectionResponse.data);
        }
      } catch (selectionErr) {
        console.error("Error fetching document selection:", selectionErr);
        // Don't block main functionality if this fails
      }

      // Also fetch QA history if available
      fetchQaHistory();
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to fetch documents: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Fetch QA history from sessions
  const fetchQaHistory = async () => {
    if (!userId) {
      console.warn("No user ID available for QA history fetch");
      return;
    }

    try {
      const response = await qaService.getQASessions(userId);

      // Transform the data into the format used by the UI
      const history = response.data
        .flatMap((session) => {
          // Store the most recent session ID for continuity
          if (session.questions.length > 0 && !currentSessionId) {
            setCurrentSessionId(session.id);
          }

          return session.questions.map((q) => ({
            id: q.id,
            question: q.text,
            answer: q.answer.text,
            sources: q.answer.sources,
            timestamp: q.timestamp,
            session_id: session.id,
          }));
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setQaHistory(history);
    } catch (err) {
      console.error("Error fetching QA history:", err);
      // We don't set error state here to avoid blocking the whole page
      // if only the history fetch fails
    }
  };

  const handleDocumentSelectionChange = async (event) => {
    const {
      target: { value },
    } = event;
    const selectedDocs = typeof value === "string" ? value.split(",") : value;
    setSelectedDocuments(selectedDocs);

    try {
      // Update selected documents with API
      await qaService.selectDocuments(selectedDocs);
    } catch (err) {
      console.error("Error updating document selection:", err);
      // Don't show an error to the user, as this is a background operation
      // and doesn't block the main functionality
    }
  };

  const handleQuestionSubmit = async (question) => {
    if (!userId) {
      setError("User authentication required. Please log in again.");
      return;
    }

    setQaLoading(true);
    setError(null);

    try {
      // Use the actual API to ask a question
      const response = await qaService.askQuestion({
        text: question,
        documentIds: selectedDocuments,
        user_id: userId,
        session_id: currentSessionId, // Include session_id if we have one
      });

      const answer = response.data;

      // Store the session ID for follow-up questions
      if (answer.session_id && !currentSessionId) {
        setCurrentSessionId(answer.session_id);
      }

      // Add to history
      setQaHistory([
        {
          id: Date.now().toString(),
          question,
          answer: answer.text,
          sources: answer.sources,
          timestamp: new Date().toISOString(),
        },
        ...qaHistory,
      ]);
    } catch (err) {
      console.error("Question submission error:", err);
      setError("Failed to process question: " + (err.response?.data?.detail || err.message || "Unknown error"));
    } finally {
      setQaLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <PageHeader title="Q&A" subtitle="Ask questions about your documents" icon={<QuestionAnswerIcon />} />
        <LoadingCard title="Loading" message="Please wait while we load your documents..." />
      </Box>
    );
  }

  if (error && documents.length === 0) {
    return (
      <Box p={3}>
        <PageHeader title="Q&A" subtitle="Ask questions about your documents" icon={<QuestionAnswerIcon />} />
        <ErrorCard title="Error" message={error} onRetry={fetchDocuments} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <PageHeader title="Q&A" subtitle="Ask questions about your documents" icon={<QuestionAnswerIcon />} />

      <Grid container spacing={3}>
        {/* Left Column - Document Selection and Question Input */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Document Selection
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select the documents you want to include in the Q&A context.
              </Typography>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="document-selection-label">Documents</InputLabel>
                <Select
                  labelId="document-selection-label"
                  id="document-selection"
                  multiple
                  value={selectedDocuments}
                  onChange={handleDocumentSelectionChange}
                  input={<OutlinedInput label="Documents" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => {
                        const doc = documents.find((d) => d.id === value);
                        return <Chip key={value} label={doc ? doc.title : value} />;
                      })}
                    </Box>
                  )}>
                  {documents.map((doc) => (
                    <MenuItem key={doc.id} value={doc.id}>
                      <Checkbox checked={selectedDocuments.indexOf(doc.id) > -1} />
                      <ListItemText primary={doc.title} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedDocuments.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                  Please select at least one document to ask questions.
                </Typography>
              )}
            </CardContent>
          </Card>

          <QAForm onSubmit={handleQuestionSubmit} loading={qaLoading} disabled={selectedDocuments.length === 0} />

          {error && (
            <Box mt={2}>
              <ErrorCard title="Question Error" message={error} />
            </Box>
          )}
        </Grid>

        {/* Right Column - Q&A History */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Q&A History
          </Typography>

          {qaHistory.length === 0 ? (
            <Card variant="outlined" sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                No questions asked yet. Use the form to ask your first question.
              </Typography>
            </Card>
          ) : (
            <Box>
              {qaHistory.map((qa) => (
                <AnswerCard key={qa.id} question={qa.question} answer={qa.answer} sources={qa.sources} />
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default QAPage;
