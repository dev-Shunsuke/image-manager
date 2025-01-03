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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface Props {
    node: FileNode;
    loadFile: (path: string) => Promise<void>;
    foucusedPath: string;
    setFoucusedPath: (path: string) => void;
  }

export default function ImageFolder({ node,loadFile,foucusedPath,setFoucusedPath }: Props) {
  const [open, setOpen] = React.useState(false);
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
    path: string;
  } | null>(null);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleImageClick = (path: string) => {
    loadFile(path);
  };

  const handleContextMenu = (event: React.MouseEvent, path: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      path: path,
    });
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleFocus = () => {
    if (contextMenu) {
      setFoucusedPath(contextMenu.path);
      handleClose();
    }
  };

  return (
    <div>
      <ListItemButton onClick={handleClick} onContextMenu={(e) => handleContextMenu(e, node.path)} sx={{ pl: (1+node.depth),minWidth: '100%' }}>
        <ListItemIcon sx={{ minWidth: 'auto' }}>
          <Folder sx={{ pr: 0 }}/>
        </ListItemIcon>
        <ListItemText primary={node.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
        {node.children.map((child) => (
    child.is_dir ? (
        <div key={child.path} style={{paddingLeft:1}}>
            <ImageFolder node={child} loadFile={loadFile} foucusedPath={foucusedPath} setFoucusedPath={setFoucusedPath}/>
        </div>
    ) : (
        <ListItemButton 
            key={child.path}
            sx={{ pl: (2+node.depth), minWidth: '100%' }} 
            onClick={() => handleImageClick(child.path)}
        >
            <ListItemIcon sx={{ minWidth: 'auto' }}>
                <ImageIcon />
            </ListItemIcon>
            <ListItemText primary={child.name} />
        </ListItemButton>
    )
))}
        </List>
      </Collapse>

      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleFocus}>フォーカス</MenuItem>
      </Menu>
      </div>
  );
}

