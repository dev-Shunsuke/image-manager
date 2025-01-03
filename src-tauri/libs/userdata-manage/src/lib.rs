use rusqlite::{params, Connection, Result};
use std::path::Path;

pub fn init_database(db_path: &str) -> Result<()> {
    // データベースが存在しない場合のみ新規作成
    if !Path::new(db_path).exists() {
        let conn = Connection::open(db_path)?;

        // カテゴリテーブルの作成
        conn.execute(
            "CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS file_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_id INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (file_id) REFERENCES files(id),
                FOREIGN KEY (category_id) REFERENCES categories(id),
                UNIQUE(file_id, category_id)
            )",
            [],
        )?;
    }
    Ok(())
}

// カテゴリの登録
pub fn insert_category(db_path: &str, name: &str, description: Option<&str>) -> Result<i64> {
    let conn = Connection::open(db_path)?;
    conn.execute(
        "INSERT INTO categories (name, description) VALUES (?1, ?2)",
        params![name, description],
    )?;
    Ok(conn.last_insert_rowid())
}

// カテゴリの取得
pub fn get_categories(db_path: &str) -> Result<Vec<Category>> {
    let conn = Connection::open(db_path)?;
    let mut stmt =
        conn.prepare("SELECT id, name, description, created_at, updated_at FROM categories")?;

    let categories = stmt
        .query_map([], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;

    Ok(categories)
}

// カテゴリの削除
pub fn delete_category(db_path: &str, category_id: i64) -> Result<()> {
    let conn = Connection::open(db_path)?;
    conn.execute("DELETE FROM categories WHERE id = ?1", params![category_id])?;
    Ok(())
}

// ファイルにカテゴリを関連付け
pub fn assign_category_to_file(db_path: &str, file_id: i64, category_id: i64) -> Result<i64> {
    let conn = Connection::open(db_path)?;
    conn.execute(
        "INSERT INTO file_categories (file_id, category_id) VALUES (?1, ?2)",
        params![file_id, category_id],
    )?;
    Ok(conn.last_insert_rowid())
}

// ファイルのカテゴリ一覧取得
pub fn get_file_categories(db_path: &str, file_id: i64) -> Result<Vec<Category>> {
    let conn = Connection::open(db_path)?;
    let mut stmt = conn.prepare(
        "SELECT c.id, c.name, c.description, c.created_at, c.updated_at 
         FROM categories c
         INNER JOIN file_categories fc ON c.id = fc.category_id
         WHERE fc.file_id = ?1",
    )?;

    let categories = stmt
        .query_map(params![file_id], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;

    Ok(categories)
}

// ファイルからカテゴリを削除
pub fn remove_category_from_file(db_path: &str, file_id: i64, category_id: i64) -> Result<()> {
    let conn = Connection::open(db_path)?;
    conn.execute(
        "DELETE FROM file_categories WHERE file_id = ?1 AND category_id = ?2",
        params![file_id, category_id],
    )?;
    Ok(())
}

// カテゴリ構造体の定義
#[derive(Debug)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    fn setup() -> Result<String> {
        let db_path = "test_images.db";
        init_database(db_path)?;
        Ok(db_path.to_string())
    }

    fn cleanup(db_path: &str) {
        std::fs::remove_file(db_path).ok();
    }

    #[test]
    fn test_init_database() -> Result<()> {
        let db_path = setup()?;
        assert!(Path::new(&db_path).exists());
        cleanup(&db_path);
        Ok(())
    }

    #[test]
    fn test_category_crud() -> Result<()> {
        let db_path = setup()?;

        // Create
        let category_id = insert_category(&db_path, "風景", Some("風景写真"))?;
        assert!(category_id > 0);

        // Read
        let categories = get_categories(&db_path)?;
        assert_eq!(categories.len(), 1);
        assert_eq!(categories[0].name, "風景");
        assert_eq!(categories[0].description, Some("風景写真".to_string()));

        // Delete
        delete_category(&db_path, category_id)?;
        let categories = get_categories(&db_path)?;
        assert_eq!(categories.len(), 0);

        cleanup(&db_path);
        Ok(())
    }

    #[test]
    fn test_file_category_operations() -> Result<()> {
        let db_path = setup()?;

        // カテゴリとファイルの準備
        let category_id = insert_category(&db_path, "風景", Some("風景写真"))?;
        let conn = Connection::open(&db_path)?;
        conn.execute(
            "INSERT INTO files (file_path, file_name) VALUES (?1, ?2)",
            params!["path/to/image.jpg", "image.jpg"],
        )?;
        let file_id = conn.last_insert_rowid();

        // ファイルにカテゴリを割り当て
        let relation_id = assign_category_to_file(&db_path, file_id, category_id)?;
        assert!(relation_id > 0);

        // ファイルのカテゴリを取得
        let file_categories = get_file_categories(&db_path, file_id)?;
        assert_eq!(file_categories.len(), 1);
        assert_eq!(file_categories[0].name, "風景");

        // ファイルからカテゴリを削除
        remove_category_from_file(&db_path, file_id, category_id)?;
        let file_categories = get_file_categories(&db_path, file_id)?;
        assert_eq!(file_categories.len(), 0);

        cleanup(&db_path);
        Ok(())
    }

    #[test]
    fn test_duplicate_category() -> Result<()> {
        let db_path = setup()?;

        // 最初のカテゴリ追加は成功
        insert_category(&db_path, "風景", Some("風景写真"))?;

        // 同じ名前のカテゴリ追加は失敗
        let result = insert_category(&db_path, "風景", Some("重複テスト"));
        assert!(result.is_err());

        cleanup(&db_path);
        Ok(())
    }

    #[test]
    fn test_duplicate_file_category_assignment() -> Result<()> {
        let db_path = setup()?;

        // テストデータ準備
        let category_id = insert_category(&db_path, "風景", Some("風景写真"))?;
        let conn = Connection::open(&db_path)?;
        conn.execute(
            "INSERT INTO files (file_path, file_name) VALUES (?1, ?2)",
            params!["path/to/image.jpg", "image.jpg"],
        )?;
        let file_id = conn.last_insert_rowid();

        // 1回目の割り当ては成功
        assign_category_to_file(&db_path, file_id, category_id)?;

        // 同じ組み合わせの2回目の割り当ては失敗
        let result = assign_category_to_file(&db_path, file_id, category_id);
        assert!(result.is_err());

        cleanup(&db_path);
        Ok(())
    }
}
