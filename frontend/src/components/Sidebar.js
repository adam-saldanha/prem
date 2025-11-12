import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  Groups,
  SportsSoccer,
  Psychology,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;
const collapsedWidth = 80;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Standings', icon: <Groups />, path: '/clubs' },
  { text: 'Matches', icon: <SportsSoccer />, path: '/matches' },
  { text: 'Predictions', icon: <Psychology />, path: '/predictions' },
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'white',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', pt: 2 }}>
            <List sx={{ px: 2 }}>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    selected={location.pathname === item.path}
                    sx={{
                      borderRadius: '8px',
                      minHeight: 44,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: location.pathname === item.path ? 'white' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.9375rem',
                        fontWeight: location.pathname === item.path ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      ) : (
        /* Desktop drawer */
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            width: open ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : collapsedWidth,
              boxSizing: 'border-box',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflowX: 'hidden',
              bgcolor: 'white',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', pt: 2 }}>
            <List sx={{ px: open ? 2 : 1 }}>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    selected={location.pathname === item.path}
                    sx={{
                      borderRadius: open ? '8px' : '50%',
                      minHeight: open ? 44 : 48,
                      width: open ? 'auto' : 48,
                      mx: open ? 0 : 'auto',
                      justifyContent: open ? 'flex-start' : 'center',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: open ? 40 : 'auto',
                        mr: open ? 0 : 0,
                        justifyContent: 'center',
                        color: location.pathname === item.path ? 'white' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.9375rem',
                          fontWeight: location.pathname === item.path ? 600 : 500,
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
