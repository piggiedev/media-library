# Local Media Sharing Library

A fast, lightweight, and beautiful local media sharing server built with **Bun**. It allows you to:
1. View, search, and stream your media files (MP4, WMV, etc.) from any device (like your phone) on your local Wi-Fi.
2. Upload files directly from your phone or tablet back to your Mac's media directory.
3. Stream video smoothly with support for HTTP range requests (partial content streaming).

## Prerequisites
- [Bun](https://bun.sh) installed on your Mac.

## Running the Server
To serve a specific directory (for example, `/path/to/media`), run:
```bash
bun run server.js /path/to/media
```

Alternatively, you can navigate to your media folder and run the server file from there:
```bash
cd /path/to/media
bun run /path/to/media-library/server.js
```

If no directory is specified, the server defaults to serving the current working directory (`process.cwd()`).

The server will start on port `8000` and output the local IP addresses you can visit on your phone's browser (e.g., `http://192.168.1.5:8000`).

