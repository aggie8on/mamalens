"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { ChevronLeft, ChevronRight, X, Instagram, Twitter } from "lucide-react";

const photos = [
  "SnapInsta.to_483278233_18049999316219890_2812465495201190836_n.jpg",
  "SnapInsta.to_520249959_18062312675219890_8774106791364626585_n.jpg",
  "SnapInsta.to_520845460_18062312657219890_8786669794915152070_n.jpg",
  "SnapInsta.to_521440269_18062312672219890_9185281072437556857_n.jpg",
  "SnapInsta.to_541545447_18066869171219890_5794095129681665710_n.jpg",
  "SnapInsta.to_542618219_18066869180219890_1881472840108648235_n.jpg",
  "SnapInsta.to_543342065_18066869162219890_1584199596841954124_n.jpg",
  "SnapInsta.to_552296690_18068533916219890_3566302504755723067_n.jpg",
  "SnapInsta.to_575710549_18073637222219890_8881634276379680043_n.jpg",
  "SnapInsta.to_579943929_18074436092219890_8741294514443534573_n.jpg",
  "SnapInsta.to_580707585_18074436083219890_903811790166448033_n.jpg",
  "SnapInsta.to_581122086_18074805620219890_1327511009587300753_n.jpg",
  "SnapInsta.to_581216071_18074805602219890_2478644938623638663_n.jpg",
  "SnapInsta.to_582537236_18074436074219890_2407906695640406393_n.jpg",
  "SnapInsta.to_582696623_18074805611219890_1879396836269752562_n.jpg",
  "SnapInsta.to_587301916_18075798056219890_4051824610999227157_n.jpg",
  "SnapInsta.to_587766283_18076590260219890_4991990690265903881_n.jpg",
  "SnapInsta.to_587989436_18076853351219890_2666942807801281401_n.jpg",
  "SnapInsta.to_588222806_18076853300219890_7214396334164379705_n.jpg",
  "SnapInsta.to_588240691_18075798044219890_2163839540412920762_n.jpg",
  "SnapInsta.to_588870693_18076853378219890_3957088818447189399_n.jpg",
  "SnapInsta.to_588967623_18076853315219890_7212629524087164122_n.jpg",
  "SnapInsta.to_588984869_18076942967219890_4376732987355134186_n.jpg",
  "SnapInsta.to_589006939_18076590251219890_8157236048267788314_n.jpg",
  "SnapInsta.to_589035590_18076942994219890_7488474574910637698_n.jpg",
  "SnapInsta.to_589082660_18076853318219890_2232741136044231708_n.jpg",
  "SnapInsta.to_589134992_18077125940219890_5025552348579371435_n.jpg",
  "SnapInsta.to_589149674_18076942949219890_1708854436153752736_n.jpg",
  "SnapInsta.to_589157408_18076853369219890_4888236973704985578_n.jpg",
  "SnapInsta.to_589161520_18076942976219890_4434661914858962666_n.jpg",
  "SnapInsta.to_589200002_18077125949219890_2543891649620568354_n.jpg",
  "SnapInsta.to_589232626_18076853327219890_3933615002701056133_n.jpg",
  "SnapInsta.to_589234887_18076590269219890_6996076025226521742_n.jpg",
  "SnapInsta.to_589262182_18077125931219890_6093742199677224946_n.jpg",
  "SnapInsta.to_589546148_18077125958219890_1779366284503369976_n.jpg",
  "SnapInsta.to_589610194_18076853360219890_8652386433174450696_n.jpg",
  "SnapInsta.to_589629886_18076942958219890_5986197134505909821_n.jpg",
  "SnapInsta.to_591129845_18076942985219890_5604594268355684725_n.jpg",
  "SnapInsta.to_598636071_18077703044219890_1548897893966152772_n.jpg",
  "SnapInsta.to_598638332_18077703023219890_2618343671462894283_n.jpg",
  "SnapInsta.to_598986603_18077703005219890_6472148347733470056_n.jpg",
  "SnapInsta.to_599118130_18077703014219890_1967986113954321576_n.jpg",
  "SnapInsta.to_599185315_18077702996219890_6450860802433503301_n.jpg",
  "SnapInsta.to_599323788_18077703035219890_684312437673663665_n.jpg"
];

