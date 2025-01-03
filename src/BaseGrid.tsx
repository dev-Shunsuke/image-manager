import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2";
import TabBase from "./TabBase";
import ImageIcon from "@mui/icons-material/Image";
import FolderIcon from "@mui/icons-material/Folder";
import ImageList from "./ImageList";
import { readFile } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

export default function BasicGrid() {
  const [file, setFile] = useState("");
  const [realPath, setRealPath] = useState("");
  const [foucusedPath, setFoucusedPath] = useState(
    "C:\\Users\\suesa\\Downloads\\comic\\onepiece"
  );
  // const [foucusedPath, setFoucusedPath] = useState("C:\\Users\\suesa\\OneDrive\\Desktop\\Work\\root_picfolder");

  const loadFile = async (path: string) => {
    try {
      console.log("BaseGrid loadFile called with path:", path);
      const fileContent = await readFile(path);
      const fileSrc = URL.createObjectURL(
        new Blob([fileContent.buffer], { type: "image/png" })
      );
      setFile(fileSrc);
      setRealPath(path);
      console.log("BaseGrid realPath set to:", path);
    } catch (error) {
      console.error("Error loading file:", error);
    }
  };

  useEffect(() => {
    setTabItems([
      {
        icon: <FolderIcon />,
        component: (
          <ImageList
            loadFile={loadFile}
            currentFile={realPath}
            foucusedPath={foucusedPath}
            setFoucusedPath={foucusePath}
          />
        ),
      },
      {
        icon: <ImageIcon />,
        component: (
          <ImageList
            loadFile={loadFile}
            currentFile={realPath}
            foucusedPath={foucusedPath}
            setFoucusedPath={foucusePath}
          />
        ),
      },
    ]);
  }, [realPath, foucusedPath]);

  const foucusePath = (path: string) => {
    setFoucusedPath(path);
    // tabItemsを更新して再描画をトリガー
    console.log(path);
    setTabItems([
      {
        icon: <FolderIcon />,
        component: (
          <ImageList
            loadFile={loadFile}
            currentFile={realPath}
            foucusedPath={path}
            setFoucusedPath={foucusePath}
          />
        ),
      },
      {
        icon: <ImageIcon />,
        component: (
          <ImageList
            loadFile={loadFile}
            currentFile={realPath}
            foucusedPath={path}
            setFoucusedPath={foucusePath}
          />
        ),
      },
    ]);
  };

  const [tabItems, setTabItems] = useState([
    {
      icon: <FolderIcon />,
      component: (
        <ImageList
          loadFile={loadFile}
          currentFile={realPath}
          foucusedPath={foucusedPath}
          setFoucusedPath={foucusePath}
        />
      ),
    },
    {
      icon: <ImageIcon />,
      component: (
        <ImageList
          loadFile={loadFile}
          currentFile={realPath}
          foucusedPath={foucusedPath}
          setFoucusedPath={foucusePath}
        />
      ),
    },
  ]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: "100%", // Changed from 'auto' to '100%'
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Grid container spacing={0} sx={{ flex: 1 }}>
        <Grid size={2} sx={{ height: "100%" }}>
          <Item>
            <TabBase tabs={tabItems} />
          </Item>
        </Grid>
        <Grid size={10}>
          <Item>
            <img
              src={file}
              style={{ maxHeight: "71.0em", maxWidth: "71.0em" }}
            />
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
}
