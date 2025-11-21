import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase URL and ANON KEY are required.");

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function injectStyles() {
  if (document.getElementById("romantic-effects")) return;

  const style = document.createElement("style");
  style.id = "romantic-effects";
  style.textContent = `
    :root {
      --bg-black: #0b000b;
      --red-dark: #b30000;
      --pink-light: #ff9fc1;
      --soft-white: #ffe0f0;
      --gradient-btn: linear-gradient(90deg, #b30000, #ff9fc1);
    }

    body {
      margin:0;
      font-family:'Poppins',sans-serif;
      background: var(--bg-black);
      color: var(--soft-white);
      overflow-x:hidden;
      position:relative;
    }

    .enhanced-container {
      display:flex;
      flex-direction:column;
      min-height:100vh;
      position:relative;
      z-index:1;
    }

    header {
      text-align:center;
      font-family:'Great Vibes',cursive;
      font-size:2.4rem;
      padding:20px;
      color: var(--red-dark);
      text-shadow:0 4px 16px rgba(255,159,193,0.4);
      animation: bounceHeader 4s ease-in-out infinite;
      z-index:2;
      position:relative;
    }

    @keyframes bounceHeader {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
    }

    .main-space {
      flex:1;
      padding:24px;
      position:relative;
      z-index:2;
      display:flex;
      flex-direction:column;
      gap:20px;
    }

    .card {
      background: rgba(36,0,10,0.6);
      border-radius:24px;
      padding:18px;
      box-shadow:0 8px 24px rgba(179,0,0,0.5);
      position:relative;
    }

    .section-title { font-size:1.5rem; color: var(--pink-light); margin-bottom:16px; text-align:center; }

    .playlist-container {
      max-height:400px; /* limit height for scrolling */
      overflow-y:auto;
      padding-right:8px; /* avoid scrollbar overlap */
    }

    .playlist-item {
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:10px 0;
      border-bottom:1px solid rgba(255, 159, 193, 0.2);
      position:relative;
    }

    .playlist-name {
      flex:1 1 auto;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
      margin-right:12px;
      word-break: break-word;
    }

    .playlist-actions {
      flex:0 0 auto;
      display:flex;
      gap:8px;
    }

   .playlist-actions button {
  width:40px;
  height:40px;
  padding:0;
  font-size:1.1rem;
  flex-shrink:0;
  border:none;
  border-radius:50%;
  background: var(--gradient-btn);
  color:#0b000b;
  box-shadow:0 4px 16px rgba(255,159,193,0.5);
  cursor:pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.playlist-actions button:hover {
  transform: scale(1.1);
  box-shadow:0 6px 24px rgba(255,159,193,0.7);
}

    .media-player-box {
      margin-top:24px;
      padding:20px;
      background: rgba(36,0,10,0.7);
      border-radius:28px;
      text-align:center;
      backdrop-filter:blur(6px);
      box-shadow:0 0 24px rgba(255,159,193,0.5);
      position:relative;
    }

    .media-player-box h3 { margin-bottom:12px; color: var(--red-dark); word-break: break-word; }

    .media-player { width:100%; border-radius:14px; outline:none; }

    .btn { cursor:pointer; border:none; border-radius:14px; padding:12px 20px; font-weight:700; font-size:1rem; }
    .btn-primary { background: var(--gradient-btn); color:#0b000b; box-shadow:0 6px 24px rgba(255,159,193,0.4); transition: transform 0.2s; }
    .btn-primary:hover { transform: scale(1.05); }

    .bottom-nav {
      display:flex;
      justify-content:space-around;
      background: rgba(36,0,10,0.85);
      padding:16px 0;
      border-top:1px solid rgba(255,159,193,0.3);
      position:relative;
      z-index:2;
    }
    .nav-btn {
      flex:1;
      text-align:center;
      font-weight:bold;
      font-size:1.2rem;
      padding:12px 0;
      border-radius:16px;
      color: var(--soft-white);
      background: rgba(179,0,0,0.4);
      margin:0 6px;
      transition: all 0.25s;
    }
    .nav-btn:hover { background: rgba(255,159,193,0.5); transform: scale(1.05); }
    .nav-active { background: var(--gradient-btn); color:#0b000b; }

    /* sparkles & petals */
    .sparkles, .petals { position:fixed; left:0; right:0; top:0; bottom:0; pointer-events:none; z-index:0; }
    .sparkle { width:6px; height:6px; border-radius:50%; background: radial-gradient(circle,#ff9fc1,#b30000); opacity:0.8; animation: rise 3s linear infinite; }
    .petal { font-size:18px; opacity:0.9; animation: petalRise linear infinite; color:#ff9fc1; }
    @keyframes rise { 0% { transform: translateY(100vh) scale(0.2); opacity:0; } 50% { opacity:0.8; } 100% { transform: translateY(-50px) scale(1); opacity:0; } }
    @keyframes petalRise { 0% { transform: translateY(100vh) rotate(0deg); opacity:0; } 50% { opacity:0.9; } 100% { transform: translateY(-100px) rotate(360deg); opacity:0; } }

    .modal-wrap { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.75); z-index:9999; }
    .modal-card { background: rgba(36,0,10,0.9); padding:22px; border-radius:22px; text-align:center; box-shadow:0 8px 30px rgba(179,0,0,0.6); }
    .modal-card .modal-title { font-size:1.3rem; font-weight:700; margin-bottom:12px; color:var(--red-dark); }
    .modal-card .modal-name { margin-bottom:16px; color: var(--pink-light); word-break: break-word; }
    .modal-card .modal-row button { margin:0 8px; padding:10px 18px; border:none; border-radius:16px; font-weight:700; cursor:pointer; transition:all 0.25s; }
    .btn-cancel { background: rgba(179,0,0,0.5); color:#ffe0f0; }
    .btn-delete { background: var(--gradient-btn); color:#0b000b; }

    /* mobile responsiveness */
    @media(max-width:768px){
      header { font-size:2rem; padding:16px; }
      .section-title { font-size:1.3rem; }
      .playlist-actions button { width:36px; height:36px; font-size:1rem; }
      .btn { padding:10px 16px; font-size:0.9rem; }
      .nav-btn { font-size:1rem; padding:10px 0; }
      .playlist-container { max-height:300px; }
    }
  `;
  document.head.appendChild(style);
}