const articles: [string, string][] = [
  ["Meet Oven OD, Uganda’s Young Stylist Looking Up to Becoming a Fashion Star", "May 4, 2022"],
  ["Meet Shan Joe, the Mpambako Busa Hit Maker", "February 6, 2022"],
  ["Upclose with Eli Upset, the Young Outstanding Comedian", "February 2, 2022"],
  ["Catching Up with Sticks Promoter (Omuzibu)", "October 2, 2021"],
  ["Meet Shinar Maaya", "August 1, 2021"],
  ["Meet Bash Breezy", "July 25, 2021"]
];

const categories = ["Categories"];

export default function Home() {
  const [page, setPage] = useState("Home");
  const [filter, setFilter] = useState("Categories");
  const [viewer, setViewer] = useState<number | null>(null);
  const [siteSettings, setSiteSettings] = useState({ introText: "Stories, people, and moments seen through MamaLens. Explore photography, creative work, and profiles celebrating the people shaping culture.", subscribeUrl: "", instagramUrl: "https://www.instagram.com/mama_lens0/", xUrl: "https://x.com/mama_lens", tiktokUrl: "https://www.tiktok.com/" });
  const [managedPhotos, setManagedPhotos] = useState<{ id: string; title: string; cover_image_url: string | null; sort_order: number }[]>([]);
  const [managedArticles, setManagedArticles] = useState<{ id: string; title: string; excerpt: string; published_at: string | null; sort_order: number }[]>([]);
  const [managedProjects, setManagedProjects] = useState<{ id: string; title: string; excerpt: string; cover_image_url: string | null; sort_order: number }[]>([]);
  const [managedPages, setManagedPages] = useState<{ slug: string; title: string; sections: unknown[] }[]>([]);
  const [showSubscribeHelp, setShowSubscribeHelp] = useState(false);
  useEffect(() => {
    if (!supabase) return;
    void Promise.all([
      supabase.from("site_pages").select("sections").eq("slug", "site-settings").maybeSingle(),
      supabase.from("site_pages").select("slug,title,sections").neq("slug", "site-settings"),
      supabase.from("portfolio_items").select("id,title,cover_image_url,sort_order").eq("item_type", "photograph").eq("published", true).order("sort_order", { ascending: true }),
      supabase.from("portfolio_items").select("id,title,excerpt,published_at,sort_order").eq("item_type", "article").eq("published", true).order("sort_order", { ascending: true }),
      supabase.from("portfolio_items").select("id,title,excerpt,cover_image_url,sort_order").eq("item_type", "project").eq("published", true).order("sort_order", { ascending: true })
     ]).then(([settingsResult, pagesResult, photoResult, articleResult, projectResult]) => {
      const value = Array.isArray(settingsResult.data?.sections) ? settingsResult.data.sections[0] : null;
      if (value && typeof value === "object") setSiteSettings((old) => ({ ...old, ...value }));
      if (photoResult.data?.length) setManagedPhotos(photoResult.data as typeof managedPhotos);
      if (articleResult.data?.length) setManagedArticles(articleResult.data as typeof managedArticles);
      if (projectResult.data?.length) setManagedProjects(projectResult.data as typeof managedProjects);
      if (pagesResult.data?.length) setManagedPages(pagesResult.data as typeof managedPages);
    });
  }, []);
  const image = (i: number) => managedPhotos.length
    ? (managedPhotos[(i + managedPhotos.length) % managedPhotos.length]?.cover_image_url || "")
    : "/photos/" + photos[(i + photos.length) % photos.length];
  const visible = (managedPhotos.length ? managedPhotos : photos).map((_, i) => i);
  const workImages = managedProjects.length ? managedProjects : [];
  const pageInfo = (slug: string) => managedPages.find(item => item.slug === slug);
  const pageHeading = (slug: string, fallback: string) => pageInfo(slug)?.title || fallback;
  const pageBody = (slug: string, fallback: string) => {
    const sections = pageInfo(slug)?.sections;
    const first = Array.isArray(sections) ? sections.find(section => !!section && typeof section === "object" && (!("visible" in section) || (section as { visible?: unknown }).visible !== false)) : null;
    if (!first || typeof first !== "object") return fallback;
    if ("body" in first && typeof first.body === "string" && first.body.trim()) return first.body;
    if ("text" in first && typeof first.text === "string" && first.text.trim()) return first.text;
    return fallback;
  };
  const customSections = (slug: string) => {
    const sections = pageInfo(slug)?.sections;
    if (!Array.isArray(sections)) return [];
    const visibleSections = sections.filter(section => !!section && typeof section === "object" && (!("visible" in section) || (section as { visible?: unknown }).visible !== false));
    const introIndex = visibleSections.findIndex(section => !!section && typeof section === "object" && ["intro", "text"].includes(String((section as Record<string, unknown>).type)));
    return introIndex >= 0 ? visibleSections.filter((_, index) => index !== introIndex) : visibleSections;
  };
  const displayArticles: [string, string][] = managedArticles.length
    ? managedArticles.map((item) => [item.title, item.published_at ? new Date(item.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }) : ""])
    : articles;

  return <main className="site">
    <header className="header">
      <button className="logo" onClick={() => setPage("Home")} aria-label="MamaLens home"><img src="/photos/mama%20lens%20logo.svg" alt="MamaLens logo" /></button>
      <nav><button onClick={() => setPage("Work")}>Work</button><button onClick={() => setPage("About")}>About</button><button onClick={() => setPage("Contact")}>Contact</button></nav>
    </header>
    {page === "Home" && <>
      <section className="home-intro">
        <div className="portrait"><img src={image(0)} alt="MamaLens featured photograph"/></div>
        <div className="identity"><h1>{pageHeading("home","MamaLens")}</h1><p>Sports Photographer</p></div>
        <p className="intro-copy">{pageBody("home",siteSettings.introText)}</p>
      </section>
      <PageCustomSections sections={customSections("home")} projects={managedProjects} articles={displayArticles} onNavigate={setPage} />
      <section className="section work-home"><div className="section-head"><h2>Work</h2><button onClick={() => setPage("Work")}>All work ↗</button></div><div className="home-grid">{[0,2,4,6,8,10,12,14,16].map(i=><button key={i} onClick={() => setViewer(i)} aria-label={"Open photo "+(i+1)}><img src={image(i)} alt={"MamaLens photograph "+(i+1)}/></button>)}</div></section>
      {!customSections("home").some(section => !!section && typeof section === "object" && (section as Record<string, unknown>).type === "articles") && <section className="section writing"><div className="section-head"><h2>Writing</h2><button onClick={() => setPage("Writing")}>All writing ↗</button></div><div className="article-list">{displayArticles.map(([title,date],i)=><button key={title} className="article" onClick={() => setPage("Writing")}><span><strong>{title}</strong><small>{date}</small></span><span className="article-arrow">↗</span></button>)}</div><div className="subscribe"><p>Subscribe to receive new updates and news.</p>{siteSettings.subscribeUrl ? <a className="subscribe-button" href={siteSettings.subscribeUrl} target="_blank" rel="noreferrer">Subscribe +</a> : <button onClick={() => setShowSubscribeHelp(true)}>Subscribe +</button>}{showSubscribeHelp && <div className="subscribe-help" role="status">Add your newsletter signup URL in Studio → Site settings to activate subscriptions.<button onClick={() => setShowSubscribeHelp(false)} aria-label="Dismiss message">×</button></div>}</div></section>}
      <Impact/>
      <Media />
    </>}

    {page === "Work" && <>
      <section className="work-page"><h1>{pageHeading("work","Work")}</h1><p className="page-copy">{pageBody("work","Selected photography and creative projects.")}</p><PageCustomSections sections={customSections("work")} projects={managedProjects} articles={displayArticles} onNavigate={setPage} />{!customSections("work").some(section => !!section && typeof section === "object" && (section as Record<string, unknown>).type === "projects") && workImages.length>0&&<div className="project-grid">{workImages.map(project=><article className="project-card" key={project.id}>{project.cover_image_url&&<img src={project.cover_image_url} alt={project.title}/>}<h2>{project.title}</h2>{project.excerpt&&<p>{project.excerpt}</p>}</article>)}</div>}<div className="work-grid">{visible.map(i=><button key={i} onClick={() => setViewer(i)} aria-label={"Open photo "+(i+1)}><img src={image(i)} alt={"MamaLens portfolio photo "+(i+1)}/></button>)}</div></section>
      <Impact/>
    </>}

    {page === "About" && <section className="simple-page"><h1>{pageHeading("about","About")}</h1><p className="page-copy">{pageBody("about","Tell visitors about MamaLens, your approach, and the stories behind your work.")}</p><PageCustomSections sections={customSections("about")} projects={managedProjects} articles={displayArticles} onNavigate={setPage} /><div className="about-images"><img src={image(4)} alt="MamaLens work"/><img src={image(7)} alt="MamaLens work"/></div>{!customSections("about").some(section => !!section && typeof section === "object" && (section as Record<string, unknown>).type === "videos") && <MediaGallery/>}<Impact/></section>}
    {page === "Writing" && <section className="simple-page"><h1>{pageHeading("writing","Writing")}</h1><p className="page-copy">{pageBody("writing","Stories, interviews, and articles from MamaLens.")}</p><PageCustomSections sections={customSections("writing")} projects={managedProjects} articles={displayArticles} onNavigate={setPage} />{!customSections("writing").some(section => !!section && typeof section === "object" && (section as Record<string, unknown>).type === "articles") && <div className="article-list">{displayArticles.map(([title,date])=><article className="article" key={title}><span><strong>{title}</strong><small>{date}</small></span><span>↗</span></article>)}</div>}</section>}
    {page === "Contact" && <section className="simple-page"><h1>{pageHeading("contact","Contact")}</h1><p className="page-copy">{pageBody("contact","Add your preferred contact details or enquiry instructions in Studio → Page layouts.")}</p><PageCustomSections sections={customSections("contact")} projects={managedProjects} articles={displayArticles} onNavigate={setPage} /></section>}

    <footer>
      <div className="footer-left">
        <span>Copyright MamaLens {new Date().getFullYear()}</span>
        <span>Protected By <a href="https://creativecommons.org/licenses/" target="_blank" rel="noreferrer"><u>Creative Commons</u></a></span>
      </div>
      <div className="footer-right">
        <div className="social-icons">
          <a href={siteSettings.instagramUrl || "#"} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={22} strokeWidth={1.6}/></a>
          <a href={siteSettings.xUrl || "#"} target="_blank" rel="noreferrer" aria-label="X"><Twitter size={22} strokeWidth={1.6}/></a>
          <a href={siteSettings.tiktokUrl || "#"} target="_blank" rel="noreferrer" aria-label="TikTok"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3v11.1a4.1 4.1 0 1 1-3.5-4.05"/><path d="M14 3c.6 3.4 2.6 5.4 6 5.8"/></svg></a>
        </div>
      </div>
      
    </footer>

    {viewer !== null && <div className="lightbox" onClick={() => setViewer(null)} role="dialog" aria-modal="true" aria-label="Image viewer"><div className="dots">{photos.slice(0,12).map((_,i)=><button key={i} className={i === viewer % 12 ? "active" : ""} onClick={e=>{e.stopPropagation();setViewer(i)}} aria-label={"Go to image "+(i+1)}/>)}</div><button className="lb-close" onClick={() => setViewer(null)} aria-label="Close image viewer"><X/></button><button className="lb-prev" onClick={e=>{e.stopPropagation();setViewer((viewer+photos.length-1)%photos.length)}} aria-label="Previous image"><ChevronLeft/></button><img className="lb-image" src={image(viewer)} alt={"MamaLens image "+(viewer+1)} onClick={e=>e.stopPropagation()}/><button className="lb-next" onClick={e=>{e.stopPropagation();setViewer((viewer+1)%photos.length)}} aria-label="Next image"><ChevronRight/></button></div>}
  </main>;
}

