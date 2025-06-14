import React from 'react';
import { IconButton, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

/**
 * Sidebar minimization toggle button for use at the top of sidebars.
 * @param {object} props
 * @param {boolean} minimized
 * @param {function} onToggle
 * @param {string} [placement='left'] - Which side the sidebar is on ('left' or 'right')
 */
export default function SidebarMinimizeToggle({ minimized, onToggle, placement = 'left' }) {
  const theme = useTheme();
  // Show on all non-mobile devices (sm and up)
  const showToggle = useMediaQuery(theme.breakpoints.up('sm'));
  if (!showToggle) return null;
  return (
    <Tooltip title={minimized ? 'Expand sidebar' : 'Collapse sidebar'}>
      <IconButton
        size="small"
        onClick={onToggle}
        sx={{
          position: 'absolute',
          top: 8,
          [placement]: 8,
          zIndex: 2,
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 1,
          '&:hover': { bgcolor: 'action.hover' },
        }}
        aria-label={minimized ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {placement === 'left' ? (
          minimized ? <ChevronRightIcon /> : <ChevronLeftIcon />
        ) : (
          minimized ? <ChevronLeftIcon /> : <ChevronRightIcon />
        )}
      </IconButton>
    </Tooltip>
  );
}
