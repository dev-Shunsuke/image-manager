import * as React from 'react';
import List from '@mui/material/List';
import { invoke } from '@tauri-apps/api/core';
import { useEffect } from 'react';
import { FileNode } from './types';
import ImageFolder from './ImageFolder';

export default function NestedList() {
  const [fileListItmes, setFileListItems] = React.useState<JSX.Element>();

  const renderFileNode = (node: FileNode) => {
    return (
      <ImageFolder  node={node}/>
    );
  };

  useEffect(() => {
    readFiles();
  }, []);

  async function readFiles() {
    let fileNodesString: string = (await invoke("get_file_contents", {}));
    const fileNodes: FileNode = JSON.parse(fileNodesString);
    setFileListItems(renderFileNode(fileNodes));
  }

  return (
    <List
      sx={{ width: '100%', height:'100%', maxWidth: 'auto', paddin:0, bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
       {fileListItmes}
    </List>
  );
}