function Impact() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    { title: "Client feedback", copy: "Client feedback will be featured here.", byline: "Client testimonial" },
    { title: "Client feedback", copy: "Client feedback will be featured here.", byline: "Client testimonial" },
    { title: "Client feedback", copy: "Client feedback will be featured here.", byline: "Client testimonial" },
  ];
  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide(current => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);
  return <section className="impact"><h2>Impact</h2><div className="impact-viewport"><div className="impact-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>{slides.map((slide, index) => <article key={slide.title} aria-hidden={index !== activeSlide}><div className="impact-card"><span className="impact-mark">“</span><h3>{slide.title}</h3><p>{slide.copy}</p><small>{slide.byline}</small></div></article>)}</div></div></section>;
}

function Media() {
  const [playlist, setPlaylist] = useState<{ title: string; description: string; tracks: { id: string; title: string; url: string; description?: string; published?: boolean }[] } | null>(null);
  const [legacyTracks, setLegacyTracks] = useState<{ id: string; title: string; media_url: string | null; excerpt: string | null }[]>([]);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void (async () => {
      const { data } = await supabase.from("site_pages").select("sections").eq("slug", "playlist").maybeSingle();
      if (!active) return;
      const saved = Array.isArray(data?.sections) ? data.sections[0] as { title?: string; description?: string; tracks?: { id: string; title: string; url: string; description?: string; published?: boolean }[] } | undefined : undefined;
      if (saved && Array.isArray(saved.tracks)) {
        setPlaylist({ title: saved.title || "What I'm listening to", description: saved.description || "", tracks: saved.tracks.filter(track => track.published !== false && !!track.url) });
      } else {
        const { data: oldTracks } = await supabase.from("portfolio_items").select("id,title,media_url,excerpt").eq("item_type", "audio").eq("published", true).order("sort_order", { ascending: true });
        if (active) setLegacyTracks((oldTracks ?? []) as typeof legacyTracks);
      }
    })();
    return () => { active = false; };
  }, []);
  const tracks = playlist?.tracks ?? legacyTracks.filter(track => !!track.media_url).map(track => ({ id: track.id, title: track.title, url: track.media_url as string, description: track.excerpt || "" }));
  return <section className="media"><div className="media-panel"><p className="media-eyebrow">THE LISTENING CORNER</p><h2>{playlist?.title || "What I'm listening to"}</h2><p className="media-description">{playlist?.description || "A few sounds on repeat lately."}</p>{tracks.length ? <div className="audio-playlist">{tracks.map((track, index) => <article className="audio-track" key={track.id}><span className="audio-track-number">{String(index + 1).padStart(2, "0")}</span><div className="audio-track-info"><strong>{track.title}</strong>{track.description && <small>{track.description}</small>}<audio controls preload="none" src={track.url}/></div></article>)}</div> : <p className="media-hint">The listening playlist will be curated and uploaded through Studio.</p>}</div></section>;
}

