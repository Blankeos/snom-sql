// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConnection {
    pub id: i32, // or i64, depending on your Dexie.js setup
    pub nickname: String,
    pub database_type: String, // Assuming an enum or string type
    pub database_uri: String,
    pub host: String,
    pub port: Option<String>,
    pub user: String,
    pub password: String,
    pub database_name: String,
    pub schema: String,
}

use tauri::{Emitter, TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // https://v2.tauri.app/learn/window-customization/
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("Snom SQL")
                .transparent(true)
                .disable_drag_drop_handler() // <- I need this to make drag and drop work. `draggable` otherwise, it won't work.
                .inner_size(800.0, 600.0);

            // set transparent title bar only when building for macOS
            #[cfg(target_os = "macos")]
            let win_builder = win_builder.title_bar_style(TitleBarStyle::Overlay);

            let window = win_builder.build().unwrap();
            window.set_decorations(false);

            // set background color only when building for macOS
            #[cfg(target_os = "macos")]
            {
                use cocoa::appkit::{NSColor, NSWindow};
                use cocoa::base::{id, nil};

                let ns_window = window.ns_window().unwrap() as id;
                unsafe {
                    let bg_color = NSColor::colorWithRed_green_blue_alpha_(
                        nil,
                        50.0 / 255.0,
                        158.0 / 255.0,
                        163.5 / 255.0,
                        0.0,
                    );
                    ns_window.setBackgroundColor_(bg_color);
                }
            }

            app.on_menu_event(|app_handle, event| {
                println!("Menu item clicked: {:?}", event.id());

                let menu_id = event.id();
                match menu_id.as_ref() {
                    "connection-view" => {
                        let connection_id = "some_connection_id".to_string(); // Replace with actual connection ID logic
                        app_handle
                            .emit("connection-view", Some(connection_id))
                            .unwrap();
                    }
                    "connection-delete" => {
                        let connection_id = "some_connection_id".to_string(); // Replace with actual connection ID logic
                        app_handle
                            .emit("connection-delete", Some(connection_id))
                            .unwrap();
                    }
                    _ => {
                        println!("Unhandled menu item: {:?}", menu_id);
                    }
                }
            });

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            test_database_connection,
            execute_query
        ]) // Add this line
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use chrono;
use native_tls::TlsConnector;
use postgres_native_tls::MakeTlsConnector;
use tokio_postgres::types::Type;
use tokio_postgres::Row; // Import Row

