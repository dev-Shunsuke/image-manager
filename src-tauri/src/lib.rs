// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use file_reader::get_file_tree;

const ROOT_PATH: &str = "C:\\Users\\suesa\\OneDrive\\Desktop\\Work\\root_picfolder";

#[tauri::command]
fn get_file_contents() -> String {
    let result = get_file_tree(ROOT_PATH, &["png", "jpg"]);
    match result {
        Ok(tree) => {
            let json = serde_json::to_string(&tree).unwrap_or_else(|_| "".to_string());
            print!("JSON: {}", json);
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
        .invoke_handler(tauri::generate_handler![get_file_contents])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
