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
              Ứng dụng web được xây dựng bằng React + TypeScript + Material-UI, 
              chuyên dụng cho việc xử lý và quản lý dữ liệu Excel với tính năng import, 
              validate và xuất báo cáo settlement.
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Tính năng chính:
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Build color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Import Excel Files" 
                    secondary="Hỗ trợ upload và xử lý file Excel với validation dữ liệu"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Security color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Settlement Statement" 
                    secondary="Quản lý và tìm kiếm thông tin settlement với bộ lọc nâng cao"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Info color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Authentication" 
                    secondary="Hệ thống xác thực và phân quyền người dùng"
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
