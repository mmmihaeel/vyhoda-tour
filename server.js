const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = path.resolve(__dirname);
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".cjs": "application/javascript",
    ".map": "application/json",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".markdown": "text/markdown",
    ".csv": "text/csv",
    ".tsv": "text/tab-separated-values",
    ".json": "application/json",
    ".yaml": "application/x-yaml",
    ".yml": "application/x-yaml",
    ".ini": "text/plain",
    ".log": "text/plain",
    ".vtt": "text/vtt",
    ".srt": "text/plain",
    ".xml": "application/xml",
    ".xsl": "application/xml",
    ".xsd": "application/xml",
    ".rss": "application/rss+xml",
    ".atom": "application/atom+xml",
    ".svg": "image/svg+xml",
    ".apng": "image/apng",
    ".avif": "image/avif",
    ".bmp": "image/bmp",
    ".gif": "image/gif",
    ".heic": "image/heic",
    ".heif": "image/heif",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".webp": "image/webp",
    ".dds": "image/vnd.ms-dds",
    ".ktx": "image/ktx",
    ".ktx2": "image/ktx2",
    ".hdr": "image/vnd.radiance",
    ".aac": "audio/aac",
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
    ".mp3": "audio/mpeg",
    ".ogg": "audio/ogg",
    ".oga": "audio/ogg",
    ".opus": "audio/opus",
    ".wav": "audio/wav",
    ".weba": "audio/webm",
    ".mp4": "video/mp4",
    ".m4v": "video/x-m4v",
    ".mpeg": "video/mpeg",
    ".mpg": "video/mpeg",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".ogv": "video/ogg",
    ".mkv": "video/x-matroska",
    ".ts": "video/mp2t",
    ".m3u8": "application/vnd.apple.mpegurl",
    ".mpd": "application/dash+xml",
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
    ".usdz": "model/vnd.usdz+zip",
    ".obj": "text/plain",
    ".mtl": "text/plain",
    ".fbx": "application/octet-stream",
    ".stl": "model/stl",
    ".dae": "model/vnd.collada+xml",
    ".3ds": "application/octet-stream",
    ".ply": "application/octet-stream",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".eot": "application/vnd.ms-fontobject",
    ".pdf": "application/pdf",
    ".rtf": "application/rtf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".zip": "application/zip",
    ".tar": "application/x-tar",
    ".gz": "application/gzip",
    ".bz": "application/x-bzip",
    ".bz2": "application/x-bzip2",
    ".7z": "application/x-7z-compressed",
    ".rar": "application/vnd.rar",
    ".bin": "application/octet-stream",
    ".data": "application/octet-stream",
    ".wasm": "application/wasm",
    ".webmanifest": "application/manifest+json",
    ".manifest": "text/cache-manifest",
};

try {
    const extra = fs.readFileSync(path.join(ROOT, "mime-extra.json"), "utf8");
    Object.assign(MIME, JSON.parse(extra));
} catch (_) {
    /* ok if missing */
}

const LANDING = "/boykivske-mynule.html";

function createReqLogger(req, res) {
    const start = process.hrtime.bigint();
    const ip = (req.headers['x-forwarded-for']?.split(',')[0].trim()) || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';
    const ref = req.headers['referer'] || req.headers['referrer'] || '';
    const rng = req.headers['range'] || '';
    let bytes = 0;

    const _write = res.write;
    const _end = res.end;
    res.write = function (chunk, ...args) {
        if (chunk) bytes += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);
        return _write.call(this, chunk, ...args);
    };
    res.end = function (chunk, ...args) {
        if (chunk) bytes += chunk ? (Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk)) : 0;
        return _end.call(this, chunk, ...args);
    };

    req._logExtra = {};

    res.on('finish', () => {
        const durMs = Number((process.hrtime.bigint() - start) / 1000000n);
        console.log(JSON.stringify({
            time: new Date().toISOString(),
            http: `HTTP/${req.httpVersion}`,
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration_ms: durMs,
            bytes,
            ip,
            referer: ref,
            ua,
            range: rng,
            content_type: res.getHeader('content-type') || null,
            content_range: res.getHeader('content-range') || null,
            cache: res.getHeader('cache-control') || null,
            etag: res.getHeader('etag') || null,
            location: res.getHeader('location') || null,
            ...req._logExtra
        }));
    });
}

function logExtra(req, kv) { req._logExtra = Object.assign(req._logExtra || {}, kv); }

