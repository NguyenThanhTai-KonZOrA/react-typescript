import React, { useState } from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { Filter } from '../types';
import { Layout } from '../components/layout';

const Home: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
              Export Excel Web Application
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              This application allows users to log in, upload Excel files, and manage team representatives and settlement statements with advanced filtering and pagination features.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default Home;
