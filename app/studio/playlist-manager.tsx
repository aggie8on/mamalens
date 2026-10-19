"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Plus, Save, Trash2, UploadCloud, Music2 } from "lucide-react";
import { supabase } from "../../lib/supabase/client";

type Track = { id: string; title: string; url: string; description: string; published: boolean };
type PlaylistData = { title: string; description: string; tracks: Track[] };
const blankTrack = (): Track => ({ id: crypto.randomUUID(), title: "", url: "", description: "", published: true });
const emptyPlaylist: PlaylistData = { title: "What I'm listening to", description: "A playlist of what I'm listening to lately.", tracks: [] };

export default function PlaylistManager() {
  const [playlist, setPlaylist] = useState<PlaylistData>(emptyPlaylist);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const client = supabase;

  useEffect(() => {
    if (!client) return;
    let active = true;
    void (async () => {
      const { data, error: loadError } = await client.from("site_pages").select("sections").eq("slug", "playlist").maybeSingle();
      if (!active) return;
      if (loadError) { setError(loadError.message); return; }
      const saved = Array.isArray(data?.sections) ? data.sections[0] as Partial<PlaylistData> | undefined : undefined;
      if (saved && Array.isArray(saved.tracks)) {
        setPlaylist({ title: saved.title || emptyPlaylist.title, description: saved.description || "", tracks: saved.tracks.map(track => ({ id: track.id || crypto.randomUUID(), title: track.title || "", url: track.url || "", description: track.description || "", published: track.published !== false })) });
        return;
      }
      // Preserve any audio uploads made before the dedicated playlist editor existed.
      const { data: oldTracks } = await client.from("portfolio_items").select("id,title,media_url,excerpt,published").eq("item_type", "audio").order("sort_order", { ascending: true });
      if (!active || !oldTracks?.length) return;
      setPlaylist({ ...emptyPlaylist, tracks: oldTracks.map(track => ({ id: track.id, title: track.title || "", url: track.media_url || "", description: track.excerpt || "", published: track.published === true })) });
    })();
    return () => { active = false; };
  }, [client]);

  const updateTrack = (id: string, patch: Partial<Track>) => setPlaylist(current => ({ ...current, tracks: current.tracks.map(track => track.id === id ? { ...track, ...patch } : track) }));

  const upload = async (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !client) return;
    if (!file.type.startsWith("audio/")) { setError("Please choose an audio file for a playlist track."); event.target.value = ""; return; }
    setBusy(true); setError(""); setMessage("");
    const path = "playlist/" + crypto.randomUUID() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const { error: uploadError } = await client.storage.from("mamalens-media").upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) setError(uploadError.message);
    else {
      const { data } = client.storage.from("mamalens-media").getPublicUrl(path);
      updateTrack(id, { url: data.publicUrl });
      setMessage("Audio uploaded. Save playlist to publish the changes.");
    }
    setBusy(false); event.target.value = "";
  };

  const save = async () => {
    if (!client) return;
    if (playlist.tracks.some(track => !track.title.trim() || !track.url.trim())) { setError("Each track needs a title and an audio URL or uploaded file."); return; }
    setBusy(true); setError(""); setMessage("");
    const sections = [{ ...playlist, tracks: playlist.tracks.map(track => ({ ...track, title: track.title.trim(), description: track.description.trim() })) }];
    const { error: saveError } = await client.from("site_pages").upsert({ slug: "playlist", title: "Listening playlist", sections, updated_at: new Date().toISOString() }, { onConflict: "slug" });
    if (saveError) setError(saveError.message);
    else setMessage("Playlist saved. Published tracks will appear in the listening player on the homepage.");
    setBusy(false);
  };

  return <section className="playlist-manager">
    <div className="playlist-manager-heading"><div><span className="studio-eyebrow">LISTENING PLAYLIST</span><h2>What I'm listening to</h2><p>Manage the tracks shown in the homepage player. Upload audio or paste a direct audio-file URL; tracks are not blog posts.</p></div><button className="studio-primary" onClick={() => { setPlaylist(current => ({ ...current, tracks: [...current.tracks, blankTrack()] })); setMessage(""); setError(""); }}><Plus size={15}/> Add track</button></div>
    {error && <p className="studio-banner error" role="alert">{error}</p>}{message && <p className="studio-banner success" role="status">{message}</p>}
    <label className="playlist-title-field">Playlist heading<input value={playlist.title} onChange={event => setPlaylist(current => ({ ...current, title: event.target.value }))}/></label>
    <label className="playlist-title-field">Description<input value={playlist.description} onChange={event => setPlaylist(current => ({ ...current, description: event.target.value }))}/></label>
    {!playlist.tracks.length && <div className="studio-empty large"><Music2 size={22}/><p>No tracks yet. Add a track and upload an audio file or paste its URL.</p></div>}
    <div className="playlist-track-list">{playlist.tracks.map((track, index) => <article className="playlist-track-editor" key={track.id}>
      <div className="playlist-track-top"><span className="playlist-track-number">{String(index + 1).padStart(2, "0")}</span><strong>Playlist track</strong><button type="button" className="studio-danger-icon" aria-label={"Remove track " + (index + 1)} onClick={() => setPlaylist(current => ({ ...current, tracks: current.tracks.filter(item => item.id !== track.id) }))}><Trash2 size={15}/></button></div>
      <label>Track title<input value={track.title} onChange={event => updateTrack(track.id, { title: event.target.value })} placeholder="Track name" required/></label>
      <label>Audio file URL<input type="url" value={track.url} onChange={event => updateTrack(track.id, { url: event.target.value })} placeholder="https://…"/></label>
      <label className="studio-upload"><UploadCloud size={17}/> Upload audio file<input type="file" accept="audio/*" disabled={busy} onChange={event => void upload(track.id, event)}/></label>
      <label>Track note (optional)<input value={track.description} onChange={event => updateTrack(track.id, { description: event.target.value })} placeholder="Optional note"/></label>
      <div className="studio-toggles"><label><input type="checkbox" checked={track.published} onChange={event => updateTrack(track.id, { published: event.target.checked })}/> Include in playlist</label></div>
      {track.url && <audio className="playlist-track-preview" controls preload="none" src={track.url}/>}
    </article>)}</div>
    <button className="studio-primary" onClick={() => void save()} disabled={busy}><Save size={15}/>{busy ? "Saving…" : "Save playlist"}</button>
  </section>;
}
