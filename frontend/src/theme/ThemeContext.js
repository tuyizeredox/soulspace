import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => {
  return useContext(ColorModeContext);
};

export const ThemeProviderWrapper = ({ children }) => {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#2563eb', // Updated blue
            light: '#60a5fa',
            dark: '#1e40af',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#f43f5e', // Updated pink
            light: '#fb7185',
            dark: '#be123c',
            contrastText: '#ffffff',
          },
          success: {
            main: '#10b981', // Added success color
            light: '#34d399',
            dark: '#059669',
          },
          warning: {
            main: '#f59e0b', // Added warning color
            light: '#fbbf24',
            dark: '#d97706',
          },
          error: {
            main: '#ef4444', // Added error color
            light: '#f87171',
            dark: '#b91c1c',
          },
          info: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
          },
          background: {
            default: mode === 'light' ? '#f8fafc' : '#0f172a',
            paper: mode === 'light' ? '#ffffff' : '#1e293b',
          },
          text: {
            primary: mode === 'light' ? '#334155' : '#e2e8f0',
            secondary: mode === 'light' ? '#64748b' : '#94a3b8',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
          },
          h2: {
            fontSize: '2rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
          },
          h6: {
            fontSize: '1rem',
            fontWeight: 600,
          },
          subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
            color: mode === 'light' ? '#64748b' : '#94a3b8',
          },
          subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
            color: mode === 'light' ? '#64748b' : '#94a3b8',
          },
          body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
          },
          body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
          },
          button: {
            fontWeight: 600,
            textTransform: 'none',
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                padding: '8px 16px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'light'
                    ? '0 6px 10px rgba(0, 0, 0, 0.1)'
                    : '0 6px 10px rgba(0, 0, 0, 0.3)',
                },
              },
              contained: {
                boxShadow: mode === 'light'
                  ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                  : '0 2px 4px rgba(0, 0, 0, 0.3)',
              },
              outlined: {
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: mode === 'light'
                  ? '0 4px 20px rgba(0, 0, 0, 0.08)'
                  : '0 4px 20px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: mode === 'light'
                    ? '0 8px 30px rgba(0, 0, 0, 0.12)'
                    : '0 8px 30px rgba(0, 0, 0, 0.4)',
                  transform: 'translateY(-4px)',
                },
              },
            },
          },
          MuiCardContent: {
            styleOverrides: {
              root: {
                padding: 24,
                '&:last-child': {
                  paddingBottom: 24,
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
              elevation1: {
                boxShadow: mode === 'light'
                  ? '0 2px 8px rgba(0, 0, 0, 0.08)'
                  : '0 2px 8px rgba(0, 0, 0, 0.3)',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom: `1px solid ${mode === 'light' ? '#f1f5f9' : '#334155'}`,
              },
              head: {
                fontWeight: 600,
                backgroundColor: mode === 'light' ? '#f8fafc' : '#1e293b',
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                '&:hover': {
                  backgroundColor: mode === 'light' ? '#f1f5f9' : '#334155',
                },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light'
                  ? '0 2px 10px rgba(0, 0, 0, 0.05)'
                  : '0 2px 10px rgba(0, 0, 0, 0.2)',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'light' ? '#ffffff' : '#0f172a',
                borderRight: `1px solid ${mode === 'light' ? '#e2e8f0' : '#334155'}`,
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                margin: '4px 8px',
                '&.Mui-selected': {
                  backgroundColor: alpha(mode === 'light' ? '#2563eb' : '#3b82f6', 0.1),
                  '&:hover': {
                    backgroundColor: alpha(mode === 'light' ? '#2563eb' : '#3b82f6', 0.15),
                  },
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          MuiAvatar: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                backgroundColor: mode === 'light' ? '#334155' : '#e2e8f0',
                color: mode === 'light' ? '#ffffff' : '#0f172a',
                fontSize: '0.75rem',
                fontWeight: 500,
                boxShadow: mode === 'light'
                  ? '0 2px 8px rgba(0, 0, 0, 0.15)'
                  : '0 2px 8px rgba(0, 0, 0, 0.3)',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
