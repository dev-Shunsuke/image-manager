import * as React from "react";
import List from "@mui/material/List";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { FileNode, ImageFile } from "./types";
import ImageFolder from "./ImageFolder";

interface ImageListProps {
  loadFile: (path: string) => Promise<void>;
  currentFile: string;
  foucusedPath: string;
  setFoucusedPath: (path: string) => void;
}

export default function NestedList({
  loadFile,
  currentFile,
  foucusedPath,
  setFoucusedPath,
}: ImageListProps) {
  const [fileListItmes, setFileListItems] = React.useState<JSX.Element>();
  const [imageFiles, setImageFiles] = React.useState<Array<ImageFile>>([]);

  const renderFileNode = (node: FileNode) => {
    return (
      <ImageFolder
        node={node}
        loadFile={loadFile}
        foucusedPath={foucusedPath}
        setFoucusedPath={setFoucusedPath}
      />
    );
  };

  async function readFiles() {
    console.log("onreadFiles" + foucusedPath);
    let fileNodesString: string = await invoke("get_file_contents", {
      path: foucusedPath,
    });
    const fileNodes: FileNode = JSON.parse(fileNodesString);
    setFileListItems(renderFileNode(fileNodes));
    let imageFileNodeString: string = await invoke("get_image_lists", {
      path: foucusedPath,
    });
    const imageList: Array<ImageFile> = JSON.parse(imageFileNodeString);
    setImageFiles(imageList);
  }

  useEffect(() => {
    console.log("ImageList received new currentFile:", currentFile);
  }, [currentFile]);

  async function handleKeyRight() {
    console.log("handleKeyRight called");
    console.log("Current state:", { currentFile, imageFiles });

    // If currentFile is empty, start from the first image
    if (!currentFile && imageFiles.length > 0) {
      const firstPath = imageFiles[0].path;
      await loadFile(firstPath);
      return;
    }

    const index = imageFiles.findIndex((file) => file.path === currentFile);
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
    const index = imageFiles.findIndex((file) => file.path === currentFile);
    if (index === -1) {
      return;
    }
    const next = index - 1;
    if (next < 0) {
      return;
    }
    const previousPath = imageFiles[next].path;
    loadFile(previousPath);
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleKeyRight();
      }
      if (event.key === "ArrowLeft") {
        handleKeyLeft();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentFile, imageFiles, loadFile]);

  useEffect(() => {
    console.log(foucusedPath);
    console.log("ImageList useEffect");
    setFileListItems(undefined);
    readFiles();
  }, [foucusedPath]);

  return (
    <List
      sx={{
        width: "100%",
        height: "100%",
        maxWidth: "auto",
        padding: 0,
        bgcolor: "background.paper",
        overflow: "auto", // スクロール可能にする
        maxHeight: "90vh", // ビューポートの高さを最大値に
      }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      {fileListItmes}
    </List>
  );
}
