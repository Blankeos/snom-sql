# SnomSQL

This project is a small, keyboard-centric database GUI client built with SolidJS.

Created by [Carlo](https://github.com/blankeos) primarily for personal use, it aims to provide a usable experience similar to tools like TablePlus or Beekeeper Studio, though with a potentially smaller feature set.

Think of it as a lightweight and accessible alternative for exploring your db, but mostly made for keyboard nerds that like to breeze through the editor quickly.

**Technologies Used**:

- Tauri (Rust)
- SolidJS
- Vike (Filesystem Routing) - `vite build` will build static.
- TailwindCSS v4
- Extra things for DevX:
  - Prettier + prettier-plugin-tailwindcss
  - Bun - Faster package manager 🥳

## Getting Started

- `bun install` - installs all dependencies
- `bun tauri dev` - start the server

## Building for Production

- `bun tauri build`.
  - Installer is saved here: `./src-tauri/target/release/bundle/dmg/snom-sql_0.0.0_aarch64.dmg`
  - Binary is saved here: `./src-tauri/target/release/bundle/macos/snom-sql.app/Contents/MacOS/snom-sql` (You can run this without installing with `bun preview-mac`)
- `bun preview-mac` - Try the build on Mac.
- `bun preview-win` - Try the build on Windows.
- `bun preview-linux` - Try the build on Linux.
