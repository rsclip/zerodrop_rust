#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

extern crate clipboard;
extern crate rand_chacha;

mod commands;
mod password;
mod charset;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        commands::copy_text,
        commands::paste,
        commands::transformation::embed,
        commands::transformation::extract,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
