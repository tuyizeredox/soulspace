import React from 'react';
import { Box, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

const DashboardBackground = ({ role = 'hospital_admin' }) => {
  const theme = useTheme();
  
  // Get color based on user role
  const getRoleColor = () => {
    switch (role) {
      case 'super_admin':
        return theme.palette.secondary.main;
      case 'hospital_admin':
        return theme.palette.primary.main;
      case 'doctor':
        return theme.palette.success.main;
      case 'patient':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };
  
  const roleColor = getRoleColor();
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        opacity: 0.6,
        pointerEvents: 'none',
      }}
    >
      {/* Animated gradient circles */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: { xs: '150px', md: '300px' },
          height: { xs: '150px', md: '300px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(roleColor, 0.15)} 0%, transparent 70%)`,
          opacity: 0.7,
          animation: 'pulse 15s infinite ease-in-out',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)', opacity: 0.7 },
            '50%': { transform: 'scale(1.1)', opacity: 0.5 },
            '100%': { transform: 'scale(1)', opacity: 0.7 },
          },
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          width: { xs: '100px', md: '200px' },
          height: { xs: '100px', md: '200px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.1)} 0%, transparent 70%)`,
          opacity: 0.6,
          animation: 'float 20s infinite ease-in-out',
          '@keyframes float': {
            '0%': { transform: 'translateY(0)', opacity: 0.6 },
            '50%': { transform: 'translateY(-20px)', opacity: 0.4 },
            '100%': { transform: 'translateY(0)', opacity: 0.6 },
          },
        }}
      />
      
      {/* Small floating particles */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: { xs: 4 + i * 2, md: 6 + i * 3 },
            height: { xs: 4 + i * 2, md: 6 + i * 3 },
            borderRadius: '50%',
            background: `${alpha(roleColor, 0.2 + i * 0.1)}`,
            boxShadow: `0 0 ${4 + i}px ${alpha(roleColor, 0.3)}`,
            top: `${15 + i * 12}%`,
            left: `${10 + i * 15}%`,
            animation: `float-particle-${i} ${10 + i * 2}s infinite ease-in-out`,
            [`@keyframes float-particle-${i}`]: {
              '0%': { transform: 'translate(0, 0)' },
              '25%': { transform: `translate(${10 + i * 5}px, ${-5 - i * 3}px)` },
              '50%': { transform: `translate(${20 + i * 2}px, ${10 + i * 2}px)` },
              '75%': { transform: `translate(${-10 - i * 2}px, ${15 + i}px)` },
              '100%': { transform: 'translate(0, 0)' },
            },
          }}
        />
      ))}
      
      {/* Pattern overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${roleColor.replace('#', '')}' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.3,
        }}
      />
      
      {/* Light gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(roleColor, 0.05)} 0%, transparent 50%, ${alpha(theme.palette.background.default, 0.05)} 100%)`,
        }}
      />
    </Box>
  );
};

export default DashboardBackground;
