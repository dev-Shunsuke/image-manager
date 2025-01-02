import * as React from 'react';
import List from '@mui/material/List';
import { invoke } from '@tauri-apps/api/core';
import { useEffect } from 'react';
import { FileNode, ImageFile } from './types';
import ImageFolder from './ImageFolder';

interface ImageListProps {
  loadFile: (path: string) => Promise<void>;
  currentFile: string;
}

export default function NestedList({ loadFile,currentFile }: ImageListProps) {
  const [fileListItmes, setFileListItems] = React.useState<JSX.Element>();
  const [imageFiles, setImageFiles] = React.useState<Array<ImageFile>>([]);

  const renderFileNode = (node: FileNode) => {
    return (
      <ImageFolder node={node} loadFile={loadFile} />
    );
  };


  async function readFiles() {
    let fileNodesString: string = (await invoke("get_file_contents", {}));
    const fileNodes: FileNode = JSON.parse(fileNodesString);
    setFileListItems(renderFileNode(fileNodes));
    let imageFileNodeString: string = (await invoke("get_image_lists", {}));
    const imageList: Array<ImageFile> = JSON.parse(imageFileNodeString);
    setImageFiles(imageList);
  }

  async function handleKeyRight() {
    //imageFilesから、pathと同じpathを持つものを探し、その次の要素を取得
    const index = imageFiles.findIndex(file => file.path === currentFile);
    if (index === -1) {
      return;
    }
    const next = index + 1;
    if (next >= imageFiles.length) {
      return;
    }
    const nextPath = imageFiles[next].path;
    loadFile(nextPath);
  }

  async function handleKeyLeft() {
    //imageFilesから、pathと同じpathを持つものを探し、その前の要素を取得
    const index = imageFiles.findIndex(file => file.path === currentFile);
    if (index === -1) {
      return;
    }
    const next = index - 1;
    if (next < 0) {
      return;
    }
    const previousPath
    = imageFiles[next].path;
    loadFile(previousPath);
  }


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        handleKeyRight();
      }
      if (event.key === 'ArrowLeft') {
        handleKeyLeft();
      }
    };

    // イベントリスナーを追加
    window.addEventListener('keydown', handleKeyDown);

    // クリーンアップ関数
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentFile, imageFiles]); // 依存配列に必要な値を追加
  useEffect(() => {
    readFiles();
  }, []);

  return (
    <List
      sx={{ 
        width: '100%', 
        height: '100%', 
        maxWidth: 'auto', 
        padding: 0,
        bgcolor: 'background.paper',
        overflow: 'auto', // スクロール可能にする
        maxHeight: '100vh', // ビューポートの高さを最大値に
      }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      {fileListItmes}
    </List>
  );
}
