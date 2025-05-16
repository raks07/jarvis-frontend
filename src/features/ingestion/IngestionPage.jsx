import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Sync as SyncIcon } from '@mui/icons-material';

import PageHeader from '@/components/common/PageHeader';
import IngestionCard from './components/IngestionCard';
import LoadingCard from '@/components/common/LoadingCard';
import ErrorCard from '@/components/common/ErrorCard';

const IngestionPage = () => {
  const [ingestions, setIngestions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // This would be replaced with actual API calls
      // const ingestionsResponse = await ingestionService.getIngestions();
      // const documentsResponse = await documentsService.getDocuments();

      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock ingestions data
      const mockIngestions = [
        {
          id: '1',
          document: { id: '1', title: 'Company Policy Document' },
          status: 'completed',
          startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          document: { id: '2', title: 'Technical Documentation' },
          status: 'processing',
          startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          completedAt: null,
        },
        {
          id: '3',
          document: { id: '3', title: 'Research Paper' },
          status: 'failed',
          startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 4.8 * 60 * 60 * 1000).toISOString(),
          errorMessage: 'Failed to process document: Invalid format',
        },
      ];

      // Mock documents data
      const mockDocuments = [
        {
          id: '1',
          title: 'Company Policy Document',
        },
        {
          id: '2',
          title: 'Technical Documentation',
        },
        {
          id: '3',
          title: 'Research Paper',
        },
        {
          id: '4',
          title: 'Project Report',
        },
      ];

      setIngestions(mockIngestions);
      setDocuments(mockDocuments);
    } catch (err) {
      setError('Failed to fetch data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleIngestDocument = async () => {
    if (!selectedDocument) return;

    try {
      // This would be replaced with actual API call
      // await ingestionService.createIngestion({ documentId: selectedDocument });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create a mock new ingestion
      const newDocument = documents.find(doc => doc.id === selectedDocument);
      const newIngestion = {
        id: Date.now().toString(),
        document: newDocument,
        status: 'pending',
        startedAt: new Date().toISOString(),
        completedAt: null,
      };

      setIngestions([newIngestion, ...ingestions]);
      setOpenDialog(false);
      setSelectedDocument('');
    } catch (err) {
      setError('Failed to start ingestion: ' + (err.message || 'Unknown error'));
    }
  };

  const handleCancelIngestion = async (id) => {
    try {
      // This would be replaced with actual API call
      // await ingestionService.cancelIngestion(id);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update local state
      setIngestions(ingestions.map(ing =>
        ing.id === id
          ? { ...ing, status: 'failed', errorMessage: 'Cancelled by user', completedAt: new Date().toISOString() }
          : ing
      ));
    } catch (err) {
      setError('Failed to cancel ingestion: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <PageHeader
          title="Ingestion"
          subtitle="Manage document ingestion processes"
          icon={<SyncIcon />}
        />
        <LoadingCard title="Loading" message="Please wait while we load ingestion data..." />
      </Box>
    );
  }

  if (error && ingestions.length === 0) {
    return (
      <Box p={3}>
        <PageHeader
          title="Ingestion"
          subtitle="Manage document ingestion processes"
          icon={<SyncIcon />}
        />
        <ErrorCard title="Error" message={error} onRetry={fetchData} />
      </Box>
    );
  }

  // Get the list of documents that haven't been ingested
  const notIngestedDocuments = documents.filter(
    doc => !ingestions.some(ing =>
      ing.document.id === doc.id &&
      (ing.status === 'pending' || ing.status === 'processing')
    )
  );

  return (
    <Box p={3}>
      <PageHeader
        title="Ingestion"
        subtitle="Manage document ingestion processes"
        icon={<SyncIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<SyncIcon />}
            onClick={() => setOpenDialog(true)}
            disabled={notIngestedDocuments.length === 0}
          >
            Ingest Document
          </Button>
        }
      />

      {error && (
        <ErrorCard
          title="Error"
          message={error}
          onRetry={fetchData}
          sx={{ mb: 3 }}
        />
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ingestion History
              </Typography>

              {ingestions.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  No ingestion processes found. Start by clicking "Ingest Document".
                </Typography>
              ) : (
                <Box>
                  {ingestions.map((ingestion) => (
                    <IngestionCard
                      key={ingestion.id}
                      ingestion={ingestion}
                      onCancel={handleCancelIngestion}
                    />
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
              <Typography variant="body2">
                Document ingestion is the process of extracting text from your documents, splitting it into manageable chunks, and generating embeddings for retrieval-based question answering.
              </Typography>

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
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ingest Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Select a document to ingest for question answering. This process extracts text and generates embeddings.
          </Typography>

          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="document-selection-label">Document</InputLabel>
            <Select
              labelId="document-selection-label"
              id="document-selection"
              value={selectedDocument}
              onChange={(e) => setSelectedDocument(e.target.value)}
              label="Document"
            >
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
          <Button
            onClick={handleIngestDocument}
            variant="contained"
            disabled={!selectedDocument}
          >
            Start Ingestion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IngestionPage;
