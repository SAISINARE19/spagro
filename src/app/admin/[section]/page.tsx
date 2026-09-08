import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { createServerInsforgeClient } from "@/lib/insforge/server";
import {
  createCategory, createGalleryItem, createLaserProject, createMaterial,
  createProduct, updateEnquiryStatus, updateSettings,
} from "../actions";

const sections = new Set(["products", "categories", "laser-projects", "gallery", "enquiries", "materials", "settings"]);
const formStyle = { padding: 18, display: "grid", gap: 12, margin: "18px 0" } as const;
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 } as const;
type Relation = { name: string } | { name: string }[] | null;

export default async function AdminSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.has(section)) notFound();
  const db = await createServerInsforgeClient();
  if (!db) notFound();
  const { data: { user } } = await db.auth.getCurrentUser();
  if (!user) redirect("/admin");
  const { data: profile } = await db.database.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/admin?error=access");

  if (section === "products") {
    const [{ data: products }, { data: categories }] = await Promise.all([
      db.database.from("products").select("id,name,slug,published,featured,categories(name)").order("created_at", { ascending: false }),
      db.database.from("categories").select("id,name").eq("active", true).order("name"),
    ]);
    return <Shell eyebrow="Catalogue" title="Products">
      <form action={createProduct} className="surface" style={formStyle}>
        <b>Add product</b>
        <div style={gridStyle}><Field name="name" label="Product name" required/><Field name="slug" label="Slug" hint="Optional"/><label>Category<select className="field" name="category_id"><option value="">No category</option>{categories?.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label></div>
        <Field name="short_description" label="Short description"/><TextField name="description" label="Full description"/>
        <div style={gridStyle}><TextField name="features" label="Features" hint="One per line"/><TextField name="applications" label="Applications" hint="One per line"/><TextField name="specifications" label="Specifications" hint="One per line: Label: Value"/></div>
        <div style={gridStyle}><label>Product image<input className="field" name="image" type="file" accept="image/jpeg,image/png,image/webp"/></label><Field name="image_alt" label="Image description" hint="For accessibility"/></div>
        <Checks labels={["featured", "published"]}/><button className="button button-primary" style={{ justifySelf: "start" }}>Create product</button>
      </form>
      <Table headers={["Product", "Category", "Published", "Featured"]} rows={(products ?? []).map(product => { const relation = product.categories as Relation; return [product.name, (Array.isArray(relation) ? relation[0] : relation)?.name ?? "—", product.published ? "Yes" : "No", product.featured ? "Yes" : "No"]; })}/>
    </Shell>;
  }

  if (section === "categories") {
    const { data: categories } = await db.database.from("categories").select("id,name,slug,active").order("name");
    return <Shell eyebrow="Catalogue" title="Categories">
      <form action={createCategory} className="surface" style={formStyle}><b>Add category</b><div style={gridStyle}><Field name="name" label="Name" required/><Field name="slug" label="Slug" hint="Optional"/></div><TextField name="description" label="Description"/><Checks labels={["active"]} defaults={{ active: true }}/><button className="button button-primary" style={{ justifySelf: "start" }}>Create category</button></form>
      <Table headers={["Name", "Slug", "Active"]} rows={(categories ?? []).map(category => [category.name, category.slug, category.active ? "Yes" : "No"])}/>
    </Shell>;
  }

  if (section === "laser-projects") {
    const [{ data: projects }, { data: categories }, { data: materials }] = await Promise.all([
      db.database.from("laser_projects").select("id,title,slug,material,published").order("created_at", { ascending: false }),
      db.database.from("laser_categories").select("id,name").eq("active", true).order("name"),
      db.database.from("materials").select("name").eq("active", true).order("name"),
    ]);
    return <Shell eyebrow="Laser cutting" title="Laser projects">
      <form action={createLaserProject} className="surface" style={formStyle}><b>Add laser project</b>
        <div style={gridStyle}><Field name="title" label="Project title" required/><Field name="slug" label="Slug" hint="Optional"/><label>Category<select className="field" name="category_id"><option value="">No category</option>{categories?.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div>
        <div style={gridStyle}><label>Material<input className="field" name="material" list="material-options" placeholder="Select or type material"/><datalist id="material-options">{materials?.map(material => <option key={material.name} value={material.name}/>)}</datalist></label><label>Project image<input className="field" name="image" type="file" accept="image/jpeg,image/png,image/webp"/></label><Field name="image_alt" label="Image description"/></div>
        <TextField name="description" label="Description"/><Checks labels={["featured", "published"]}/><button className="button button-primary" style={{ justifySelf: "start" }}>Create project</button>
      </form>
      <Table headers={["Project", "Material", "Published"]} rows={(projects ?? []).map(project => [project.title, project.material ?? "—", project.published ? "Yes" : "No"])}/>
    </Shell>;
  }

  if (section === "gallery") {
    const { data: gallery } = await db.database.from("gallery").select("id,title,category,published,sort_order").order("sort_order");
    return <Shell eyebrow="Visual library" title="Gallery">
      <form action={createGalleryItem} className="surface" style={formStyle}><b>Add gallery image</b>
        <div style={gridStyle}><label>Image<input className="field" name="image" type="file" required accept="image/jpeg,image/png,image/webp"/></label><Field name="title" label="Title"/><label>Category<select className="field" name="category" defaultValue="Machinery"><option>Machinery</option><option>Workshop</option><option>Laser Cutting</option><option>Completed Work</option><option>Projects</option></select></label><Field name="sort_order" label="Sort order" type="number" defaultValue="0"/></div>
        <TextField name="description" label="Description"/><Field name="alt_text" label="Image description" hint="For accessibility"/><Checks labels={["published"]}/><button className="button button-primary" style={{ justifySelf: "start" }}>Upload to gallery</button>
      </form>
      <Table headers={["Title", "Category", "Published", "Order"]} rows={(gallery ?? []).map(item => [item.title ?? "Untitled", item.category, item.published ? "Yes" : "No", String(item.sort_order)])}/>
    </Shell>;
  }

  if (section === "materials") {
    const { data: materials } = await db.database.from("materials").select("id,name,active").order("name");
    return <Shell eyebrow="Laser cutting" title="Materials"><form action={createMaterial} className="surface" style={formStyle}><b>Add material</b><div style={gridStyle}><Field name="name" label="Material name" required/><Checks labels={["active"]} defaults={{ active: true }}/></div><button className="button button-primary" style={{ justifySelf: "start" }}>Add material</button></form><Table headers={["Material", "Active"]} rows={(materials ?? []).map(material => [material.name, material.active ? "Yes" : "No"])}/></Shell>;
  }

  if (section === "settings") {
    const { data: settings } = await db.database.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (!settings) notFound();
    return <Shell eyebrow="Site configuration" title="Website settings"><form action={updateSettings} className="surface" style={formStyle}>
      <div style={gridStyle}><Field name="business_name" label="Business name" defaultValue={settings.business_name}/><Field name="phone" label="Phone" defaultValue={settings.phone ?? ""}/><Field name="whatsapp" label="WhatsApp" defaultValue={settings.whatsapp ?? ""}/><Field name="email" label="Email" type="email" defaultValue={settings.email ?? ""}/></div>
      <TextField name="address" label="Address" defaultValue={settings.address}/><div style={gridStyle}><Field name="business_hours" label="Business hours" defaultValue={settings.business_hours ?? ""}/><Field name="maps_url" label="Google Maps URL" type="url" defaultValue={settings.maps_url ?? ""}/></div>
      <TextField name="hero_heading" label="Hero heading" defaultValue={settings.hero_heading}/><TextField name="hero_subtitle" label="Hero subtitle" defaultValue={settings.hero_subtitle}/><TextField name="about_text" label="About text" defaultValue={settings.about_text ?? ""}/><TextField name="footer_text" label="Footer text" defaultValue={settings.footer_text ?? ""}/><button className="button button-accent" style={{ justifySelf: "start" }}>Save website settings</button>
    </form></Shell>;
  }

  const { data: enquiries } = await db.database.from("enquiries").select("id,name,phone,email,type,status,description,created_at").order("created_at", { ascending: false });
  return <Shell eyebrow="Customer requests" title="Enquiries"><div style={{ display: "grid", gap: 12, marginTop: 18 }}>{enquiries?.length ? enquiries.map(enquiry => <article key={enquiry.id} className="surface" style={{ padding: 16 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><b>{enquiry.name}</b><span style={{ color: "#687169" }}> · {enquiry.type}</span><p style={{ margin: ".5rem 0" }}>{enquiry.phone}{enquiry.email ? " · " + enquiry.email : ""}</p><p style={{ margin: 0, color: "#59665d" }}>{enquiry.description}</p></div><form action={updateEnquiryStatus}><input name="id" type="hidden" value={enquiry.id}/><select name="status" defaultValue={enquiry.status} className="field"><option value="new">New</option><option value="contacted">Contacted</option><option value="quoted">Quoted</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><button className="button button-primary" style={{ marginTop: 8 }}>Update</button></form></div></article>) : <div className="surface" style={{ padding: 20 }}>No enquiries yet.</div>}</div></Shell>;
}

function Shell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) { return <><p className="eyebrow">{eyebrow}</p><h1 className="section-title">{title}</h1>{children}</>; }
function Field({ label, hint, ...props }: { label: string; hint?: string; name: string; type?: string; required?: boolean; defaultValue?: string }) { return <label>{label}{hint && <small style={{ display: "block", color: "#687169" }}>{hint}</small>}<input className="field" {...props}/></label>; }
function TextField({ label, hint, ...props }: { label: string; hint?: string; name: string; defaultValue?: string }) { return <label>{label}{hint && <small style={{ display: "block", color: "#687169" }}>{hint}</small>}<textarea className="field" rows={3} {...props}/></label>; }
function Checks({ labels, defaults = {} }: { labels: string[]; defaults?: Record<string, boolean> }) { return <span style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>{labels.map(label => <label key={label}><input type="checkbox" name={label} defaultChecked={defaults[label]}/> {label.charAt(0).toUpperCase() + label.slice(1)}</label>)}</span>; }
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) { return <div className="surface" style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 530 }}><thead><tr>{headers.map(header => <th key={header} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #dde2da" }}>{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} style={{ padding: 12, borderBottom: "1px solid #edf0eb" }}>{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} style={{ padding: 16 }}>No records yet.</td></tr>}</tbody></table></div>; }
