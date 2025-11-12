import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  SportsSoccer,
} from '@mui/icons-material';

const Navbar = ({ toggleSidebar }) => {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <IconButton
          aria-label="toggle sidebar"
          edge="start"
          onClick={toggleSidebar}
          sx={{
            mr: 2,
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'grey.100',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: 'primary.main',
              mr: 1.5,
            }}
          >
            <SportsSoccer sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.01em',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Prem Pulse
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
