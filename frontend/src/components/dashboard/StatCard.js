import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color, subtitle, trend, trendUp }) => {
  const theme = useTheme();

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          opacity: 0.1,
          transform: 'translate(20%, -20%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 80, color } })}
      </Box>

      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: color,
              mr: 2,
              boxShadow: `0 4px 8px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)'}`,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div" fontWeight="600">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography
            variant="h3"
            component={motion.h3}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            sx={{
              fontWeight: 700,
              color: theme.palette.mode === 'light' ? theme.palette.grey[800] : theme.palette.grey[100],
            }}
          >
            {value}
          </Typography>

          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {trendUp !== undefined && (
                <Box
                  component={motion.div}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  sx={{
                    mr: 1,
                    display: 'flex',
                    alignItems: 'center',
                    color: trendUp ? theme.palette.success.main : theme.palette.error.main
                  }}
                >
                  {trendUp ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                </Box>
              )}
              <Typography
                variant="body2"
                component={motion.p}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                sx={{
                  color: trendUp !== undefined
                    ? (trendUp ? theme.palette.success.main : theme.palette.error.main)
                    : theme.palette.text.secondary,
                  fontWeight: 500
                }}
              >
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;