import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { FileNode } from './types';
import Folder from '@mui/icons-material/Folder';
import ImageIcon from '@mui/icons-material/Image';

interface Props {
    node: FileNode;
    loadFile: (path: string) => Promise<void>;
  }

export default function ImageFolder({ node,loadFile }: Props) {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleImageClick = (path: string) => {
    loadFile(path).then(() => {
      // Handle the file loading here
    });
  };

  return (
    <div>
      <ListItemButton onClick={handleClick} sx={{ pl: (1+node.depth),minWidth: '100%' }}>
        <ListItemIcon>
          <Folder />
        </ListItemIcon>
        <ListItemText primary={node.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
        {node.children.map((child) => (
            child.is_dir ? (
              <div style={{paddingLeft:1}}>
                <ImageFolder node={child} loadFile={loadFile}  />
                </div>
              ) : (
                <ListItemButton 
                  key={child.path}
                  sx={{ pl: (2+node.depth), minWidth: '100%' }} 
                  onClick={() => handleImageClick(child.path)}
                >
                  <ListItemIcon>
                    <ImageIcon />
                  </ListItemIcon>
                  <ListItemText primary={child.name} />
                </ListItemButton>
              )
          ))}
        </List>
      </Collapse>
      </div>
  );
}

