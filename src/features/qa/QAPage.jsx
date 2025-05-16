import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Chip,
} from '@mui/material';
import { QuestionAnswer as QuestionAnswerIcon } from '@mui/icons-material';

import PageHeader from '@/components/common/PageHeader';
import QAForm from './components/QAForm';
import AnswerCard from './components/AnswerCard';
import LoadingCard from '@/components/common/LoadingCard';
import ErrorCard from '@/components/common/ErrorCard';

const QAPage = () => {
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qaLoading, setQaLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qaHistory, setQaHistory] = useState([]);

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
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      ];

      setDocuments(mockDocuments);
      // By default, select all documents
      setSelectedDocuments(mockDocuments.map(doc => doc.id));
    } catch (err) {
      setError('Failed to fetch documents: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelectionChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedDocuments(typeof value === 'string' ? value.split(',') : value);
  };

  const handleQuestionSubmit = async (question) => {
    setQaLoading(true);

    try {
      // This would be replaced with actual API call
      // const response = await qaService.askQuestion({ text: question, documentIds: selectedDocuments });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock response
      const mockResponse = {
        text: `Based on the documents provided, it appears that ${question} relates to our company policies. The specific guidelines can be found in section 3.2 of the handbook. Additionally, there are references to this topic in the technical documentation under "Best Practices".`,
        sources: [
          {
            documentId: '1',
            documentTitle: 'Company Policy Document',
            excerpt: 'Section 3.2: All employees must follow these guidelines when accessing company resources. This includes proper authentication protocols and regular security updates.',
            relevanceScore: 0.89,
          },
          {
            documentId: '2',
            documentTitle: 'Technical Documentation',
            excerpt: 'Best Practices recommend implementing multi-factor authentication for all critical systems. This helps prevent unauthorized access and protects sensitive information.',
            relevanceScore: 0.72,
          },
        ],
      };

      // Add to history
      setQaHistory([
        {
          id: Date.now().toString(),
          question,
          answer: mockResponse.text,
          sources: mockResponse.sources,
          timestamp: new Date().toISOString(),
        },
        ...qaHistory
      ]);
    } catch (err) {
      setError('Failed to process question: ' + (err.message || 'Unknown error'));
    } finally {
      setQaLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <PageHeader
          title="Q&A"
          subtitle="Ask questions about your documents"
          icon={<QuestionAnswerIcon />}
        />
        <LoadingCard title="Loading" message="Please wait while we load your documents..." />
      </Box>
    );
  }

  if (error && documents.length === 0) {
    return (
      <Box p={3}>
        <PageHeader
          title="Q&A"
          subtitle="Ask questions about your documents"
          icon={<QuestionAnswerIcon />}
        />
        <ErrorCard title="Error" message={error} onRetry={fetchDocuments} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <PageHeader
        title="Q&A"
        subtitle="Ask questions about your documents"
        icon={<QuestionAnswerIcon />}
      />

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
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const doc = documents.find(d => d.id === value);
                        return (
                          <Chip key={value} label={doc ? doc.title : value} />
                        );
                      })}
                    </Box>
                  )}
                >
                  {documents.map((doc) => (
                    <MenuItem key={doc.id} value={doc.id}>
                      <Checkbox checked={selectedDocuments.indexOf(doc.id) > -1} />
                      <ListItemText primary={doc.title} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedDocuments.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  Please select at least one document to ask questions.
                </Typography>
              )}
            </CardContent>
          </Card>

          <QAForm
            onSubmit={handleQuestionSubmit}
            loading={qaLoading}
            disabled={selectedDocuments.length === 0}
          />
        </Grid>

        {/* Right Column - Q&A History */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Q&A History
          </Typography>

          {qaHistory.length === 0 ? (
            <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No questions asked yet. Use the form to ask your first question.
              </Typography>
            </Card>
          ) : (
            <Box>
              {qaHistory.map((qa) => (
                <AnswerCard
                  key={qa.id}
                  question={qa.question}
                  answer={qa.answer}
                  sources={qa.sources}
                />
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default QAPage;
