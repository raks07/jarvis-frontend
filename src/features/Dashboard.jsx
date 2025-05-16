import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, ListItemIcon, ListItemAvatar, Avatar, Divider, Button, Chip, Stack } from "@mui/material";
import { Dashboard as DashboardIcon, Description as DocumentIcon, QuestionAnswer as QAIcon, PieChart as PieChartIcon, Person as PersonIcon } from "@mui/icons-material";

import PageHeader from "@/components/common/PageHeader";
import { useAppSelector } from "@/store/hooks";

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // This would be replaced with actual API calls

      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock stats data
      const mockStats = {
        documentsCount: 5,
        ingestionsCount: 8,
        completedIngestionsCount: 6,
        qaCount: 12,
      };

      // Mock recent documents
      const mockRecentDocuments = [
        {
          id: "1",
          title: "Company Policy Document",
          uploadedBy: "admin",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          title: "Technical Documentation",
          uploadedBy: "editor",
          createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          title: "Research Paper",
          uploadedBy: "editor",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Mock recent questions
      const mockRecentQuestions = [
        {
          id: "1",
          text: "What is the company policy on remote work?",
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          text: "How do I set up two-factor authentication?",
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          text: "What are the key findings in the research paper?",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setStats(mockStats);
      setRecentDocuments(mockRecentDocuments);
      setRecentQuestions(mockRecentQuestions);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

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
                      <ListItemText primary={doc.title} secondary={`Uploaded by ${doc.uploadedBy} on ${formatDate(doc.createdAt)}`} />
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
