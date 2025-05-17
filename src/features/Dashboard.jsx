import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, ListItemIcon, ListItemAvatar, Avatar, Divider, Button, Chip, Stack } from "@mui/material";
import { Dashboard as DashboardIcon, Description as DocumentIcon, QuestionAnswer as QAIcon, PieChart as PieChartIcon, Person as PersonIcon } from "@mui/icons-material";

import PageHeader from "@/components/common/PageHeader";
import { useAppSelector } from "@/store/hooks";
import * as documentsService from "@/services/documents.service";
import * as ingestionService from "@/services/ingestion.service";
import * as qaService from "@/services/qa.service";
import LoadingCard from "@/components/common/LoadingCard";
import ErrorCard from "@/components/common/ErrorCard";

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState({
    documentsCount: 0,
    ingestionsCount: 0,
    completedIngestionsCount: 0,
    qaCount: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get documents data
      const documentsResponse = await documentsService.getDocuments();
      const documents = documentsResponse.data;

      // Get ingestions data
      const ingestionsResponse = await ingestionService.getIngestions();
      const ingestions = ingestionsResponse.data;

      // Get QA sessions
      const qaSessions = await qaService.getQASessions(user.id);

      // Calculate the stats
      const statsData = {
        documentsCount: documents.length,
        ingestionsCount: ingestions.length,
        completedIngestionsCount: ingestions.filter((ing) => ing.status === "completed").length,
        qaCount: qaSessions.data.reduce((total, session) => total + session.questions.length, 0),
      };

      // Get the most recent documents (up to 5)
      const sortedDocuments = [...documents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

      // Get the most recent questions from all sessions (up to 5)
      const allQuestions = qaSessions.data.flatMap((session) =>
        session.questions.map((q) => ({
          id: q.id,
          text: q.text,
          createdAt: q.timestamp,
        }))
      );

      const sortedQuestions = allQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

      setStats(statsData);
      setRecentDocuments(sortedDocuments);
      setRecentQuestions(sortedQuestions);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to fetch dashboard data: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box p={3}>
        <PageHeader title={`Welcome, ${user?.username || "User"}`} subtitle="Dashboard overview of your document management system" icon={<DashboardIcon />} />
        <LoadingCard title="Loading Dashboard" message="Please wait while we load your dashboard data..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <PageHeader title={`Welcome, ${user?.username || "User"}`} subtitle="Dashboard overview of your document management system" icon={<DashboardIcon />} />
        <ErrorCard title="Error" message={error} onRetry={fetchDashboardData} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <PageHeader title={`Welcome, ${user?.username || "User"}`} subtitle="Dashboard overview of your document management system" icon={<DashboardIcon />} />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box sx={{ mr: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <DocumentIcon />
                  </Avatar>
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.documentsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Documents
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box sx={{ mr: 2 }}>
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <PieChartIcon />
                  </Avatar>
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.completedIngestionsCount}/{stats.ingestionsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Ingestions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box sx={{ mr: 2 }}>
                  <Avatar sx={{ bgcolor: "info.main" }}>
                    <QAIcon />
                  </Avatar>
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.qaCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Questions Asked
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box sx={{ mr: 2 }}>
                  <Avatar sx={{ bgcolor: "warning.main" }}>
                    <PersonIcon />
                  </Avatar>
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    {user?.role || "Viewer"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your Role
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Documents
              </Typography>
              <List>
                {recentDocuments.map((doc, index) => (
                  <React.Fragment key={doc.id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem>
                      <ListItemIcon>
                        <DocumentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={doc.title} secondary={`Uploaded by ${doc.uploadedBy?.username || "Unknown"} on ${formatDate(doc.createdAt)}`} />
                    </ListItem>
                  </React.Fragment>
                ))}
                {recentDocuments.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No documents found" secondary="Upload your first document to get started" />
                  </ListItem>
                )}
              </List>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button color="primary" href="/documents">
                  View All Documents
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Questions
              </Typography>
              <List>
                {recentQuestions.map((question, index) => (
                  <React.Fragment key={question.id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem>
                      <ListItemIcon>
                        <QAIcon color="info" />
                      </ListItemIcon>
                      <ListItemText primary={question.text} secondary={`Asked on ${formatDate(question.createdAt)}`} />
                    </ListItem>
                  </React.Fragment>
                ))}
                {recentQuestions.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No questions asked yet" secondary="Start asking questions to see them here" />
                  </ListItem>
                )}
              </List>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button color="primary" href="/qa">
                  Go to Q&A
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