function MediaGallery() {
  const [items, setItems] = useState<{ id: string; title: string; item_type: string; cover_image_url: string | null; media_url: string | null; media_type: string | null; external_url: string | null; excerpt: string | null }[]>([]);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.from("portfolio_items").select("id,title,item_type,cover_image_url,media_url,media_type,external_url,excerpt").in("item_type", ["photograph", "video"]).eq("published", true).order("sort_order", { ascending: true }).then(({ data }) => {
      if (active) setItems((data ?? []) as typeof items);
    });
    return () => { active = false; };
  }, []);
  return <section className="media-gallery"><div className="media-gallery-heading"><p className="media-eyebrow">BEHIND THE LENS</p><h2>Images & videos of MamaLens</h2></div>{items.length ? <div className="media-gallery-grid">{items.map(item => <article className="media-gallery-item" key={item.id}>{item.item_type === "video" && item.media_url ? <video controls preload="metadata" poster={item.cover_image_url || undefined} src={item.media_url}/> : item.cover_image_url ? <img src={item.cover_image_url} alt={item.title}/> : null}<div><strong>{item.title}</strong>{item.excerpt && <p>{item.excerpt}</p>}{item.item_type === "video" && !item.media_url && item.external_url && <a href={item.external_url} target="_blank" rel="noreferrer">Watch video ↗</a>}</div></article>)}</div> : <p className="media-hint">Published photographs and videos will appear here when added in Studio.</p>}</section>;
}

