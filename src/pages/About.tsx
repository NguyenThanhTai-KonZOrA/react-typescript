import React from 'react';
import { Container, Typography, Card, CardContent, Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Info, Build, Security } from '@mui/icons-material';
import { Layout } from '../components/layout';

const About: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
              About
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
              Export Excel Web Application
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              This application is built using React and TypeScript, leveraging Material-UI for a modern and responsive user interface. It provides functionalities for importing Excel files, managing settlement statements, and user authentication.
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Main Features:
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Build color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Import Excel Files" 
                    secondary="Supports importing and processing Excel files with validation and error handling"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Security color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Settlement Statement" 
                    secondary="Manages and searches settlement information with advanced filters"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Info color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Authentication" 
                    secondary="User authentication and authorization system"
                  />
                </ListItem>
              </List>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default About;
