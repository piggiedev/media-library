import { readdir, stat, mkdir } from "fs/promises";
import { join, extname, resolve } from "path";
import os from "os";

const PORT = 8000;

// Get media directory from command line argument, or default to current working directory
const MEDIA_DIR = process.argv[2] ? resolve(process.argv[2]) : process.cwd();

// Ensure media directory exists
try {
  await mkdir(MEDIA_DIR, { recursive: true });
} catch (e) {}

// Bun serve configuration
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    
    // Serve home page
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(Bun.file(join(__dirname, "public", "index.html")));
    }
    
    // Serve API files
    if (url.pathname === "/api/files") {
      try {
        const files = await readdir(MEDIA_DIR, { withFileTypes: true });
        const fileList = [];
        
        for (const dirent of files) {
          if (dirent.isFile() && !dirent.name.startsWith(".")) {
            const filePath = join(MEDIA_DIR, dirent.name);
            let size = 0;
            let mtime = new Date();
            try {
              const fileStat = await stat(filePath);
              size = fileStat.size;
              mtime = fileStat.mtime;
            } catch (e) {}
            
            const ext = extname(dirent.name).toLowerCase();
            let type = "other";
            if ([".mp4", ".m4v", ".webm", ".ogg", ".mov", ".wmv", ".avi"].includes(ext)) {
              type = "video";
            } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
              type = "image";
            } else if ([".mp3", ".wav", ".m4a", ".flac"].includes(ext)) {
              type = "audio";
            }
            
            fileList.push({
              name: dirent.name,
              size,
              mtime,
              type,
              url: `/files/${encodeURIComponent(dirent.name)}`
            });
          }
        }
        
        // Sort by newest first
        fileList.sort((a, b) => b.mtime - a.mtime);
        
        return new Response(JSON.stringify(fileList), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    
    // Serve API upload
    if (url.pathname === "/api/upload" && req.method === "POST") {
      try {
        const formData = await req.formData();
        const file = formData.get("file");
        if (!file || typeof file === "string") {
          return new Response(JSON.stringify({ error: "No file provided" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        const filePath = join(MEDIA_DIR, file.name);
        await Bun.write(filePath, file);
        
        return new Response(JSON.stringify({ success: true, name: file.name }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    
    // Serve files from media directory
    if (url.pathname.startsWith("/files/")) {
      const decodedPath = decodeURIComponent(url.pathname.slice(7));
      // Security check to prevent directory traversal
      if (decodedPath.includes("..") || decodedPath.includes("/")) {
        return new Response("Forbidden", { status: 403 });
      }
      const filePath = join(MEDIA_DIR, decodedPath);
      const file = Bun.file(filePath);
      
      if (!(await file.exists())) {
        return new Response("File Not Found", { status: 404 });
      }
      
      // Bun handles ranges automatically for videos! This is fantastic for streaming.
      return new Response(file);
    }
    
    // Fallback: serve other files from public folder
    const publicFilePath = join(__dirname, "public", url.pathname);
    const publicFile = Bun.file(publicFilePath);
    if (await publicFile.exists()) {
      return new Response(publicFile);
    }
    
    return new Response("Not Found", { status: 404 });
  }
});

console.log(`====================================================`);
console.log(`Bun Media Library Server is running!`);
console.log(`Serving files from: ${MEDIA_DIR}`);
console.log(`====================================================`);
console.log(`Access on your Mac:`);
console.log(`  http://localhost:${PORT}`);
console.log(`\nAccess on your Phone (or other devices on Wi-Fi):`);

const nets = os.networkInterfaces();
let foundIP = false;
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === "IPv4" && !net.internal) {
      console.log(`  http://${net.address}:${PORT}`);
      foundIP = true;
    }
  }
}
if (!foundIP) {
  console.log(`  (Could not auto-detect local IP address. Check your system Wi-Fi settings.)`);
}
console.log(`====================================================`);
