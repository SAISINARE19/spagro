import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Factory, MapPin, MessageCircle } from "lucide-react";
import { GalleryCard, ProductCard } from "@/components/catalogue-cards";
import { getGallery, getProducts, getSettings } from "@/lib/catalogue";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export default async function Home() {
  const [settings, products, gallery] = await Promise.all([
    getSettings(), getProducts({ featured: true }), getGallery(3),
  ]);
  const whatsapp = getWhatsAppUrl(settings.whatsapp, "Hello S.P. AGRO, I am interested in your agricultural machinery. I would like to know more.");

  return <main>
    <section style={{ background: "#e8eee7", padding: "clamp(3rem,9vw,7.5rem) 0", overflow: "hidden" }}>
      <div className="shell" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: "3rem", alignItems: "center" }}>
        <div>
          <p className="eyebrow">Agriculture × precision engineering</p>
          <h1 className="display" style={{ margin: ".7rem 0 1.3rem" }}>{settings.hero_heading}</h1>
          <p style={{ maxWidth: 560, fontSize: "1.08rem", lineHeight: 1.65, color: "#526158" }}>{settings.hero_subtitle}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
            <Link className="button button-primary" href="/machinery">Explore machinery <ArrowRight size={16}/></Link>
            <Link className="button button-outline" href="/laser-cutting">Laser cutting services</Link>
          </div>
        </div>
        <div style={{ position: "relative", minHeight: 390, overflow: "hidden", border: "12px solid #fff", boxShadow: "18px 18px 0 #96d43a" }}>
          <Image src="/images/sp-agro-rotavator-in-use.webp" alt="S.P. AGRO rotavator in use with a tractor" fill priority sizes="(max-width: 760px) 100vw, 50vw" style={{ objectFit: "cover" }}/>
          <div style={{ position: "absolute", inset: "auto 0 0", padding: "1.25rem", color: "white", background: "linear-gradient(transparent, #11191ccc)" }}><b>Built for practical farm work.</b></div>
        </div>
      </div>
    </section>
    <section style={{ background: "#192126", color: "white" }}>
      <div className="shell" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
        {["Agricultural Machinery", "Precision Laser Cutting", "Custom Manufacturing", "Farmer Focused"].map((item) => <div key={item} style={{ padding: "1.5rem 0", fontWeight: 750, borderRight: "1px solid #ffffff25" }}><Check size={16} style={{ color: "#96d43a", verticalAlign: "middle", marginRight: 8 }}/>{item}</div>)}
      </div>
    </section>
    <section className="shell" style={{ padding: "6rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, marginBottom: 28 }}><div><p className="eyebrow">Featured catalogue</p><h2 className="section-title" style={{ margin: ".5rem 0 0" }}>Machinery built for the field.</h2></div><Link href="/machinery" className="button button-outline">View all</Link></div>
      {products.length ? <div className="card-grid">{products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product}/>)}</div> : <div className="surface" style={{ padding: "2rem" }}><b>The machinery catalogue is being prepared.</b><p style={{ color: "#687169" }}>Add published products from the protected admin dashboard to display them here.</p><Link className="button button-primary" href="/contact">Contact S.P. AGRO</Link></div>}
    </section>
    <section style={{ background: "#192126", color: "white", padding: "6rem 0" }}>
      <div className="shell" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 40 }}>
        <div><p className="eyebrow">Industrial capability</p><h2 className="section-title" style={{ margin: ".5rem 0 1rem" }}>Precision laser cutting.</h2><p style={{ color: "#cbd3ca", lineHeight: 1.7 }}>From a simple design to production-ready components. Share your requirement and the S.P. AGRO team can help define the right next step.</p><Link className="button button-accent" href="/quote">Request a quote <ArrowRight size={16}/></Link></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>{["High Precision", "Clean Edges", "Custom Shapes", "Production Ready"].map((item) => <div key={item} style={{ border: "1px solid #ffffff25", padding: "1.3rem", fontWeight: 750 }}><Factory size={22} style={{ color: "#96d43a", marginBottom: 18 }}/><br/>{item}</div>)}</div>
      </div>
    </section>
    <section className="shell" style={{ padding: "6rem 0" }}><p className="eyebrow">Why S.P. AGRO</p><h2 className="section-title" style={{ margin: ".5rem 0 2rem" }}>Practical work. Built with care.</h2><div className="card-grid">{["Agriculture focused", "Precision manufacturing", "Durable construction", "Custom solutions", "Quality workmanship", "Direct customer support"].map((item, index) => <div className="surface" key={item} style={{ padding: "1.4rem" }}><span className="eyebrow">0{index + 1}</span><h3 style={{ margin: ".6rem 0 0", fontSize: "1.15rem" }}>{item}</h3></div>)}</div></section>
    <section className="shell" style={{ paddingBottom: "3rem" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, marginBottom: 24 }}><div><p className="eyebrow">From the workshop</p><h2 className="section-title" style={{ margin: ".5rem 0 0" }}>A closer look at our work.</h2></div><Link href="/gallery" className="button button-outline">Full gallery</Link></div>{gallery.length ? <div className="card-grid">{gallery.map((item) => <GalleryCard key={item.id} item={item}/>)}</div> : <div className="image-placeholder" style={{ minHeight: 190 }}/>}</section>
    <section style={{ background: "#e4ece3", padding: "4rem 0" }}><div className="shell" style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", alignItems: "center" }}><div><p className="eyebrow">Find S.P. AGRO</p><h2 className="section-title" style={{ margin: ".5rem 0" }}>Babhaleshwar Kh., Maharashtra</h2><p style={{ color: "#526158", whiteSpace: "pre-line" }}>{settings.address}</p></div><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><Link href={settings.maps_url ?? "/contact"} className="button button-primary"><MapPin size={16}/> Directions</Link><Link href={whatsapp} className="button button-accent"><MessageCircle size={16}/> WhatsApp</Link></div></div></section>
  </main>;
}
