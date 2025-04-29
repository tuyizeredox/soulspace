import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, useTheme, alpha, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color, subtitle, trend, trendUp }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.01)} 100%)`,
        border: `1px solid ${alpha(color, 0.1)}`,
        boxShadow: `0 10px 20px ${alpha(color, 0.1)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 15px 30px ${alpha(color, 0.2)}`,
          borderColor: alpha(color, 0.2),
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: { xs: 60, sm: 80 },
          height: { xs: 60, sm: 80 },
          opacity: 0.1,
          transform: 'translate(20%, -20%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: { xs: 60, sm: 80 }, color } })}
      </Box>

      <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.9),
              mr: 2,
              boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: `0 6px 16px ${alpha(color, 0.6)}`,
              },
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              component="div"
              fontWeight="600"
              sx={{ lineHeight: 1.3 }}
            >
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
            variant={isMobile ? "h4" : "h3"}
            component={motion.h3}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            sx={{
              fontWeight: 700,
              color: theme.palette.mode === 'light' ? theme.palette.grey[800] : theme.palette.grey[100],
              textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
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
                    color: trendUp ? theme.palette.success.main : theme.palette.error.main,
                    background: trendUp
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.error.main, 0.1),
                    borderRadius: '50%',
                    p: 0.5,
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
                  fontWeight: 600,
                  background: trendUp !== undefined
                    ? (trendUp ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1))
                    : 'transparent',
                  borderRadius: 10,
                  px: 1,
                  py: 0.5,
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