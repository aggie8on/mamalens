"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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

const articles = [
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
  const [slide, setSlide] = useState(0);
  const image = (i: number) => "/photos/" + photos[(i + photos.length) % photos.length];
  const step = (n: number) => setSlide((slide + n + photos.length) % photos.length);
  const visible = photos.map((_, i) => i);

  return <main className="site">
    <header className="header">
      <button className="logo" onClick={() => setPage("Home")} aria-label="MamaLens home"><img src="/photos/mama%20lens%20logo.svg" alt="MamaLens logo" /></button>
      <nav><button onClick={() => setPage("Work")}>Work</button><button onClick={() => setPage("About")}>About</button><button onClick={() => setPage("Contact")}>Contact</button></nav>
    </header>
    <div className="subtitle">Sports Photographer</div>
    <div className="top-controls" aria-label="Featured controls"><button onClick={() => step(-1)} aria-label="Previous feature"><ChevronLeft size={12}/></button><button className="play" onClick={() => step(1)} aria-label="Next feature">●</button><button onClick={() => step(1)} aria-label="Next feature"><ChevronRight size={12}/></button><span className="control-spacer"/><button onClick={() => setViewer(slide)} aria-label="Open featured image">↖</button></div>

    {page === "Home" && <>
      <section className="home-intro">
        <div className="portrait"><img src={image(4)} alt="MamaLens portrait"/></div>
        <div className="identity"><h1>MamaLens</h1><p>Sports Photographer</p></div>
        
      </section>
      <section className="section work-home"><div className="section-head"><h2>Work</h2><button onClick={() => setPage("Work")}>All work ↗</button></div><div className="home-grid">{[0,2,4,6,8,10,12,14,16].map(i=><button key={i} onClick={() => setViewer(i)} aria-label={"Open photo "+(i+1)}><img src={image(i)} alt={"MamaLens photograph "+(i+1)}/></button>)}</div></section>
      <section className="section writing"><div className="section-head"><h2>Writing</h2><button onClick={() => setPage("Writing")}>All writing ↗</button></div><div className="article-list">{articles.map(([title,date],i)=><button key={title} className="article" onClick={() => setPage("Writing")}><span><strong>{title}</strong><small>{date}</small></span><span className="article-arrow">↗</span></button>)}</div><div className="subscribe"><button onClick={() => setPage("Contact")}>Subscribe +</button></div></section>
      <Impact/>
      <Media/>
    </>}

    {page === "Work" && <>
      <section className="work-page"><h1>Work</h1><div className="work-grid">{visible.map(i=><button key={i} onClick={() => setViewer(i)} aria-label={"Open photo "+(i+1)}><img src={image(i)} alt={"MamaLens portfolio photo "+(i+1)}/></button>)}</div></section>
      <Impact/><Media/>
    </>}

    {page === "About" && <section className="simple-page"><h1>About</h1><div className="about-images"><img src={image(4)} alt="MamaLens work"/><img src={image(7)} alt="MamaLens work"/></div><Media/><Impact/></section>}
    {page === "Writing" && <section className="simple-page"><h1>Writing</h1><div className="article-list">{articles.map(([title,date])=><article className="article" key={title}><span><strong>{title}</strong><small>{date}</small></span><span>↗</span></article>)}</div></section>}
    {page === "Contact" && <section className="simple-page"><h1>Contact</h1></section>}

    <footer><div><span>Copyright MamaLens {new Date().getFullYear()}</span></div></footer>

    {viewer !== null && <div className="lightbox" onClick={() => setViewer(null)} role="dialog" aria-modal="true" aria-label="Image viewer"><div className="dots">{photos.slice(0,12).map((_,i)=><button key={i} className={i === viewer % 12 ? "active" : ""} onClick={e=>{e.stopPropagation();setViewer(i)}} aria-label={"Go to image "+(i+1)}/>)}</div><button className="lb-close" onClick={() => setViewer(null)} aria-label="Close image viewer"><X/></button><button className="lb-prev" onClick={e=>{e.stopPropagation();setViewer((viewer+photos.length-1)%photos.length)}} aria-label="Previous image"><ChevronLeft/></button><img className="lb-image" src={image(viewer)} alt={"MamaLens image "+(viewer+1)} onClick={e=>e.stopPropagation()}/><button className="lb-next" onClick={e=>{e.stopPropagation();setViewer((viewer+1)%photos.length)}} aria-label="Next image"><ChevronRight/></button></div>}
  </main>;
}

function Impact() {
  return <section className="impact"><h2>Impact</h2><div className="impact-track"><article></article><article></article><article></article><article></article></div></section>;
}

function Media() {
  return <section className="media"><div className="media-panel"></div></section>;
}
