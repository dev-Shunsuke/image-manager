import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import TabBase from './TabBase';  
import ImageIcon from '@mui/icons-material/Image';
import StarIcon from '@mui/icons-material/Star';
import FolderIcon from '@mui/icons-material/Folder';
import ImageList from './ImageList';
import { readFile } from '@tauri-apps/plugin-fs';
import { useEffect, useState } from 'react';

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



export default function BasicGrid() {

  const [file, setFile] = useState("");

  const loadFile = async (path: string) => {
    try {
      const fileContent = await readFile(path);
      const fileSrc = URL.createObjectURL(
        new Blob([fileContent.buffer], { type: 'image/png' })
      );
      setFile(fileSrc);
    } catch (error) {
      console.error("Error loading file:", error);
    }
  };

  const tabItems = [
    {
      icon: <ImageIcon />,
      component: <ImageList loadFile={loadFile} />
    },
    {
      icon: <StarIcon />,
      component: <ImageList loadFile={loadFile} />
    }
  ];

  useEffect(() => {
    loadFile("C:\\Users\\suesa\\OneDrive\\Desktop\\Work\\root_picfolder\\1\\1-1.jpg");
  }, []);

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
          <Item><img src={file} /></Item>
        </Grid>
      </Grid>
    </Box>
  );
}