function spawnAnimations() {
  const sparkleContainer = document.createElement("div");
  sparkleContainer.className = "sparkles";
  document.body.appendChild(sparkleContainer);

  const petalContainer = document.createElement("div");
  petalContainer.className = "petals";
  document.body.appendChild(petalContainer);

  for (let i = 0; i < 25; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.style.left = `${Math.random() * 100}%`;
    s.style.width = `${4 + Math.random() * 6}px`;
    s.style.height = s.style.width;
    s.style.animationDuration = `${2 + Math.random() * 3}s`;
    sparkleContainer.appendChild(s);
  }

  for (let i = 0; i < 15; i++) {
    const p = document.createElement("div");
    p.className = "petal";
    p.textContent = "🌸";
    p.style.left = `${Math.random() * 100}%`;
    p.style.fontSize = `${12 + Math.random() * 18}px`;
    p.style.animationDuration = `${4 + Math.random() * 4}s`;
    petalContainer.appendChild(p);
  }
}

export default function EnhancedMediaUI() {
  const [view, setView] = useState("playlist");
  const [files, setFiles] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => { fetchPlaylist(); injectStyles(); spawnAnimations(); }, []);

  async function fetchPlaylist() {
    const { data } = await supabase.from("playlist").select("id,name,url,type,path,uploaded_at").order("uploaded_at", { ascending: false });
    setPlaylist(data || []);
  }

  async function uploadFile(file) {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `uploads/${Date.now()}-${cleanName}`;
    await supabase.storage.from("media").upload(path, file);
    const { data: publicData } = supabase.storage.from("media").getPublicUrl(path);
    await supabase.from("playlist").insert({ name: file.name, url: publicData.publicUrl, type: file.type, path });
  }

  async function uploadAll() {
    if (!files.length) return alert("Select files first.");
    setUploading(true); setProgress(0);
    for (let i = 0; i < files.length; i++) { await uploadFile(files[i]); setProgress(Math.round(((i+1)/files.length)*100)); }
    fetchPlaylist(); setFiles([]); setUploading(false); setView("playlist");
  }

  async function deleteItem(item) {
    if (!item) return;
    if (item.path) await supabase.storage.from("media").remove([item.path]);
    await supabase.from("playlist").delete().eq("id", item.id);
    if (current?.id === item.id) setCurrent(null);
    fetchPlaylist();
  }

  const togglePlay = (item) => {
    if (current?.id === item.id) { audioRef.current.pause(); setCurrent(null); }
    else { setCurrent(item); setTimeout(()=>audioRef.current?.play(),100); }
  };

  return (
    <div className="enhanced-container">
      <header>H ❤ H — Forever</header>

      <main className="main-space">
        {view==="playlist" && <div className="card">
          <h2 className="section-title">Your Media</h2>
          <div className="playlist-container">
            {playlist.map(item=>(
              <div key={item.id} className="playlist-item">
                <div className="playlist-name">{item.name}</div>
<div className="playlist-actions">
  <button onClick={() => togglePlay(item)} className="play-btn">
    {current?.id === item.id ? (
      // Pause icon (two vertical bars)
      <svg viewBox="-2 0 28 20" fill="#830a0aff" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="4" width="4" height="16" rx="1"/>
        <rect x="15" y="4" width="4" height="16" rx="1"/>
      </svg>
    ) : (
      // Play icon (triangle)
      <svg viewBox="-2 0 28 20" fill="#830a0aff" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5v14l11-7z"/>
      </svg>
    )}
  </button>

  <button className="delete-btn" onClick={() => setConfirmDelete(item)}>
    {/* Heart-shaped delete icon */}
    <svg viewBox="-2 0 28 20" fill="#830a0aff" xmlns="http://www.w3.org/2000/svg">
    <line x1="4" y1="4" x2="20" y2="20" stroke="#830a0aff" strokeWidth="2" strokeLinecap="round"/>
    <line x1="20" y1="4" x2="4" y2="20" stroke="#830a0aff" strokeWidth="2" strokeLinecap="round"/>
  </svg>
  </button>
</div>



              </div>
            ))}
          </div>
          {current && <div className="media-player-box">
            <h3>Now Playing: {current.name}</h3>
            <audio ref={audioRef} src={current.url} controls autoPlay className="media-player" />
          </div>}
        </div>}

        {view==="upload" && <div className="card">
          <h2 className="section-title">Upload Media</h2>
          <input type="file" accept="audio/*" multiple onChange={e=>setFiles([...e.target.files])}/>
          <button className="btn btn-primary" onClick={uploadAll} disabled={uploading}>{uploading?`Uploading ${progress}%`:"Upload Selected"}</button>
        </div>}
      </main>

      <nav className="bottom-nav">
        <button className={`nav-btn ${view==="playlist"?"nav-active":""}`} onClick={()=>setView("playlist")}>Playlist</button>
        <button className={`nav-btn ${view==="upload"?"nav-active":""}`} onClick={()=>setView("upload")}>Upload</button>
      </nav>

      {confirmDelete && <div className="modal-wrap">
        <div className="modal-card">
          <div className="modal-title">Delete this media?</div>
          <div className="modal-name">{confirmDelete.name}</div>
          <div className="modal-row">
            <button className="btn-cancel" onClick={()=>setConfirmDelete(null)}>Cancel</button>
            <button className="btn-delete" onClick={()=>{ deleteItem(confirmDelete); setConfirmDelete(null); }}>Delete</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
