use std::fs;
use std::path::Path;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Vec<FileNode>,
    pub depth: i32,  // 階層数を表すフィールドを追加
}

pub fn get_file_tree(dir_path: &str, extensions: &[&str]) -> Result<FileNode, std::io::Error> {
    get_file_tree_with_depth(dir_path, extensions, 0)
}

fn get_file_tree_with_depth(dir_path: &str, extensions: &[&str], current_depth: i32) -> Result<FileNode, std::io::Error> {
    let path = Path::new(dir_path);
    let name = path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    let mut node = FileNode {
        name,
        path: dir_path.to_string(),
        is_dir: true,
        children: Vec::new(),
        depth: current_depth,  // 現在の階層数を設定
    };

    if path.is_dir() {
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let path = entry.path();
            let path_str = path.to_string_lossy().to_string();

            if path.is_dir() {
                let child_tree = get_file_tree_with_depth(&path_str, extensions, current_depth + 1)?;
                node.children.push(child_tree);
            } else {
                if let Some(ext) = path.extension() {
                    let ext_str = ext.to_string_lossy().to_string();
                    if extensions.is_empty() || extensions.iter().any(|&e| e == ext_str) {
                        node.children.push(FileNode {
                            name: path
                                .file_name()
                                .unwrap_or_default()
                                .to_string_lossy()
                                .to_string(),
                            path: path_str,
                            is_dir: false,
                            children: Vec::new(),
                            depth: current_depth + 1,  // 子要素の階層数を設定
                        });
                    }
                }
            }
        }
    }

    Ok(node)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test1() {
        let tree = get_file_tree("C:\\Users\\suesa\\Downloads\\comic",&["png","jpg"]).unwrap();
        //treeの中身を再帰的に確認する
        content_check(&tree);
    }

    fn content_check(tree: &FileNode) {
        if tree.is_dir {
            for child in &tree.children {
                content_check(child);
            }
        } else {
            println!("{}\t{}\t{}", tree.name,tree.path,tree.is_dir);
        }
    }

}
