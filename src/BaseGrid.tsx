import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import App from './App';
import TabBase from './TabBase';  
import ImageIcon from '@mui/icons-material/Image';
import StarIcon from '@mui/icons-material/Star';
import FolderIcon from '@mui/icons-material/Folder';
import ImageList from './ImageList';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

const tabItems = [
  {
    icon: <ImageIcon />,
    component: <ImageList />
  },
  {
    icon: <StarIcon />,
    component: <App />
  },
  {
    icon: <FolderIcon />,
    component: <App />
  },
];

export default function BasicGrid() {
  return (
    <Box sx={{ 
      flexGrow: 1,
      height: '100%', // Changed from 'auto' to '100%'
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Grid container spacing={0} sx={{ flex: 1 }}>
        <Grid size={2} sx={{ height: '100%' }}>
          <Item><TabBase tabs={tabItems} /></Item>
        </Grid>
        <Grid size={10} sx={{ height: '100%' }}>
          <Item>size=4</Item>
        </Grid>
      </Grid>
    </Box>
  );
}