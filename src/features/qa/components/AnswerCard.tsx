import React, { useState } from "react";
import { Box, Paper, Typography, Divider, Chip, Accordion, AccordionSummary, AccordionDetails, Stack } from "@mui/material";
import { ExpandMore as ExpandMoreIcon, QuestionAnswer as QuestionAnswerIcon } from "@mui/icons-material";
import { marked } from "marked";

interface Source {
  documentTitle: string;
  relevanceScore: number;
  excerpt: string;
  documentId?: string;
}

interface AnswerCardProps {
  question: string;
  answer: string;
  sources?: Source[];
}

const AnswerCard: React.FC<AnswerCardProps> = ({ question, answer, sources }) => {
  const [expandedSource, setExpandedSource] = useState<number | null>(null);

  const handleSourceToggle = (sourceId: number) => {
    setExpandedSource(expandedSource === sourceId ? null : sourceId);
  };

  // Parse markdown in the answer
  const createMarkup = (content: string) => {
    return { __html: marked(content) };
  };

  return (
    <Paper elevation={1} sx={{ mb: 3, overflow: "hidden" }}>
      {/* Question Section */}
      <Box sx={{ p: 2, backgroundColor: "primary.light" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <QuestionAnswerIcon color="primary" />
          <Typography variant="h6" fontWeight="medium" color="primary.dark">
            Question
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {question}
        </Typography>
      </Box>

      <Divider />

      {/* Answer Section */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Answer
        </Typography>
        <Typography
          variant="body1"
          component="div"
          dangerouslySetInnerHTML={createMarkup(answer)}
          sx={{
            "& a": {
              color: "primary.main",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            },
          }}
        />
      </Box>

      {/* Sources Section */}
      {sources && sources.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Sources
            </Typography>

            <Stack spacing={1}>
              {sources.map((source, index) => (
                <Accordion
                  key={index}
                  expanded={expandedSource === index}
                  onChange={() => handleSourceToggle(index)}
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    "&:before": {
                      display: "none",
                    },
                  }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`source-${index}-content`} id={`source-${index}-header`}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: "100%" }}>
                      <Typography variant="subtitle1">{source.documentTitle}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip label={`Score: ${Math.round(source.relevanceScore * 100)}%`} size="small" color={source.relevanceScore > 0.7 ? "success" : source.relevanceScore > 0.4 ? "warning" : "error"} variant="outlined" />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: "grey.50", padding: 2 }}>
                    <Typography variant="body2">{source.excerpt}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default AnswerCard;
