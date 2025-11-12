import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import Matches from './pages/Matches';
import Predictions from './pages/Predictions';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(
    window.innerWidth >= 1024
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 12, sm: 13, md: 14 },
          width: { xs: '100%', lg: sidebarOpen ? 'calc(100% - 280px)' : 'calc(100% - 80px)' },
          ml: { xs: 0, lg: 0 },
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetail />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
