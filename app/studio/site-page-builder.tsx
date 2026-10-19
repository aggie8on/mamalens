"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase/client";

type SectionType = "intro" | "text" | "image" | "projects" | "articles" | "videos" | "links";
type Layout = "stack" | "split" | "wide" | "compact";
type Section = {
  id: string; type: SectionType; title: string; eyebrow: string; text: string;
  body: string; image: string; visible: boolean; layout: Layout;
};
type Page = { slug: string; title: string; sections: Section[]; updated_at?: string };

const pageDefaults: Page[] = [
  { slug: "home", title: "Home", sections: [
    { id: "home-intro", type: "intro", title: "MamaLens", eyebrow: "Photography & stories", text: "Stories, people, and moments seen through MamaLens.", body: "Photography, creative work, and profiles celebrating the people shaping culture.", image: "", visible: true, layout: "split" },
    { id: "home-work", type: "projects", title: "Selected work", eyebrow: "", text: "", body: "", image: "", visible: true, layout: "wide" },
    { id: "home-writing", type: "articles", title: "Writing", eyebrow: "", text: "", body: "", image: "", visible: true, layout: "stack" },
  ] },
  { slug: "work", title: "Work", sections: [{ id: "work-intro", type: "intro", title: "Work", eyebrow: "Selected work", text: "Photography and creative projects.", body: "", image: "", visible: true, layout: "stack" }] },
  { slug: "about", title: "About", sections: [{ id: "about-intro", type: "intro", title: "About MamaLens", eyebrow: "", text: "", body: "The stories, people, and approach behind MamaLens.", image: "", visible: true, layout: "split" }, { id: "about-videos", type: "videos", title: "Images & videos of MamaLens", eyebrow: "", text: "", body: "", image: "", visible: true, layout: "wide" }] },
  { slug: "writing", title: "Writing", sections: [{ id: "writing-intro", type: "intro", title: "Writing", eyebrow: "Articles & blogs", text: "Stories, interviews, and articles from MamaLens.", body: "", image: "", visible: true, layout: "stack" }] },
  { slug: "contact", title: "Contact", sections: [{ id: "contact-intro", type: "intro", title: "Contact", eyebrow: "", text: "Get in touch with MamaLens.", body: "", image: "", visible: true, layout: "stack" }] },
];
const sectionOptions: { type: SectionType; label: string }[] = [
  { type: "intro", label: "Introduction" }, { type: "text", label: "Text content" },
  { type: "image", label: "Image" }, { type: "projects", label: "Work / projects list" },
  { type: "articles", label: "Articles / blogs list" }, { type: "videos", label: "Images / videos gallery" },
  { type: "links", label: "Links" },
];
const layouts: Layout[] = ["stack", "split", "wide", "compact"];
const normalize = (value: unknown, fallback: Section[]): Section[] => {
  if (!Array.isArray(value)) return fallback;
  return value.filter((x): x is Record<string, unknown> => !!x && typeof x === "object").map((x, i) => ({
    id: typeof x.id === "string" ? x.id : `section-${i + 1}`,
    type: (["intro", "text", "image", "projects", "articles", "videos", "links"].includes(String(x.type)) ? x.type : "text") as SectionType,
    title: typeof x.title === "string" ? x.title : "",
    eyebrow: typeof x.eyebrow === "string" ? x.eyebrow : "",
    text: typeof x.text === "string" ? x.text : "",
    body: typeof x.body === "string" ? x.body : "",
    image: typeof x.image === "string" ? x.image : "",
    visible: x.visible !== false,
    layout: (layouts.includes(x.layout as Layout) ? x.layout : "stack") as Layout,
  }));
};
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function SitePageBuilder() {
  const [pages, setPages] = useState<Page[]>(pageDefaults);
  const [pageSlug, setPageSlug] = useState("home");
  const [selectedId, setSelectedId] = useState("home-intro");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!supabase) { setError("Supabase is not configured."); setLoading(false); return; }
    setLoading(true); setError("");
    const { data, error: loadError } = await supabase.from("site_pages").select("slug,title,sections,updated_at").neq("slug", "site-settings").order("slug");
    if (loadError) setError(loadError.message);
    else if (data) {
      const rows = data as { slug: string; title: string; sections: unknown; updated_at?: string }[];
      setPages(current => {
        const merged = new Map(current.map(page => [page.slug, page]));
        for (const row of rows) {
          const fallback = pageDefaults.find(page => page.slug === row.slug)?.sections ?? [];
          const normalized = normalize(row.sections, fallback);\n          if (row.slug === "about" && !normalized.some(section => section.type === "videos")) normalized.push({ id: "about-videos", type: "videos", title: "Images & videos of MamaLens", eyebrow: "", text: "", body: "", image: "", visible: true, layout: "wide" });\n          merged.set(row.slug, { slug: row.slug, title: row.title || row.slug, sections: normalized, updated_at: row.updated_at });
        }
        return [...merged.values()].sort((a, b) => a.slug.localeCompare(b.slug));
      });
    }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const page = pages.find(item => item.slug === pageSlug) ?? pages[0];
  const selected = page?.sections.find(section => section.id === selectedId) ?? page?.sections[0];
  const visible = useMemo(() => page?.sections.filter(section => section.visible) ?? [], [page]);
  const updatePage = (patch: Partial<Page>) => setPages(current => current.map(item => item.slug === pageSlug ? { ...item, ...patch } : item));
  const updateSection = (patch: Partial<Section>) => {
    if (!selected) return;
    updatePage({ sections: page.sections.map(section => section.id === selected.id ? { ...section, ...patch } : section) });
  };
  const addSection = (type: SectionType) => {
    const section: Section = { id: `${type}-${Date.now().toString(36)}`, type, title: sectionOptions.find(item => item.type === type)?.label ?? "New section", eyebrow: "", text: "", body: "", image: "", visible: true, layout: "stack" };
    updatePage({ sections: [...(page?.sections ?? []), section] });
    setSelectedId(section.id); setNotice(""); setError("");
  };
  const moveSection = (index: number, direction: -1 | 1) => {
    const next = [...page.sections]; const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updatePage({ sections: next });
  };
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selected || !supabase) return;
    if (!file.type.startsWith("image/")) { setError("Choose an image file."); event.target.value = ""; return; }
    if (file.size > 10 * 1024 * 1024) { setError("Choose an image under 10 MB."); event.target.value = ""; return; }
    setNotice("Uploading image…"); setError("");
    const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `page-builder/${crypto.randomUUID()}-${name}`;
    const { error: uploadError } = await supabase.storage.from("mamalens-media").upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) setError(uploadError.message);
    else {
      const { data } = supabase.storage.from("mamalens-media").getPublicUrl(path);
      updateSection({ image: data.publicUrl }); setNotice("Image uploaded. Save the page to publish the change.");
    }
    event.target.value = "";
  };
  const savePage = async () => {
    if (!supabase || !page) return;
    if (!page.title.trim() || !page.slug.trim()) { setError("Page title and URL slug are required."); return; }
    setSaving(true); setError(""); setNotice("");
    const payload = { slug: page.slug, title: page.title.trim(), sections: page.sections, updated_at: new Date().toISOString() };
    const { error: saveError } = await supabase.from("site_pages").upsert(payload, { onConflict: "slug" });
    if (saveError) setError(saveError.message);
    else { setNotice("Page saved."); await load(); }
    setSaving(false);
  };
  const createPage = () => {
    const base = { slug: "new-page", title: "New page", sections: [{ id: "new-intro", type: "intro" as SectionType, title: "New page", eyebrow: "", text: "", body: "", image: "", visible: true, layout: "stack" as Layout }] };
    const slug = pages.some(item => item.slug === base.slug) ? `new-page-${pages.length + 1}` : base.slug;
    const next = { ...base, slug };
    setPages(current => [...current, next]); setPageSlug(slug); setSelectedId("new-intro"); setNotice("New draft page. Save it to create the page record."); setError("");
  };

  if (loading) return <div className="spb-loading">Opening visual page builder…</div>;
  if (!page) return <div className="spb-loading">No pages available. <button type="button" onClick={createPage}>Create a page</button></div>;

  return <div className="spb">
    <div className="spb-toolbar">
      <div><span className="spb-kicker">VISUAL EDITOR</span><h2>Page builder</h2><p>Arrange page sections, edit content, and preview your layout before saving.</p></div>
      <div className="spb-toolbar-actions"><button type="button" className="spb-secondary" onClick={createPage}><Plus size={15}/> New page</button><button type="button" className="spb-save" onClick={() => void savePage()} disabled={saving}><Save size={15}/>{saving ? "Saving…" : "Save page"}</button></div>
    </div>
    <div className="spb-page-tabs">{pages.map(item => <button type="button" key={item.slug} className={pageSlug === item.slug ? "active" : ""} onClick={() => { setPageSlug(item.slug); setSelectedId(item.sections[0]?.id ?? ""); setNotice(""); setError(""); }}>{item.title || item.slug}</button>)}</div>
    {error && <p className="spb-notice error" role="alert">{error}</p>}{notice && <p className="spb-notice">{notice}</p>}
    <div className="spb-workspace">
      <aside className="spb-sections">
        <div className="spb-page-meta"><div className="spb-panel-title"><strong>Page settings</strong><span>URL & title</span></div><div className="spb-fields"><label>Page title<input value={page.title} onChange={event => updatePage({ title: event.target.value })} required /></label><label>Page URL slug<input value={page.slug} onChange={event => { const nextSlug = slugify(event.target.value); if (!nextSlug) return; setPages(current => current.map(item => item.slug === pageSlug ? { ...item, slug: nextSlug } : item)); setPageSlug(nextSlug); }} required /></label></div></div>
        <div className="spb-panel-title"><strong>Page sections</strong><span>{page.sections.length}</span></div>
        {page.sections.map((section, index) => <div className={`spb-section-row ${selected?.id === section.id ? "selected" : ""}`} key={section.id}>
          <button type="button" className="spb-section-select" onClick={() => setSelectedId(section.id)}><span className="spb-section-index">{String(index + 1).padStart(2, "0")}</span><span><strong>{section.title || section.type}</strong><small>{section.type} · {section.layout}</small></span></button>
          <div className="spb-section-actions"><button type="button" title="Move up" aria-label="Move section up" disabled={index === 0} onClick={() => moveSection(index, -1)}><ArrowUp size={14}/></button><button type="button" title="Move down" aria-label="Move section down" disabled={index === page.sections.length - 1} onClick={() => moveSection(index, 1)}><ArrowDown size={14}/></button><button type="button" title={section.visible ? "Hide section" : "Show section"} aria-label={section.visible ? "Hide section" : "Show section"} onClick={() => setPages(current => current.map(item => item.slug === pageSlug ? { ...item, sections: item.sections.map(s => s.id === section.id ? { ...s, visible: !s.visible } : s) } : item))}>{section.visible ? <Eye size={14}/> : <EyeOff size={14}/>}</button><button type="button" title="Delete section" aria-label="Delete section" onClick={() => { const next = page.sections.filter(s => s.id !== section.id); updatePage({ sections: next }); setSelectedId(next[0]?.id ?? ""); }}><Trash2 size={14}/></button></div>
        </div>)}
        <div className="spb-add"><label htmlFor="spb-add-type">Add a section</label><select id="spb-add-type" defaultValue="" onChange={event => { if (event.target.value) addSection(event.target.value as SectionType); event.target.value = ""; }}><option value="" disabled>Choose section type…</option>{sectionOptions.map(option => <option key={option.type} value={option.type}>{option.label}</option>)}</select></div>
      </aside>
      <section className="spb-editor">
        <div className="spb-panel-title"><strong>Section settings</strong><span>{selected ? sectionOptions.find(option => option.type === selected.type)?.label : "Select a section"}</span></div>
        {!selected ? <p className="spb-empty">Add a section or select one from the list.</p> : <div className="spb-fields">
          <label>Section type<select value={selected.type} onChange={event => updateSection({ type: event.target.value as SectionType })}>{sectionOptions.map(option => <option key={option.type} value={option.type}>{option.label}</option>)}</select></label>
          <label>Heading<input value={selected.title} onChange={event => updateSection({ title: event.target.value })} placeholder="Section heading"/></label>
          <label>Eyebrow / small label<input value={selected.eyebrow} onChange={event => updateSection({ eyebrow: event.target.value })} placeholder="Optional label"/></label>
          <label>Short text<textarea rows={3} value={selected.text} onChange={event => updateSection({ text: event.target.value })} placeholder="A short introduction or subtitle"/></label>
          <label>Body content<textarea rows={5} value={selected.body} onChange={event => updateSection({ body: event.target.value })} placeholder="Longer page copy"/></label>
          <label>Layout<select value={selected.layout} onChange={event => updateSection({ layout: event.target.value as Layout })}>{layouts.map(layout => <option key={layout} value={layout}>{layout[0].toUpperCase() + layout.slice(1)}</option>)}</select></label>
          <label>Image URL<input type="url" value={selected.image} onChange={event => updateSection({ image: event.target.value })} placeholder="https://…"/></label>
          <label className="spb-upload"><ImagePlus size={16}/> Upload image (max 10 MB)<input type="file" accept="image/*" onChange={uploadImage}/></label>
        </div>}
      </section>
      <section className="spb-preview">
        <div className="spb-panel-title"><strong>Preview</strong><span>Draft layout</span></div>
        <div className="spb-preview-canvas"><div className="spb-preview-brand">MAMALENS <span>STUDIO PREVIEW</span></div><h1>{page.title}</h1>
          {visible.map((section, index) => <article key={section.id} className={`spb-preview-section layout-${section.layout}`}>
            {section.image && <img src={section.image} alt={section.title || "Section image"}/>}
            <div>{section.eyebrow && <small>{section.eyebrow}</small>}{section.title && <h3>{section.title}</h3>}{section.text && <p>{section.text}</p>}{section.body && <p className="spb-preview-body">{section.body}</p>}{!section.title && !section.text && !section.body && !section.image && <p className="spb-muted">Empty section</p>}<span className="spb-preview-type">{section.type} section {index + 1}</span></div>
          </article>)}
          {visible.length === 0 && <p className="spb-muted">All sections are hidden. Toggle a section back on to include it.</p>}
        </div>
        <p className="spb-preview-note">Preview is a layout guide. The public site displays the fields supported by its page template.</p>
      </section>
    </div>
  </div>;
}