function PageCustomSections({ sections, projects = [], articles = [], onNavigate }: {
  sections: unknown[];
  projects?: { id: string; title: string; excerpt: string; cover_image_url: string | null }[];
  articles?: [string, string][];
  onNavigate?: (page: string) => void;
}) {
  const supported = sections.filter((section): section is Record<string, unknown> => !!section && typeof section === "object" && (section as Record<string, unknown>).visible !== false && ["text", "image", "links", "intro", "projects", "articles", "videos"].includes(String((section as Record<string, unknown>).type)));
  if (!supported.length) return null;
  return <div className="managed-page-sections">{supported.map((section, index) => {
    const title = typeof section.title === "string" ? section.title : "";
    const eyebrow = typeof section.eyebrow === "string" ? section.eyebrow : "";
    const text = typeof section.text === "string" ? section.text : "";
    const body = typeof section.body === "string" ? section.body : "";
    const src = typeof section.image === "string" ? section.image : "";
    const type = String(section.type);
    const layout = typeof section.layout === "string" ? section.layout : "stack";
    return <section key={typeof section.id === "string" ? section.id : index} className={`managed-page-section managed-layout-${layout} managed-type-${type}`}>
      {src && <img src={src} alt={title || "MamaLens page image"}/>}
      <div className="managed-page-copy">{eyebrow && <span className="managed-eyebrow">{eyebrow}</span>}{title && <h2>{title}</h2>}{text && <p>{text}</p>}{body && <p className="managed-body">{body}</p>}{type === "links" && /^https?:\/\//i.test(body.trim()) && <a href={body.trim()} target="_blank" rel="noreferrer">Explore link ↗</a>}</div>
      {type === "projects" && <div className="managed-project-grid">{projects.map(project => <article key={project.id}>{project.cover_image_url && <img src={project.cover_image_url} alt={project.title}/>}<h3>{project.title}</h3>{project.excerpt && <p>{project.excerpt}</p>}</article>)}{projects.length === 0 && <p>Published projects will appear here when added in Studio.</p>}</div>}
      {type === "articles" && <div className="managed-article-list">{articles.map(([articleTitle, date]) => <button type="button" key={articleTitle} onClick={() => onNavigate?.("Writing")}><strong>{articleTitle}</strong><small>{date}</small><span>↗</span></button>)}{articles.length === 0 && <p>Published articles will appear here when added in Studio.</p>}</div>}
      {type === "videos" && <MediaGallery/>}
    </section>;
  })}</div>;
}
