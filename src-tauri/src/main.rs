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
        .invoke_handler(tauri::generate_handler![greet, test_database_connection]) // Add this line
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use native_tls::TlsConnector;
use postgres_native_tls::MakeTlsConnector;

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
