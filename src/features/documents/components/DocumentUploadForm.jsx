import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Styled component for file input
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string(),
  file: yup
    .mixed()
    .required('File is required')
    .test('fileSize', 'File is too large (max: 10MB)', 
      (value) => !value || (value && value.size <= 10 * 1024 * 1024)),
});

const DocumentUploadForm = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');

  const { 
    control, 
    handleSubmit, 
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      file: null,
    }
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setValue('file', file);
      setFileName(file.name);
      
      // If title is empty, use the file name as default
      const { title } = control._formValues;
      if (!title) {
        setValue('title', file.name.split('.')[0]);
      }
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('file', data.file);
      
      // This would be replaced with actual API call
      // const response = await uploadDocument(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      reset();
      setFileName('');
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Document
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Title"
                  fullWidth
                  margin="normal"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                disabled={loading}
                fullWidth
              >
                Select File
                <Controller
                  name="file"
                  control={control}
                  render={({ field: { ref, ...field } }) => (
                    <VisuallyHiddenInput
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFileChange(e);
                      }}
                      type="file"
                      inputRef={ref}
                    />
                  )}
                />
              </Button>
              
              {fileName && (
                <Typography variant="body2" sx={{ mt: 1, ml: 1 }}>
                  {fileName}
                </Typography>
              )}
              
              {errors.file && (
                <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                  {errors.file.message}
                </Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default DocumentUploadForm;
