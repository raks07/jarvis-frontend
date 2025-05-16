import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

const QAForm = ({ onSubmit, loading }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && onSubmit) {
      onSubmit(question);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom>
        Ask a Question
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ask a question about your documents and receive answers based on their content.
      </Typography>
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'flex-start' },
          gap: 1
        }}
      >
        <TextField
          fullWidth
          multiline
          rows={1}
          placeholder="Type your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
          InputProps={{
            sx: { backgroundColor: 'background.paper' }
          }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={!question.trim() || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          sx={{ 
            minWidth: { sm: '120px' },
            alignSelf: { xs: 'flex-end', sm: 'stretch' },
            height: { sm: '100%' }
          }}
        >
          {loading ? 'Asking...' : 'Ask'}
        </Button>
      </Box>
    </Paper>
  );
};

export default QAForm;
