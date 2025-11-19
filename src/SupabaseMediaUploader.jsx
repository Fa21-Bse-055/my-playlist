import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase env
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL and ANON KEY are required. Check your .env file.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function SupabaseMediaUploader() {
  const [files, setFiles] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchPlaylist();
  }, []);

  async function fetchPlaylist() {
    try {
      const { data, error } = await supabase
        .from("playlist")
        .select("id, name, url, type, uploaded_at")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setPlaylist(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch playlist.");
    }
  }

  function handleFileChange(e) {
    setFiles(Array.from(e.target.files || []));
  }

  async function uploadFileToSupabase(file) {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `uploads/${Date.now()}-${cleanName}`;

      const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from("media").getPublicUrl(path);
      const publicUrl = publicData.publicUrl;

      const { error: insertError } = await supabase.from("playlist").insert({
        name: file.name,
        url: publicUrl,
        type: file.type,
      });
      if (insertError) throw insertError;

      return publicUrl;
    } catch (err) {
      console.error(err);
      alert(`Failed to upload ${file.name}`);
      return null;
    }
  }

  async function uploadAll() {
    if (!files.length) return alert("Select files first.");
    setUploading(true);
    setProgress(0);

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const url = await uploadFileToSupabase(f);
      if (!url) break;
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    await fetchPlaylist();
    setFiles([]);
    setUploading(false);
  }

  function playItem(item) {
    setCurrent(item);
    setIsPlaying(false);

    if (item.type.startsWith("video")) {
      audioRef.current?.pause();
      setTimeout(() => videoRef.current?.play(), 50);
      return;
    }

    // audio
    setTimeout(() => {
      audioRef.current.src = item.url;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }, 50);
  }

  function togglePlayPause() {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (audioEl.paused) {
      audioEl.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      audioEl.pause();
      setIsPlaying(false);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "28px auto", padding: 16, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1 style={{ fontFamily: "'Great Vibes', cursive", fontSize: 36, color: "#ffd56b", marginBottom: 12 }}>Your Romantic Playlist</h1>

      {/* Upload */}
      <div style={{ marginBottom: 18, background: "rgba(255,255,255,0.04)", padding: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" accept="audio/*,video/*" multiple onChange={handleFileChange} />
          <button onClick={uploadAll} disabled={uploading || !files.length} style={{ padding: "8px 12px", background: "linear-gradient(90deg,#ffd56b,#ffb84d)", border: "none", borderRadius: 10, cursor: "pointer" }}>
            {uploading ? `Uploading ${progress}%` : "Upload Selected"}
          </button>
          <button onClick={() => setFiles([])} disabled={uploading || !files.length} style={{ padding: "8px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "#fff", borderRadius: 10 }}>
            Clear
          </button>
        </div>
      </div>

      {/* Playlist & Player */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18 }}>
        {/* Playlist */}
        <div style={{ background: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 style={{ marginTop: 0, color: "#fff3fc" }}>Playlist</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {playlist.length === 0 && <div style={{ color: "#ffebf7" }}>No media yet.</div>}
            {playlist.map(item => (
              <div key={item.id} onClick={() => playItem(item)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 10, cursor: "pointer", background: current?.id === item.id ? "linear-gradient(90deg,#ffe6a8, #ffd9c4)" : "transparent" }}>
                <div>
                  <div style={{ fontWeight: 700, color: current?.id === item.id ? "#2c002e" : "#fff3fc" }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{new Date(item.uploaded_at).toLocaleString()}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: "linear-gradient(90deg,#ff9ec9,#ffb6d5)", color: "#2c002e", cursor: "pointer" }}>Play</button>
                  <a href={item.url} target="_blank" rel="noreferrer" style={{ padding: "6px 10px", background: "#fff3fc", borderRadius: 8, textDecoration: "none", color: "#2c002e" }}>Open</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player */}
        <div style={{ background: "linear-gradient(135deg,#ffd56b,#ffb6d5)", padding: 16, borderRadius: 14, boxShadow: "0 12px 38px rgba(0,0,0,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#2c002e" }}>{current ? current.name : "Nothing playing"}</div>
              <div style={{ fontSize: 12, color: "#3b002b" }}>{current ? new Date(current.uploaded_at).toLocaleString() : "Select a track to play"}</div>
            </div>
            {/* Heartbeat play/pause button */}
            <div>
              <button onClick={togglePlayPause} aria-label="play-pause" className={`heart-btn ${isPlaying ? "playing" : ""}`} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                <span className="heart">❤</span>
              </button>
            </div>
          </div>

          {/* Hidden audio/video */}
          <audio ref={audioRef} controls style={{ width: "100%", marginTop: 14, display: "block", background: "transparent" }} />
          <video ref={videoRef} controls style={{ width: "100%", marginTop: 14, borderRadius: 8, display: "none" }} />
        </div>
      </div>
    </div>
  );
}
