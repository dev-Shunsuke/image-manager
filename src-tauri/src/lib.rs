// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use file_reader::get_file_tree;
use file_reader::get_image_list;
use file_reader::get_folder_tree;

const ROOT_PATH: &str = r"C:\Users\suesa\Downloads\comic\onepiece";

#[tauri::command]
fn get_file_contents(path : &str) -> String {
    let result = get_file_tree(path, &["png", "jpg", "jpeg"]);
    match result {
        Ok(tree) => {
            let json = serde_json::to_string(&tree).unwrap_or_else(|_| "".to_string());
           // print!("JSON: {}", json);
            json
        },
        Err(e) => {
            println!("Error: {}", e);
            "".to_string()
        }
    }
}

#[tauri::command]
fn get_image_lists(path : &str) -> String {
    let result = get_image_list(path, &["png", "jpg", "jpeg"]);
    match result {
        Ok(tree) => {
            let json = serde_json::to_string(&tree).unwrap_or_else(|_| "".to_string());
           // print!("JSON: {}", json);
            json
        },
        Err(e) => {
            println!("Error: {}", e);
            "".to_string()
        }
    }
}

#[tauri::command]
fn get_folder_node(path : &str) -> String {
    let result = get_folder_tree(path, &["png", "jpg", "jpeg"]);
    match result {
        Ok(tree) => {
            let json = serde_json::to_string(&tree).unwrap_or_else(|_| "".to_string());
        // print!("JSON: {}", json);
            json
        },
        Err(e) => {
            println!("Error: {}", e);
            "".to_string()
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![get_file_contents,get_image_lists,get_folder_node])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