#[tauri::command]
async fn test_database_connection(connection: DatabaseConnection) -> Result<String, String> {
    println!("Testing connection: {:?}", connection);

    match connection.database_type.as_str() {
        "postgres" => {
            let tls_connector = TlsConnector::new()
                .map_err(|e| format!("Failed to create TLS connector: {}", e))?;
            let tls = MakeTlsConnector::new(tls_connector);

            match tokio_postgres::connect(&connection.database_uri, tls).await {
                Ok((client, connection)) => {
                    tokio::spawn(async move {
                        if let Err(e) = connection.await {
                            eprintln!("connection error: {}", e);
                        }
                    });

                    match client.query("SELECT 1", &[]).await {
                        Ok(_) => Ok("Postgres connection successful!".into()),
                        Err(e) => Err(format!("Postgres query failed: {}", e)),
                    }
                }
                Err(e) => Err(format!("Postgres connection failed: {}", e)),
            }
        }
        "mysql" => Err("MySQL connection test not implemented yet".into()),
        "sqlite" => Err("SQLite connection test not implemented yet".into()),
        _ => Err("Unsupported database type".into()),
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryResult {
    pub columns: Vec<String>,
    pub rows: Vec<Vec<String>>,
}

#[tauri::command]
async fn execute_query(
    connection: DatabaseConnection,
    query: String,
) -> Result<QueryResult, String> {
    match connection.database_type.as_str() {
        "postgres" => {
            let tls_connector = TlsConnector::new()
                .map_err(|e| format!("Failed to create TLS connector: {}", e))?;
            let tls = MakeTlsConnector::new(tls_connector);

            let (client, connection_future) =
                tokio_postgres::connect(&connection.database_uri, tls)
                    .await
                    .map_err(|e| format!("Postgres connection failed: {}", e))?;

            // Spawn the connection task
            tokio::spawn(async move {
                if let Err(e) = connection_future.await {
                    eprintln!("connection error: {}", e);
                }
            });

            // Execute the query
            let result_rows: Vec<Row> = client
                .query(query.as_str(), &[])
                .await
                .map_err(|e| format!("Postgres query failed: {}", e))?;

            // Handle case where no rows are returned
            if result_rows.is_empty() {
                // Try preparing the statement to get column names even with zero rows
                let prepared_statement = client
                    .prepare(query.as_str())
                    .await
                    .map_err(|e| format!("Failed to prepare statement to get columns: {}", e))?;
                let column_names: Vec<String> = prepared_statement
                    .columns()
                    .iter()
                    .map(|col| col.name().to_string())
                    .collect();
                return Ok(QueryResult {
                    columns: column_names,
                    rows: vec![],
                });
            }

            // Get column names from the first row
            let first_row = &result_rows[0];
            let columns_metadata = first_row.columns();

            let column_names: Vec<String> = columns_metadata
                .iter()
                .map(|col| col.name().to_string())
                .collect();

            // Process rows into Vec<Vec<String>>
            let rows: Vec<Vec<String>> = result_rows
                .iter()
                .map(|row| {
                    columns_metadata
                        .iter()
                        .enumerate()
                        .map(|(i, column)| {
                            match column.type_() {
                                // Handle common numeric types
                                &Type::INT2 | &Type::INT4 | &Type::INT8 | &Type::OID => {
                                    match row.try_get::<_, Option<i64>>(i) {
                                        Ok(Some(v)) => format!("{}", v),
                                        Ok(None) => "NULL".to_string(),
                                        Err(_) => format!("ERR:TYPE(int)"),
                                    }
                                }
                                &Type::FLOAT4 | &Type::FLOAT8 | &Type::NUMERIC => {
                                    match row.try_get::<_, Option<f64>>(i) {
                                        Ok(Some(v)) => format!("{}", v),
                                        Ok(None) => "NULL".to_string(),
                                        Err(_) => match row.try_get::<_, Option<String>>(i) {
                                            Ok(Some(s)) => s,
                                            Ok(None) => "NULL".to_string(),
                                            Err(_) => format!("ERR:TYPE(float/numeric)"),
                                        },
                                    }
                                }
                                // Handle boolean
                                &Type::BOOL => match row.try_get::<_, Option<bool>>(i) {
                                    Ok(Some(v)) => format!("{}", v),
                                    Ok(None) => "NULL".to_string(),
                                    Err(_) => format!("ERR:TYPE(bool)"),
                                },
                                // Handle common string types
                                &Type::TEXT | &Type::VARCHAR | &Type::NAME | &Type::UNKNOWN => {
                                    match row.try_get::<_, Option<String>>(i) {
                                        Ok(Some(v)) => v,
                                        Ok(None) => "NULL".to_string(),
                                        Err(_) => format!("ERR:TYPE(text)"),
                                    }
                                }
                                // Handle bytea (binary data)
                                &Type::BYTEA => match row.try_get::<_, Option<Vec<u8>>>(i) {
                                    Ok(Some(v)) => format!("[{} bytes]", v.len()),
                                    Ok(None) => "NULL".to_string(),
                                    Err(_) => format!("ERR:TYPE(bytea)"),
                                },
                                // Handle Date/Time types
                                &Type::DATE => {
                                    match row.try_get::<_, Option<chrono::NaiveDate>>(i) {
                                        Ok(Some(v)) => v.format("%Y-%m-%d").to_string(),
                                        Ok(None) => "NULL".to_string(),
                                        Err(_) => format!("ERR:TYPE(date)"),
                                    }
                                }
                                &Type::TIMESTAMP => {
                                    match row.try_get::<_, Option<chrono::NaiveDateTime>>(i) {
                                        Ok(Some(v)) => v.format("%Y-%m-%d %H:%M:%S%.f").to_string(),
                                        Ok(None) => "NULL".to_string(),
                                        Err(_) => format!("ERR:TYPE(timestamp)"),
                                    }
                                }
                                &Type::TIMESTAMPTZ => {
                                    match row.try_get::<_, Option<chrono::DateTime<chrono::Utc>>>(i)
                                    {
                                        Ok(Some(v)) => v.to_rfc3339(),
                                        Ok(None) => "NULL".to_string(),
                                        Err(_) => format!("ERR:TYPE(timestamptz)"),
                                    }
                                }
                                // Fallback for other types
                                _ => match row.try_get::<_, Option<String>>(i) {
                                    Ok(Some(v)) => v,
                                    Ok(None) => "NULL".to_string(),
                                    Err(_) => format!("ERR:TYPE({})", column.type_().name()),
                                },
                            }
                        })
                        .collect()
                })
                .collect();

            Ok(QueryResult {
                columns: column_names,
                rows,
            })
        }
        "mysql" => Err("MySQL query execution not implemented yet".into()),
        "sqlite" => Err("SQLite query execution not implemented yet".into()),
        _ => Err("Unsupported database type".into()),
    }
}
