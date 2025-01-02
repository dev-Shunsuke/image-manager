export interface FileNode {
    name: string;
    path: string;
    is_dir: boolean;
    children: FileNode[];
    depth: number;
  }
  export interface ImageFile {
    name: string;
    path: string;
  }