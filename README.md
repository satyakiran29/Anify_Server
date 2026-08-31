# Anify Server & Cloud Relay

<div align="center">

[![Google Play](https://img.shields.io/badge/Google_Play-Anify%20App-414141?logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=com.skdev.anify)
[![Official Website](https://img.shields.io/badge/Website-anify.psatyakiran.in-8a4bf3?logo=google-chrome&logoColor=white)](https://anify.psatyakiran.in/)
[![SKDev Hub](https://img.shields.io/badge/Developer-SKDev%20Apps-00f2fe?logo=android&logoColor=black)](https://skdev.psatyakiran.in/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js Framework](https://img.shields.io/badge/framework-Express%20v4-lightgrey.svg?logo=express&logoColor=black)](https://expressjs.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-ws%20v8.18-orange.svg?logo=websocket&logoColor=white)](https://github.com/websockets/ws)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/satyakiran29/Anify_Server/pulls)

<p align="center">
  <b>High-performance REST API backend, interactive admin console, and global WebSocket Cloud Relay engine powering the official <a href="https://play.google.com/store/apps/details?id=com.skdev.anify">Anify Android Personalization App</a> and PC Companion.</b>
</p>

</div>

---

## 📖 Table of Contents

- [🔍 Overview & Purpose](#-overview--purpose)
- [🏗️ System Architecture](#️-system-architecture)
- [✨ Key Features & Capabilities](#-key-features--capabilities)
- [🌐 Anify Connect — WebSocket Cloud Relay](#-anify-connect--websocket-cloud-relay)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Server](#running-the-server)
  - [Running Tests](#running-tests)
- [🛠️ REST API Reference](#️-rest-api-reference)
  - [Authentication & Health Endpoints](#authentication--health-endpoints)
  - [Banner Endpoints (`/api/v1/banners`)](#banner-endpoints)
  - [Wallpaper Endpoints (`/api/v1/wallpapers`)](#wallpaper-endpoints)
  - [Live Wallpaper Endpoints (`/api/v1/livewalls`)](#live-wallpaper-endpoints)
  - [Ringtone Endpoints (`/api/v1/ringtones`)](#ringtone-endpoints)
  - [KWGT Widget Endpoints (`/api/v1/kwgts`)](#kwgt-widget-endpoints)
  - [Sticker Pack Endpoints (`/api/v1/stickers`)](#sticker-pack-endpoints)
  - [Cloud Relay Endpoints (`/api/v1/relay`)](#cloud-relay-endpoints)
- [🔄 Git Auto-Sync & Ephemeral Cloud Persistence](#-git-auto-sync--ephemeral-cloud-persistence)
- [🎭 Telegram Ingestion & WebP Media Pipeline](#-telegram-ingestion--webp-media-pipeline)
- [⏱️ Keep-Alive & Self-Healing Engine](#️-keep-alive--self-healing-engine)
- [📂 Project Directory Structure](#-project-directory-structure)
- [🚀 Deployment on Render & Cloud Platforms](#-deployment-on-render--cloud-platforms)
- [🤝 Contributing & Community](#-contributing--community)

---

## 🔍 Overview & Purpose

**Anify Server** is a unified content distribution engine, administration console, and low-latency cloud signaling relay built to power mobile personalization and device interoperability.

### The server delivers 6 core content modules:
1. 🖼️ **Static Wallpapers**: Ultra-HD wallpaper images with automatic dimension resolution and metadata extraction.
2. 🎬 **Live Wallpapers**: Video wallpapers (MP4/WebM) paired with instant thumbnail previews.
3. 🎵 **Audio Ringtones**: High-bitrate audio clips (MP3/WAV/AAC) with duration metrics.
4. 📱 **KWGT Widgets**: KWGT preset archive files (`.kwgt`) with bundled preview imagery.
5. 🎭 **Sticker Packs**: Telegram sticker pack catalog with automated metadata ingestion and WebM-to-WebP conversion.
6. 🎯 **Interactive Banners**: Home screen carousel banners with configurable call-to-actions, category shortcuts, custom URLs, and prioritization.

### In addition, it embeds **Anify Connect**:
- ⚡ **Global Cloud Relay**: Real-time bidirectional WebSocket relay connecting Android mobile devices to PC companion software across cellular networks (4G/5G), NATs, and firewalls without requiring port forwarding.

At the root URL (`http://localhost:3000/`), the server provides an **Explorer & Admin Dashboard** equipped with real-time media previews, audio players, video lightboxes, batch file uploading, resource management, and an interactive REST API testing suite.

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Clients["Clients & Interfaces"]
        Mobile["📱 Anify Android App"]
        PC["💻 PC Companion App"]
        Admin["🖥️ Admin Console Dashboard"]
    end

    subgraph Server["Anify Unified Server (Express v4 & ws)"]
        Router["REST Router: /api/v1"]
        RelayWS["⚡ WebSocket Cloud Relay Engine<br/>(/ws?room=CODE)"]
        AuthMid["Auth Middleware: SHA256 Token"]
        MediaEngine["Media Engine: ffmpeg-static & Multer"]
        AutoFetch["Telegram Ingestion Pipeline"]
        KeepAlive["Keep-Alive Health Ping Engine"]

        subgraph Storage["Zero-DB Flat-File Storage Engine"]
            WDB[("wallpapers.json")]
            LDB[("livewalls.json")]
            RDB[("ringtones.json")]
            KDB[("kwgts.json")]
            SDB[("stickers.json")]
            BDB[("banners.json")]
        end

        LocalAssets["Local Disk Assets<br/>(public/uploads & public/stickers)"]
    end

    subgraph External["External Cloud & Services"]
        GitHub[("GitHub Repository (Auto-Sync)")]
        CDN["Raw GitHub CDN (raw.githubusercontent.com)"]
        TelegramAPI["Telegram Bot API"]
    end

    Mobile <-->|"REST API Requests (/api/v1/*)"| Router
    Mobile <-->|"WebSocket Signaling & Control"| RelayWS
    PC <-->|"WebSocket Host Registration & Telemetry"| RelayWS
    Admin <-->|"Manage Assets & Uploads"| Router

    Router --> AuthMid
    AuthMid --> MediaEngine
    MediaEngine --> Storage
    MediaEngine --> LocalAssets
    AutoFetch <-->|"Query Sticker Metadata & Files"| TelegramAPI

    Storage --> SyncEngine{"Git Auto-Sync Engine"}
    LocalAssets --> SyncEngine
    SyncEngine -->|"Fetch, Reset & Push"| GitHub
    GitHub -.->|"High-Speed Asset Delivery"| CDN
    KeepAlive -.->|"Periodic Health Check"| Router
```

---

## ✨ Key Features & Capabilities

- **Zero-DB Simplicity**: No SQL database or MongoDB setup required. Uses lightweight JSON databases ([wallpapers.json](file:///h:/Github/Anify_Server/wallpapers.json), [livewalls.json](file:///h:/Github/Anify_Server/livewalls.json), [ringtones.json](file:///h:/Github/Anify_Server/ringtones.json), [kwgts.json](file:///h:/Github/Anify_Server/kwgts.json), [stickers.json](file:///h:/Github/Anify_Server/stickers.json), [banners.json](file:///h:/Github/Anify_Server/banners.json)) initialized and verified automatically on boot.
- **Global WebSocket Cloud Relay (`Anify Connect`)**: Built-in room-based WebSocket signaling server allowing mobile apps to pair with host PCs for zero-latency remote control, input forwarding, telemetry, and power actions across cellular networks and firewalls.
- **Dynamic Home Banners**: Full CRUD support for interactive carousel banners with customizable tags (`FEATURED`, `HOT`, `COMMUNITY`), click actions (`url`, `stickers`, `kwgt`, `creative_lab`), display ordering, and visibility toggles.
- **Automated Telegram Sticker Ingestion**: Provide any Telegram sticker pack link or slug (e.g., `https://t.me/addstickers/nekostickerpack120`), and the server automatically fetches sticker count, metadata, animated status, and converts media previews.
- **WebM-to-WebP Frame Extraction**: Leverages `ffmpeg-static` to convert animated video stickers (`.webm`) and static sticker frames into high-fidelity, lightweight `.webp` preview images on the fly.
- **Git Auto-Sync Persistence**: Solves ephemeral cloud filesystem constraints (Render, Railway, Heroku) by automatically staging, committing, and pushing updated JSON databases and newly uploaded media assets directly back to your GitHub repository.
- **CDN Asset Acceleration**: Converts local upload paths into permanent `raw.githubusercontent.com` URLs for zero-cost, high-speed static asset distribution.
- **Self-Healing Database Lifecycle**: Automatically deduplicates entries, generates deterministic MD5 IDs for legacy records, checks image dimensions, and bootstraps missing asset directories on startup.
- **Built-in Self-Ping / Keep-Alive**: Prevents free-tier hosting instances from sleeping by dispatching self-pings at regular intervals.
- **Glassmorphic Web Dashboard**: Complete browser-based management UI featuring audio players, video lightboxes, drag-and-drop uploaders, category filters, real-time metrics, and an interactive REST API console.

---

## 🌐 Anify Connect — WebSocket Cloud Relay

The server includes an integrated **WebSocket Cloud Relay Server** on the `/ws` endpoint (or standalone via `npm run relay`) enabling seamless mobile-to-PC connectivity without complex network configurations.

### Connection Protocol

```mermaid
sequenceDiagram
    autonumber
    actor PC as PC Companion (Host)
    participant Relay as Anify Cloud Relay (/ws)
    actor Phone as Anify Android App (Client)

    Note over PC,Relay: 1. Host Connects & Registers Room
    PC->>Relay: Connect: ws://host/ws?room=ABCD
    PC->>Relay: {"type": "REGISTER_HOST", "roomCode": "ABCD", "pin": "1234", "hostname": "Desktop-PC"}
    Relay-->>PC: {"type": "REGISTER_SUCCESS", "payload": {"roomCode": "ABCD"}}

    Note over Phone,Relay: 2. Mobile Client Joins & Authenticates
    Phone->>Relay: Connect: ws://host/ws?room=ABCD
    Phone->>Relay: {"type": "GLOBAL_AUTH", "roomCode": "ABCD", "pin": "1234"}
    Relay->>PC: Forwards Auth Packet to Host PC
    PC-->>Phone: {"type": "AUTH_SUCCESS", "payload": {"status": "authenticated"}}

    Note over Phone,PC: 3. Low-Latency Bidirectional Packet Forwarding
    Phone->>Relay: {"type": "INPUT_EVENT", "action": "MOUSE_MOVE", "dx": 10, "dy": -5}
    Relay->>PC: Forwarded to Host PC
    PC->>Relay: {"type": "TELEMETRY", "cpu": 24, "ram": 48, "temp": 52}
    Relay->>Phone: Forwarded to Paired Phone Clients
```

### Relay Message Types:
| Message Type | Direction | Payload Description |
| :--- | :--- | :--- |
| `REGISTER_HOST` | PC → Relay | Registers PC as the room host with `roomCode`, `pin`, and `hostname`. |
| `REGISTER_SUCCESS` | Relay → PC | Confirms room creation and active host status. |
| `GLOBAL_AUTH` / `JOIN_ROOM` | Phone → Relay | Authenticates phone client and requests room access. |
| `AUTH_FAILED` | Relay → Phone | Sent if target PC host is offline or room does not exist. |
| `HOST_DISCONNECTED` | Relay → Phone | Broadcast to connected phones when the PC host disconnects. |
| *Pass-Through Packets* | Bidirectional | Mouse, keyboard, media, volume, telemetry, and system power commands. |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (ES Modules enabled)
- **npm**: `v9.0.0` or higher
- **Git**: Installed and accessible in system `PATH` (required for `AUTO_GIT_SYNC=true`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/satyakiran29/Anify_Server.git
   cd Anify_Server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the root directory (or configure variables in your cloud hosting settings):

```env
PORT=3000
NODE_ENV=production
API_PREFIX=/api/v1
ADMIN_PASSWORD=your_admin_secret_password

# Git Auto-Sync Configuration (Recommended for Cloud Hosting)
AUTO_GIT_SYNC=true
GITHUB_TOKEN=ghp_yourPersonalAccessTokenWithRepoScope
GITHUB_REPO=satyakiran29/Anify_Server
GITHUB_BRANCH=main

# Telegram Ingestion Bot Token (Optional - fallback provided)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Cloud URL for Keep-Alive Ping (Optional)
RENDER_EXTERNAL_URL=https://anify-server.onrender.com

# Optional Standalone Relay Port
RELAY_PORT=8080
```

#### Environment Variables Reference

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP & WebSocket server port. | `3000` |
| `NODE_ENV` | Environment mode (`development` or `production`). | `production` |
| `API_PREFIX` | Base prefix for all REST API endpoints. | `/api/v1` |
| `ADMIN_PASSWORD` | Passcode for admin authentication token generation. | `admin123` |
| `AUTO_GIT_SYNC` | Automatically commit and push database changes to GitHub. | `true` |
| `GITHUB_TOKEN` | GitHub Personal Access Token (PAT) with write repository permissions. | *None* |
| `GITHUB_REPO` | Target GitHub repository (`username/repository`). | `satyakiran29/Anify_Server` |
| `GITHUB_BRANCH` | Target branch for commits and pushes. | `main` |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token for fetching sticker sets. | *Embedded Token* |
| `RENDER_EXTERNAL_URL` | Host URL for keep-alive pings to prevent cloud sleep. | *None* |
| `RELAY_PORT` | Port for standalone cloud relay script (`relay-server.js`). | `8080` |

---

### Running the Server

#### Development Mode (with hot reloading)
```bash
npm run dev
```

#### Production Mode (Unified API & WebSocket Relay)
```bash
npm start
```

#### Standalone Cloud Relay Server
```bash
npm run relay
```

Upon boot, the server logs startup endpoints and service status:
```text
===================================================
 ✨ Anify Server & Cloud Relay is active!
 Port: 3000
 Environment: production
 API Endpoint: http://localhost:3000/api/v1/wallpapers
 Banners API: http://localhost:3000/api/v1/banners
 Stickers API: http://localhost:3000/api/v1/stickers
 Relay Stats: http://localhost:3000/api/v1/relay/stats
 WebSocket Relay: ws://localhost:3000/ws?room=<ROOM_CODE>
 Explorer Dashboard: http://localhost:3000
===================================================
```

---

### Running Tests

Execute the automated test suite using Node's native test runner:

```bash
# Run core API lifecycle tests
npm test

# Run all test suites (API, Banners, Stickers, Relay, WebP conversion)
node --test test/*.test.js
```

---

## 🛠️ REST API Reference

All REST endpoints are prefixed with `/api/v1` (configurable via `API_PREFIX`).

### Authentication & Health Endpoints

#### 1. Top-Level Health Check
- **Endpoint**: `GET /health`
- **Access**: Public
- **Response**:
  ```json
  {
    "status": "online",
    "service": "Anify Unified API & Cloud Relay",
    "uptimeSeconds": 1420,
    "relay": {
      "activeRooms": 3,
      "totalConnections": 6,
      "uptimeSeconds": 1420,
      "timestamp": "2026-08-31T16:00:00.000Z"
    },
    "timestamp": "2026-08-31T16:00:00.000Z"
  }
  ```

#### 2. Admin Login
- **Endpoint**: `POST /api/v1/wallpapers/auth/login`
- **Request Body**:
  ```json
  {
    "password": "your_configured_admin_password"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Login successful.",
    "data": {
      "token": "7297e682e0b5a328574adad3cf97e20d..."
    }
  }
  ```

#### 3. Protected Request Authorization
Pass the returned token in the `Authorization` header for all write operations (`POST`, `PUT`, `DELETE`):
```text
Authorization: Bearer <token>
```

---

### Banner Endpoints

**Base Path**: `/api/v1/banners`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Public | Returns active banners ordered by priority. Pass `?all=true` for admin view including inactive banners. |
| **GET** | `/:id` | Public | Returns details of a specific banner by ID. |
| **POST** | `/` | Admin | Create a new banner. Supports multipart file upload (`image`) or image URL (`imageUrl`/`url`), `title`, `subtitle`, `tag`, `actionType`, `actionValue`, `order`, `active`. |
| **PUT** | `/:id` | Admin | Update banner fields, change order/tag/actions, or replace the banner image. |
| **DELETE** | `/:id` | Admin | Delete banner and clean up associated local image files. |

#### Example Response (`GET /api/v1/banners`):
```json
{
  "status": "success",
  "results": 4,
  "data": {
    "banners": [
      {
        "id": "b3-stickers-studio",
        "title": "Sticker Studio",
        "subtitle": "Convert Telegram & custom packs for WhatsApp in seconds",
        "imageUrl": "https://raw.githubusercontent.com/satyakiran29/Anify_Server/main/public/uploads/banner-stickers.png",
        "tag": "⚡ STICKERS",
        "actionType": "stickers",
        "actionValue": "",
        "active": true,
        "order": 1,
        "createdAt": "2026-08-19T08:47:47.479Z"
      }
    ]
  }
}
```

---

### Wallpaper Endpoints

**Base Path**: `/api/v1/wallpapers`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Public | Paginated wallpaper list. Query parameters: `page`, `limit` (pass `0` for all), `search`, `category`, `sort` (e.g. `sort=name`). |
| **GET** | `/random` | Public | Returns random wallpapers. Query parameters: `limit` (default: 1), `category`. |
| **GET** | `/categories` | Public | Returns unique categories with total wallpaper counts per category. |
| **GET** | `/stats` | Public | Returns database counts, category totals, and server uptime. |
| **GET** | `/:id` | Public | Returns single wallpaper metadata by ID. |
| **POST** | `/` | Admin | Upload up to 50 wallpapers (`image` multipart form field) or register an external image URL. |
| **PUT** | `/:id` | Admin | Update wallpaper title, category, author, or replace image file. |
| **DELETE** | `/:id` | Admin | Remove wallpaper and clean up associated disk file. |

---

### Live Wallpaper Endpoints

**Base Path**: `/api/v1/livewalls`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Public | Paginated live video wallpapers. Query parameters: `page`, `limit`, `search`, `category`, `sort`. |
| **GET** | `/random` | Public | Returns random live wallpapers. Query parameters: `limit`, `category`. |
| **GET** | `/categories` | Public | Returns unique live wallpaper categories and counts. |
| **GET** | `/stats` | Public | Returns live wallpaper metrics and server uptime. |
| **GET** | `/:id` | Public | Returns specific live wallpaper details by ID. |
| **POST** | `/` | Admin | Upload live video (`video` field) and preview thumbnail (`thumbnail` field) or submit URLs. |
| **PUT** | `/:id` | Admin | Update live wallpaper fields and replace video or thumbnail. |
| **DELETE** | `/:id` | Admin | Delete live wallpaper entry and associated disk assets. |

---

### Ringtone Endpoints

**Base Path**: `/api/v1/ringtones`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Public | Paginated list of audio ringtones. Query parameters: `page`, `limit`, `search`, `sort`. |
| **GET** | `/random` | Public | Returns random ringtones. Query parameter: `limit`. |
| **GET** | `/stats` | Public | Returns total ringtones and database metrics. |
| **GET** | `/:id` | Public | Returns details of a single ringtone. |
| **POST** | `/` | Admin | Upload up to 50 audio tracks (`audio` multipart field) or register an external audio URL. |
| **PUT** | `/:id` | Admin | Update ringtone metadata and duration properties. |
| **DELETE** | `/:id` | Admin | Remove ringtone and delete local audio file. |

---

### KWGT Widget Endpoints

**Base Path**: `/api/v1/kwgts`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Public | Paginated list of KWGT widgets. Query parameters: `page`, `limit`, `search`, `category`, `sort`. |
| **GET** | `/random` | Public | Returns random KWGT presets. Query parameters: `limit`, `category`. |
| **GET** | `/categories` | Public | Returns KWGT category list and counts. |
| **GET** | `/stats` | Public | Returns KWGT database metrics. |
| **GET** | `/:id` | Public | Returns details of a specific KWGT widget. |
| **POST** | `/` | Admin | Upload `.kwgt` files (`file` field) and preview image (`thumbnail` field). |
| **PUT** | `/:id` | Admin | Update KWGT entry and replace file or thumbnail. |
| **DELETE** | `/:id` | Admin | Remove KWGT preset and delete associated files from disk. |

---

### Sticker Pack Endpoints

**Base Path**: `/api/v1/stickers`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Public | Paginated sticker pack list. Query parameters: `page`, `limit`, `search`, `category`, `sort` (`name`, `category`, `downloads`, `rating`). |
| **GET** | `/random` | Public | Returns random sticker packs. Query parameters: `limit`, `category`. |
| **GET** | `/categories` | Public | Returns categories, item counts, and category thumbnail icons. |
| **GET** | `/stats` | Public | Returns total packs (990+), total stickers, categories, and download metrics. |
| **GET** | `/:id` | Public | Lookup a sticker pack by unique ID or slug identifier (e.g. `nekostickerpack120`). |
| **POST** | `/auto-fetch` | Public/Admin | Automatically queries Telegram Bot API for pack details, sticker counts, and generates converted `.webp` previews. |
| **POST** | `/` | Admin | Create a new sticker pack. Automatically converts preview links to `.webp` frames and computes sticker counts. |
| **PUT** | `/:id` | Admin | Update sticker pack metadata, tags, preview array, rating, or downloads. |
| **DELETE** | `/:id` | Admin | Remove sticker pack and delete local converted sticker files. |

#### Auto-Fetch Telegram Sticker Pack (`POST /api/v1/stickers/auto-fetch`):
**Request Body**:
```json
{
  "packNameOrUrl": "https://t.me/addstickers/nekostickerpack120"
}
```
**Response**:
```json
{
  "status": "success",
  "data": {
    "name": "Neko Pack 120",
    "identifier": "nekostickerpack120",
    "telegramUrl": "https://t.me/addstickers/nekostickerpack120",
    "totalStickers": 30,
    "animated": false,
    "thumbnail": "https://raw.githubusercontent.com/satyakiran29/Anify_Server/main/public/stickers/nekostickerpack120/thumbnail.webp",
    "previews": [
      "https://raw.githubusercontent.com/satyakiran29/Anify_Server/main/public/stickers/nekostickerpack120/preview_0.webp",
      "https://raw.githubusercontent.com/satyakiran29/Anify_Server/main/public/stickers/nekostickerpack120/preview_1.webp"
    ]
  }
}
```

---

### Cloud Relay Endpoints

**Base Path**: `/api/v1/relay`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/stats` | Public | Returns active room count, connected WebSocket client count, uptime, and timestamp. |
| **GET** | `/health` | Public | Quick health check endpoint for relay monitoring. |

---

## 🔄 Git Auto-Sync & Ephemeral Cloud Persistence

Hosting platforms such as Render, Railway, and Heroku use ephemeral container filesystems where changes written to local disk are wiped on container restart. The **Git Auto-Sync Engine** solves this by treating your GitHub repository as the permanent persistence layer.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin / API User
    participant Server as Express Server
    participant Git as Local Git Synchronizer
    participant GitHub as Remote GitHub Repository

    Admin->>Server: Uploads media / modifies JSON database
    Note over Server: Saves asset to disk<br/>Updates target .json file
    Server->>Git: Invokes triggerGitSync(commitMessage)
    Git->>GitHub: Fetches upstream (git fetch origin main)
    Git->>Git: Soft resets to remote HEAD (git reset FETCH_HEAD)
    Git->>Git: Stages *.json, public/uploads, public/stickers
    Git->>Git: Commits changes locally
    Git->>GitHub: Pushes changes to remote branch
    Note over GitHub: Changes and media permanently preserved!
    Server-->>Admin: Returns 200/201 response with raw CDN URL
```

- **Execution Queue**: Serializes sync operations to avoid concurrent Git lock file conflicts.
- **Dynamic Git Auth**: Injects `GITHUB_TOKEN` into repository push URLs on the fly without exposing credentials in git config.
- **GitHub Raw CDN**: Transforms local paths (`/uploads/file.jpg`) into permanent `https://raw.githubusercontent.com/{repo}/{branch}/public/{path}` links.

---

## 🎭 Telegram Ingestion & WebP Media Pipeline

Telegram hosts static and animated stickers in `.webp`, `.tgs` (lottie), and `.webm` formats. To deliver instant loading across mobile clients:

1. **Bot Ingestion**: Interfaces with Telegram Bot API (`getStickerSet`, `getFile`) using the configured bot token.
2. **WebM & Video Frame Extraction**: Runs `ffmpeg-static` to capture keyframe snapshots from video stickers.
3. **Format Standardization**: Normalizes preview images into optimized `.webp` files under `public/stickers/{slug}/`.
4. **Preview Generation**: Generates multi-frame preview arrays and compact pack thumbnails automatically.

---

## ⏱️ Keep-Alive & Self-Healing Engine

### Keep-Alive Mechanism
Free-tier cloud web instances spin down after 15 minutes of inactivity. Anify Server maintains continuous availability through dual mechanisms:
1. **Internal Health Pings**: If `RENDER_EXTERNAL_URL` is set, `src/server.js` automatically dispatches self-pings every 10 minutes to `/api/v1/wallpapers/stats`.
2. **Companion Cron Job**: [render.yaml](file:///h:/Github/Anify_Server/render.yaml) defines a scheduled cron worker executing [src/scripts/keepAlive.js](file:///h:/Github/Anify_Server/src/scripts/keepAlive.js) every 13 minutes.

### Self-Healing Database Lifecycle
On server bootstrap, database managers ([db.js](file:///h:/Github/Anify_Server/src/utils/db.js), [liveDb.js](file:///h:/Github/Anify_Server/src/utils/liveDb.js), [ringtoneDb.js](file:///h:/Github/Anify_Server/src/utils/ringtoneDb.js), [kwgtDb.js](file:///h:/Github/Anify_Server/src/utils/kwgtDb.js), [stickerDb.js](file:///h:/Github/Anify_Server/src/utils/stickerDb.js), [bannerDb.js](file:///h:/Github/Anify_Server/src/utils/bannerDb.js)):
- Create missing database `.json` files with empty array defaults.
- Clean corrupted entries and purge duplicate items.
- Generate deterministic MD5 hashes for records missing unique identifiers.
- Ensure required storage directories (`public/uploads`, `public/stickers`) exist on disk.

---

## 📂 Project Directory Structure

```text
Anify_Server/
├── public/                     # Static web dashboard & media assets
│   ├── index.html              # Admin Console & Explorer UI
│   ├── app.js                  # Frontend interactive client application
│   ├── style.css               # Glassmorphic UI stylesheet
│   ├── stickers/               # Converted .webp sticker pack previews
│   └── uploads/                # Uploaded wallpapers, videos, ringtones, kwgts
├── src/
│   ├── controllers/            # REST API route controllers
│   │   ├── bannerController.js    # Home banners CRUD handler
│   │   ├── kwgtController.js      # KWGT widgets handler
│   │   ├── livewallController.js  # Live video wallpapers handler
│   │   ├── relayController.js     # Cloud relay stats & health handler
│   │   ├── ringtoneController.js  # Audio ringtones handler
│   │   ├── stickerController.js   # Telegram stickers & auto-fetch handler
│   │   └── wallpaperController.js # Static wallpapers & auth handler
│   ├── middleware/             # Express middlewares
│   │   ├── auth.js                # SHA256 admin token verification
│   │   ├── errorHandler.js        # Centralized error & 404 handlers
│   │   ├── upload.js              # Multer wallpaper & banner uploader
│   │   ├── uploadKwgt.js          # Multer KWGT uploader
│   │   ├── uploadLive.js          # Multer live video/thumb uploader
│   │   └── uploadRingtone.js      # Multer audio ringtone uploader
│   ├── routes/                 # Express API routes
│   │   ├── bannerRoutes.js        # /api/v1/banners
│   │   ├── kwgtRoutes.js          # /api/v1/kwgts
│   │   ├── livewallRoutes.js      # /api/v1/livewalls
│   │   ├── relayRoutes.js         # /api/v1/relay
│   │   ├── ringtoneRoutes.js      # /api/v1/ringtones
│   │   ├── stickerRoutes.js       # /api/v1/stickers
│   │   └── wallpaperRoutes.js     # /api/v1/wallpapers
│   ├── scripts/                # Standalone & background cron scripts
│   │   └── keepAlive.js           # External health ping runner
│   ├── utils/                  # Core helpers & flat-file database engines
│   │   ├── bannerDb.js            # Banners database utility
│   │   ├── db.js                  # Wallpapers database utility
│   │   ├── gitSync.js             # Git auto-commit & push synchronizer
│   │   ├── kwgtDb.js              # KWGT presets database utility
│   │   ├── liveDb.js              # Live wallpapers database utility
│   │   ├── relayServer.js         # WebSocket Cloud Relay server logic
│   │   ├── ringtoneDb.js          # Audio ringtones database utility
│   │   ├── stickerConverter.js    # ffmpeg WebM-to-WebP frame extractor
│   │   └── stickerDb.js           # Stickers database utility
│   └── server.js               # Application bootstrap & unified server entry
├── test/                       # Node.js native test suites
│   ├── admin_delete.test.js    # Admin deletion tests
│   ├── api.test.js             # API core lifecycle tests
│   ├── banner.test.js          # Banners CRUD & ordering tests
│   ├── relay.test.js           # WebSocket cloud relay connection tests
│   ├── sticker.test.js         # Sticker database lookup tests
│   ├── sticker_routes.test.js  # Sticker routes & pagination tests
│   ├── test_ffmpeg.js          # ffmpeg binary validation
│   └── test_webp_conversion.js # WebP frame conversion tests
├── add_widgets.js              # Batch KWGT import utility
├── banners.json                # JSON database for Home & Promo Banners
├── kwgts.json                  # JSON database for KWGT Presets
├── livewalls.json              # JSON database for Live Wallpapers
├── package.json                # Project dependencies & npm scripts
├── relay-server.js             # Standalone Anify Connect Relay Server
├── render.yaml                 # Render cloud deployment blueprint
├── ringtones.json              # JSON database for Audio Ringtones
├── stickers.json               # JSON database for Telegram Sticker Packs
└── wallpapers.json             # JSON database for Static Wallpapers
```

---

## 🚀 Deployment on Render & Cloud Platforms

The repository includes a production-ready **Render Blueprint** configuration in [render.yaml](file:///h:/Github/Anify_Server/render.yaml).

### Steps to Deploy:
1. Fork or push this repository to your GitHub account.
2. Sign in to [Render](https://render.com/) and navigate to **Blueprints**.
3. Select your repository and deploy the blueprint.
4. Set the following environment secrets in your Render Web Service dashboard:
   - `ADMIN_PASSWORD` — Passcode for admin authentication.
   - `GITHUB_TOKEN` — Personal Access Token with repository write permissions.
   - `TELEGRAM_BOT_TOKEN` *(Optional)* — Custom Telegram bot token.

```mermaid
flowchart TD
    Dev[Developer] -->|"git push origin main"| GitHub(GitHub Repository)

    subgraph Render["Render Cloud Platform"]
        GitHub -->|"Webhook Trigger"| WebService["Anify Web Service (anify-server)"]
        WebService -->|"Build & Start"| Run["npm install && npm start"]
        CronJob["Keep-Alive Cron (anify-keep-alive)"] -->|"Ping every 13m"| WebService
    end
```

---

## 🤝 Contributing & Community

Contributions, suggestions, and feature requests are always welcome!

1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

<div align="center">

### 🌐 Official Ecosystem Links

<p>
  <a href="https://play.google.com/store/apps/details?id=com.skdev.anify"><b>📱 Google Play Store</b></a> &nbsp;•&nbsp;
  <a href="https://anify.psatyakiran.in/"><b>🌐 Anify Official Website</b></a> &nbsp;•&nbsp;
  <a href="https://skdev.psatyakiran.in/"><b>🚀 SKDev Developer Hub</b></a> &nbsp;•&nbsp;
  <a href="https://psatyakiran.in/"><b>👨‍💻 Satyakiran Portfolio</b></a> &nbsp;•&nbsp;
  <a href="https://t.me/skdev29"><b>📢 Telegram Community</b></a>
</p>

<sub>Built with ❤️ by <a href="https://github.com/satyakiran29">Satyakiran</a>. Licensed under the <a href="LICENSE">MIT License</a>.</sub>

</div>