process.on('uncaughtException', err => console.error('[uncaughtException]', err?.stack || err));
process.on('unhandledRejection', err => console.error('[unhandledRejection]', err?.stack || err));

function redirect(res, location, status = 302) {
    res.writeHead(status, { Location: location });
    res.end();
}

function contentTypeFor(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let type = MIME[ext] || "application/octet-stream";
    if (
        type.startsWith("text/") ||
        /^(application\/(json|xml|x-yaml|dash\+xml|rss\+xml|atom\+xml|manifest\+json)|image\/svg\+xml)$/.test(
            type
        ) ||
        type === "application/javascript"
    ) {
        if (!/;\s*charset=/i.test(type)) type += "; charset=utf-8";
    }
    return type;
}

function etag(stat) {
    return `"${stat.size.toString(16)}-${Number(stat.mtimeMs).toString(16)}"`;
}

function isRangeReq(req) {
    return req.headers.range && /^bytes=\d*-\d*$/.test(req.headers.range);
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(n, max));
}

function send404(res) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
}

function send403(res) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden");
}

function setCommonHeaders(res, filePath, stat) {
    res.setHeader("Content-Type", contentTypeFor(filePath));
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Last-Modified", stat.mtime.toUTCString());
    res.setHeader("ETag", etag(stat));
    res.setHeader("X-Content-Type-Options", "nosniff");
}

function serveFile(req, res, filePath, stat) {
    logExtra(req, { file: path.relative(ROOT, filePath), file_size: stat.size });
    setCommonHeaders(res, filePath, stat);

    const inm = req.headers["if-none-match"];
    const ims = req.headers["if-modified-since"];
    if ((inm && inm === etag(stat)) || (ims && new Date(ims) >= stat.mtime)) {
        res.writeHead(304);
        res.end();
        return;
    }

    if (isRangeReq(req)) {
        const [startStr, endStr] = req.headers.range
            .replace(/bytes=/, "")
            .split("-");
        const start = startStr ? parseInt(startStr, 10) : 0;
        const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
        const s = clamp(start, 0, stat.size - 1);
        const e = clamp(end, s, stat.size - 1);
        const chunkSize = e - s + 1;

        res.writeHead(206, {
            "Content-Range": `bytes ${s}-${e}/${stat.size}`,
            "Content-Length": chunkSize,
            "Content-Type": contentTypeFor(filePath)
        });
        fs.createReadStream(filePath, { start: s, end: e }).pipe(res);
        return;
    }

    res.writeHead(200, { "Content-Length": stat.size, "Content-Type": contentTypeFor(filePath) });
    fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
    createReqLogger(req, res);
    try {
        if (req.url === "/health") {
            res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("ok");
            return;
        }

        const u = new URL(req.url, `http://${req.headers.host}`);
        let rel = decodeURIComponent(u.pathname);

        const p = rel.toLowerCase();
        const isRootLike =
            p === "/" ||
            p === "" ||
            p === "/index" ||
            p === "/index.html" ||
            p === "/index.htm" ||
            p === "/default.html" ||
            p === "/home";

        if (isRootLike) {
            return redirect(res, `${LANDING}${u.search || ""}`, 302);
        }

        const unsafe = path.normalize(rel).replace(/^(\.\.[\/\\])+/, "");
        const abs = path.join(ROOT, unsafe);

        if (!abs.startsWith(ROOT)) {
            return send403(res);
        }

        fs.stat(abs, (err, stat) => {
            if (err) {
                if (err.code === "ENOENT") {
                    const candidate = abs.endsWith(path.sep) ? abs : abs + path.sep;
                    const indexPath = path.join(candidate, "index.html");
                    fs.stat(indexPath, (e2, st2) => {
                        if (!e2 && st2.isFile()) return serveFile(req, res, indexPath, st2);
                        return redirect(res, `${LANDING}${u.search || ''}`, 302);
                    });
                } else {
                    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
                    res.end("500 Internal Server Error");
                }
                return;
            }

            if (stat.isDirectory()) {
                const indexPath = path.join(abs, "index.html");
                fs.stat(indexPath, (e2, st2) => {
                    if (!e2 && st2.isFile()) return serveFile(req, res, indexPath, st2);
                    return redirect(res, `${LANDING}${u.search || ''}`, 302);
                });
                return;
            }

            if (stat.isFile()) {
                return serveFile(req, res, abs, stat);
            }

            send404(res);
        });
    } catch (e) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("500 Internal Server Error");
    }
});

server.listen(PORT, () => {
    console.log(`krpano tour @ http://localhost:${PORT}  (root: ${ROOT})`);
});
