"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { LogOut, Plus, Save, Trash2, UploadCloud, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "../../lib/supabase/client";

const OWNER_EMAIL = "mamalens000@gmail.com";
type PortfolioItem = {
  id: string; title: string; slug: string; item_type: string; category: string;
  excerpt: string; content: Record<string, unknown>; cover_image_url: string | null;
  external_url: string | null; media_url: string | null; media_type: string | null;
  published: boolean; featured: boolean; sort_order: number; published_at: string | null;
};
type SitePage = { slug: string; title: string; sections: unknown[]; updated_at: string };
const blankItem = (): Partial<PortfolioItem> => ({
  title:"", slug:"", item_type:"photograph", category:"Sports", excerpt:"",
  content:{}, cover_image_url:"", external_url:"", media_url:"", media_type:"image",
  published:false, featured:false, sort_order:0
});
const slugify = (s:string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

export default function StudioPage() {
  const [sessionUser,setSessionUser] = useState<{email?:string}|null>(null);
  const [email,setEmail] = useState(OWNER_EMAIL);
  const [password,setPassword] = useState("");
  const [items,setItems] = useState<PortfolioItem[]>([]);
  const [pages,setPages] = useState<SitePage[]>([]);
  const [activeTab,setActiveTab] = useState<"portfolio"|"pages"|"settings">("portfolio");
  const [siteSettings,setSiteSettings] = useState({ subscribeUrl:"", instagramUrl:"https://www.instagram.com/mama_lens0/", xUrl:"https://x.com/mama_lens", youtubeUrl:"https://www.youtube.com/" });
  const [selected,setSelected] = useState<Partial<PortfolioItem>|null>(null);
  const [pageSelected,setPageSelected] = useState<SitePage|null>(null);
  const [pageJson,setPageJson] = useState("[]");
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");

  const configured = Boolean(supabase);
  const client = supabase;

  const load = useCallback(async () => {
    if (!client) return;
    setBusy(true); setError("");
    const [itemResult,pageResult] = await Promise.all([
      client.from("portfolio_items").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false}),
      client.from("site_pages").select("*").order("slug",{ascending:true})
    ]);
    if(itemResult.error) setError(itemResult.error.message);
    else setItems((itemResult.data ?? []) as PortfolioItem[]);
    if(pageResult.error) setError(v=>v ? v+" · "+pageResult.error!.message : pageResult.error!.message);
    else {
      const loadedPages=(pageResult.data ?? []) as SitePage[];
      setPages(loadedPages);
      const settingsPage=loadedPages.find(page=>page.slug==="site-settings");
      const savedSettings=Array.isArray(settingsPage?.sections)?settingsPage.sections[0]:null;
      if(savedSettings&&typeof savedSettings==="object") setSiteSettings(old=>({...old,...savedSettings}));
    }
    setBusy(false);
  },[client]);

  useEffect(()=>{
    if(!client) return;
    let mounted=true;
    client.auth.getUser().then(({data})=>{
      if(!mounted) return;
      const user=data.user;
      if(user?.email?.toLowerCase()===OWNER_EMAIL) setSessionUser({email:user.email});
      else if(user) void client.auth.signOut();
    });
    const {data:{subscription}}=client.auth.onAuthStateChange((_event,session)=>{
      if(session?.user?.email?.toLowerCase()===OWNER_EMAIL) setSessionUser({email:session.user.email});
      else setSessionUser(null);
    });
    return ()=>{mounted=false;subscription.unsubscribe()};
  },[client]);

  useEffect(()=>{ if(sessionUser) void load(); },[sessionUser,load]);

  const signIn = async (event:FormEvent) => {
    event.preventDefault(); if(!client) return;
    setBusy(true);setError("");setMessage("");
    const {data,error:authError}=await client.auth.signInWithPassword({email:email.trim(),password});
    if(authError) setError(authError.message);
    else if(data.user?.email?.toLowerCase()!==OWNER_EMAIL){await client.auth.signOut();setError("This account is not authorized to manage MamaLens.");}
    else {setSessionUser({email:data.user.email});setPassword("");setMessage("Signed in securely.");}
    setBusy(false);
  };

  const upload = async (event:ChangeEvent<HTMLInputElement>) => {
    const file=event.target.files?.[0]; if(!file||!client||!selected) return;
    setBusy(true);setError("");setMessage("");
    const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");
    const path="portfolio/"+crypto.randomUUID()+"-"+safeName;
    const {error:uploadError}=await client.storage.from("mamalens-media").upload(path,file,{upsert:false,contentType:file.type||undefined});
    if(uploadError) setError(uploadError.message);
    else {
      const {data}=client.storage.from("mamalens-media").getPublicUrl(path);
      setSelected({...selected,media_url:data.publicUrl,media_type:file.type.startsWith("audio/")?"audio":file.type.startsWith("video/")?"video":"image",cover_image_url:file.type.startsWith("image/")?data.publicUrl:selected.cover_image_url});
      setMessage("Upload complete. Save the item to keep the URL.");
    }
    setBusy(false);event.target.value="";
  };

  const saveItem = async (event:FormEvent) => {
    event.preventDefault();if(!client||!selected)return;
    setBusy(true);setError("");setMessage("");
    const payload={...selected,title:(selected.title||"").trim(),slug:slugify(selected.slug||selected.title||""),updated_at:new Date().toISOString()};
    if(!payload.title||!payload.slug){setError("A title is required.");setBusy(false);return;}
    if(payload.published&&!payload.published_at) payload.published_at=new Date().toISOString();
    const result=payload.id
      ? await client.from("portfolio_items").update(payload).eq("id",payload.id).select().single()
      : await client.from("portfolio_items").insert(payload).select().single();
    if(result.error) setError(result.error.message);
    else {setMessage("Saved.");setSelected(result.data as PortfolioItem);await load();}
    setBusy(false);
  };

  const deleteItem = async (item:PortfolioItem) => {
    if(!client||!window.confirm(`Delete “${item.title}”? This cannot be undone.`))return;
    setBusy(true);const {error:deleteError}=await client.from("portfolio_items").delete().eq("id",item.id);
    if(deleteError)setError(deleteError.message);else{setItems(old=>old.filter(x=>x.id!==item.id));if(selected?.id===item.id)setSelected(null);setMessage("Item deleted.");}
    setBusy(false);
  };

  const saveSettings = async (event:FormEvent) => {
    event.preventDefault();if(!client)return;
    setBusy(true);setError("");setMessage("");
    const {data,error:saveError}=await client.from("site_pages").upsert({slug:"site-settings",title:"Site settings",sections:[siteSettings],updated_at:new Date().toISOString()},{onConflict:"slug"}).select().single();
    if(saveError)setError(saveError.message);else{setPages(old=>[...old.filter(p=>p.slug!=="site-settings"),data as SitePage].sort((a,b)=>a.slug.localeCompare(b.slug)));setMessage("Site settings saved. The public site will use the newsletter and social links.");}
    setBusy(false);
  };

  const savePage = async (event:FormEvent) => {
    event.preventDefault();if(!client||!pageSelected)return;
    let sections:unknown[];
    try { const parsed=JSON.parse(pageJson);if(!Array.isArray(parsed))throw new Error("Sections must be a JSON array.");sections=parsed; }
    catch(e){setError(e instanceof Error?e.message:"Invalid JSON.");return;}
    setBusy(true);setError("");setMessage("");
    const {data,error:saveError}=await client.from("site_pages").upsert({slug:pageSelected.slug,title:pageSelected.title,sections,updated_at:new Date().toISOString()},{onConflict:"slug"}).select().single();
    if(saveError)setError(saveError.message);else{setPageSelected(data as SitePage);setPages(old=>[...old.filter(p=>p.slug!==data.slug),data as SitePage].sort((a,b)=>a.slug.localeCompare(b.slug)));setMessage("Page layout saved.");}
    setBusy(false);
  };

  if(!configured) return <main className="studio-shell"><section className="studio-card"><p className="studio-eyebrow">MAMALENS / STUDIO</p><h1>Studio setup required</h1><p>Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the Vercel project environment, then redeploy.</p><a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer">Open Vercel settings <ExternalLink size={14}/></a></section></main>;

  if(!sessionUser) return <main className="studio-shell"><form className="studio-card studio-login" onSubmit={signIn}><a className="studio-back" href="/">← Back to MamaLens</a><p className="studio-eyebrow">PRIVATE OWNER ACCESS</p><h1>MamaLens Studio</h1><p>Sign in with the authorized owner account to manage portfolio content and page layouts.</p><label>Email<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<p className="studio-error" role="alert">{error}</p>}{message&&<p className="studio-success">{message}</p>}<button className="studio-primary" disabled={busy}>{busy?"Signing in…":"Sign in"}</button><p className="studio-footnote">Access is restricted to the site owner.</p></form></main>;

  return <main className="studio-app">
    <header className="studio-topbar"><a href="/" className="studio-brand">MamaLens <span>/ Studio</span></a><div className="studio-top-actions"><span>{sessionUser.email}</span><button onClick={()=>client?.auth.signOut()}><LogOut size={15}/> Sign out</button></div></header>
    <div className="studio-body"><aside className="studio-sidebar"><p className="studio-eyebrow">WORKSPACE</p><button className={activeTab==="portfolio"?"active":""} onClick={()=>{setActiveTab("portfolio");setSelected(null);}}>Portfolio & writing</button><button className={activeTab==="pages"?"active":""} onClick={()=>{setActiveTab("pages");setPageSelected(null);}}>Page layouts</button><button className={activeTab==="settings"?"active":""} onClick={()=>setActiveTab("settings")}>Site settings</button><a href="/" target="_blank" rel="noreferrer">View live site ↗</a></aside>
    <section className="studio-content"><div className="studio-heading"><div><p className="studio-eyebrow">CONTENT MANAGEMENT</p><h1>{activeTab==="portfolio"?"Portfolio & writing":activeTab==="pages"?"Page layouts":"Site settings"}</h1><p>{activeTab==="portfolio"?"Create, edit, publish, and organize your work.":activeTab==="pages"?"Edit structured page sections stored in Supabase.":"Manage the newsletter signup link and social profiles."}</p></div><button className="studio-quiet" onClick={()=>void load()} disabled={busy}><RefreshCw size={15}/> Refresh</button></div>
    {error&&<p className="studio-banner error" role="alert">{error}</p>}{message&&<p className="studio-banner success">{message}</p>}
    {activeTab==="portfolio"&&<div className="studio-columns"><div className="studio-list-panel"><div className="studio-list-head"><strong>{items.length} items</strong><button className="studio-primary compact" onClick={()=>{setSelected(blankItem());setMessage("");setError("");}}><Plus size={15}/> New item</button></div>{items.length===0&&<p className="studio-empty">No portfolio items yet. Add your first item.</p>}{items.map(item=><button key={item.id} className={"studio-item-row "+(selected?.id===item.id?"selected":"")} onClick={()=>{setSelected({...item});setMessage("");setError("");}}><span className="studio-item-thumb">{item.cover_image_url?<img src={item.cover_image_url} alt=""/>:"ML"}</span><span className="studio-item-copy"><strong>{item.title}</strong><small>{item.category} · {item.item_type}</small></span><span className={"studio-status "+(item.published?"published":"")}>{item.published?"Live":"Draft"}</span></button>)}</div>
    <div className="studio-editor-panel">{!selected?<div className="studio-empty large">Choose an item or create a new one to edit its details.</div>:<form onSubmit={saveItem} className="studio-form"><div className="studio-form-head"><h2>{selected.id?"Edit item":"New item"}</h2>{selected.id&&<button type="button" className="studio-danger-icon" title="Delete item" onClick={()=>void deleteItem(selected as PortfolioItem)}><Trash2 size={16}/></button>}</div>
      <label>Title<input value={selected.title||""} onChange={e=>setSelected({...selected,title:e.target.value,slug:selected.slug||slugify(e.target.value)})} required/></label>
      <div className="studio-two"><label>URL slug<input value={selected.slug||""} onChange={e=>setSelected({...selected,slug:slugify(e.target.value)})} required/></label><label>Type<select value={selected.item_type||"photograph"} onChange={e=>setSelected({...selected,item_type:e.target.value,media_type:e.target.value})}><option value="photograph">Photograph</option><option value="writing">Writing / article</option><option value="video">Video</option><option value="audio">Audio</option><option value="project">Project</option></select></label></div>
      <div className="studio-two"><label>Category<input value={selected.category||""} onChange={e=>setSelected({...selected,category:e.target.value})}/></label><label>Sort order<input type="number" value={selected.sort_order??0} onChange={e=>setSelected({...selected,sort_order:Number(e.target.value)})}/></label></div>
      <label>Summary / excerpt<textarea rows={3} value={selected.excerpt||""} onChange={e=>setSelected({...selected,excerpt:e.target.value})}/></label>
      <label>Cover image URL<input type="url" value={selected.cover_image_url||""} onChange={e=>setSelected({...selected,cover_image_url:e.target.value})} placeholder="https://…"/></label>
      <label>Media URL<input type="url" value={selected.media_url||""} onChange={e=>setSelected({...selected,media_url:e.target.value})} placeholder="Audio, video, or image URL"/></label>
      <label>External / article URL<input type="url" value={selected.external_url||""} onChange={e=>setSelected({...selected,external_url:e.target.value})} placeholder="https://…"/></label>
      <label className="studio-upload"><UploadCloud size={17}/> Upload image, audio, or video<input type="file" accept="image/*,audio/*,video/*" onChange={upload}/></label>
      {selected.media_type==="audio"&&selected.media_url&&<div className="studio-audio-preview"><audio controls preload="none" src={selected.media_url}/></div>}
      <div className="studio-toggles"><label><input type="checkbox" checked={Boolean(selected.featured)} onChange={e=>setSelected({...selected,featured:e.target.checked})}/> Featured</label><label><input type="checkbox" checked={Boolean(selected.published)} onChange={e=>setSelected({...selected,published:e.target.checked})}/> Published</label></div>
      <button className="studio-primary" disabled={busy}><Save size={15}/>{busy?"Saving…":"Save item"}</button>
      </form>}</div></div>}
    {activeTab==="settings"&&<form className="studio-editor-panel studio-form studio-settings-form" onSubmit={saveSettings}><h2>Homepage links</h2><p className="studio-footnote">Set the newsletter signup link and footer social profiles. To add songs, go to Portfolio & writing, create an Audio item, upload an audio file, and publish it.</p><label>Newsletter signup URL<input type="url" value={siteSettings.subscribeUrl} onChange={e=>setSiteSettings({...siteSettings,subscribeUrl:e.target.value})} placeholder="https://…"/></label><label>Instagram profile URL<input type="url" value={siteSettings.instagramUrl} onChange={e=>setSiteSettings({...siteSettings,instagramUrl:e.target.value})} placeholder="https://instagram.com/…"/></label><label>X profile URL<input type="url" value={siteSettings.xUrl} onChange={e=>setSiteSettings({...siteSettings,xUrl:e.target.value})} placeholder="https://x.com/…"/></label><label>YouTube channel URL<input type="url" value={siteSettings.youtubeUrl} onChange={e=>setSiteSettings({...siteSettings,youtubeUrl:e.target.value})} placeholder="https://youtube.com/…"/></label><button className="studio-primary" disabled={busy}><Save size={15}/>{busy?"Saving…":"Save site settings"}</button></form>}
    {activeTab==="pages"&&<div className="studio-page-layout"><div className="studio-list-panel"><div className="studio-list-head"><strong>Site pages</strong><button className="studio-primary compact" onClick={()=>{const p={slug:"new-page",title:"New page",sections:[],updated_at:""};setPageSelected(p);setPageJson("[]");}}>New page</button></div>{pages.map(page=><button key={page.slug} className={"studio-item-row "+(pageSelected?.slug===page.slug?"selected":"")} onClick={()=>{setPageSelected(page);setPageJson(JSON.stringify(page.sections??[],null,2));setError("");setMessage("");}}><span className="studio-item-copy"><strong>{page.title}</strong><small>/{page.slug}</small></span></button>)}</div>
    <form className="studio-editor-panel studio-form" onSubmit={savePage}>{!pageSelected?<div className="studio-empty large">Choose a page layout to edit.</div>:<><h2>Edit page layout</h2><label>Page title<input value={pageSelected.title} onChange={e=>setPageSelected({...pageSelected,title:e.target.value})} required/></label><label>Page slug<input value={pageSelected.slug} onChange={e=>setPageSelected({...pageSelected,slug:slugify(e.target.value)})} required/></label><label>Sections JSON<textarea className="studio-json" spellCheck={false} value={pageJson} onChange={e=>setPageJson(e.target.value)} rows={18}/></label><p className="studio-footnote">Sections are stored as JSON. Use an array of section objects so the public renderer can consume them.</p><button className="studio-primary" disabled={busy}><Save size={15}/> Save page layout</button></>}</form></div>}
    </section></div>
  </main>;
}
