import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  useTheme,
} from '@mui/material';
import {
  DarkMode,
  Notifications,
  Lock,
  Language,
  AccessTime,
  VolumeUp,
} from '@mui/icons-material';
import { useColorMode } from '../../theme/ThemeContext';

const Settings = () => {
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  const settings = [
    {
      icon: <DarkMode />,
      title: 'Dark Mode',
      description: 'Toggle dark/light theme',
      action: (
        <Switch
          checked={theme.palette.mode === 'dark'}
          onChange={toggleColorMode}
        />
      ),
    },
    {
      icon: <Notifications />,
      title: 'Notifications',
      description: 'Manage notification preferences',
      action: <Switch defaultChecked />,
    },
    {
      icon: <Lock />,
      title: 'Privacy',
      description: 'Control your privacy settings',
      action: <Switch defaultChecked />,
    },
    {
      icon: <Language />,
      title: 'Language',
      description: 'Choose your preferred language',
      value: 'English (US)',
    },
    {
      icon: <AccessTime />,
      title: 'Time Zone',
      description: 'Set your local time zone',
      value: 'UTC+02:00',
    },
    {
      icon: <VolumeUp />,
      title: 'Sound',
      description: 'Manage sound settings',
      action: <Switch defaultChecked />,
    },
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your application preferences and account settings
        </Typography>

        <Card
          sx={{
            mt: 4,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <List>
              {settings.map((setting, index) => (
                <React.Fragment key={setting.title}>
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemIcon sx={{ color: 'primary.main' }}>
                      {setting.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={setting.title}
                      secondary={setting.description}
                    />
                    <ListItemSecondaryAction>
                      {setting.action || (
                        <Typography variant="body2" color="text.secondary">
                          {setting.value}
                        </Typography>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < settings.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Settings;
