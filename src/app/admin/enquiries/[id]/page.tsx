import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerInsforgeClient } from "@/lib/insforge/server";
import { updateEnquiryStatus } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiry details" };

export default async function EnquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await createServerInsforgeClient();
  if (!db) redirect("/admin?error=config");
  const { data: { user } } = await db.auth.getCurrentUser();
  if (!user) redirect("/admin");
  const { data: profile } = await db.database.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/admin?error=access");

  const [{ data: enquiry }, { data: files }] = await Promise.all([
    db.database.from("enquiries").select("*").eq("id", id).maybeSingle(),
    db.database.from("enquiry_files").select("id,file_name,file_path,file_type,file_size,created_at").eq("enquiry_id", id).order("created_at"),
  ]);
  if (!enquiry) notFound();

  return <main style={{ minHeight: "78vh", background: "#eef1ec", padding: "3rem 1rem 5rem" }}><div className="shell">
    <Link href="/admin" className="button button-outline">Back to all requests</Link>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, flexWrap: "wrap", margin: "2rem 0 1.5rem" }}><div><p className="eyebrow">Customer request</p><h1 className="display" style={{ margin: ".5rem 0 0", fontSize: "clamp(2.5rem,6vw,5rem)" }}>{enquiry.name}</h1></div><form action={updateEnquiryStatus}><input type="hidden" name="id" value={enquiry.id} /><label>Status<select className="field" name="status" defaultValue={enquiry.status}><option value="new">New</option><option value="contacted">Contacted</option><option value="quoted">Quoted</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label><button className="button button-primary" style={{ marginTop: 8 }}>Save status</button></form></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
      <Info title="Contact details"><p><b>Name:</b> {enquiry.name}</p><p><b>Phone:</b> {enquiry.phone}</p><p><b>Email:</b> {enquiry.email || "Not provided"}</p><p><b>Company / farm:</b> {enquiry.company || "Not provided"}</p></Info>
      <Info title="Request details"><p><b>Type:</b> {enquiry.type}</p><p><b>Requirement:</b> {enquiry.requirement_type || "Not provided"}</p><p><b>Product:</b> {enquiry.product || "Not provided"}</p><p><b>Quantity:</b> {enquiry.quantity || "Not provided"}</p><p><b>Material:</b> {enquiry.material || "Not provided"}</p></Info>
    </div>
    <Info title="Client message"><p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{enquiry.description}</p><small style={{ color: "#687169" }}>Submitted {new Date(enquiry.created_at).toLocaleString()}</small></Info>
    <Info title="Uploaded files">{files?.length ? <div style={{ display: "grid", gap: 16 }}>{files.map(file => { const fileUrl = `/admin/enquiries/${id}/files/${file.id}`; const isImage = file.file_type?.startsWith("image/"); return <div key={file.id} style={{ display: "grid", gap: 8 }}><a href={fileUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>{file.file_name}</a>{isImage && <a href={fileUrl} target="_blank" rel="noreferrer"><img src={fileUrl} alt={file.file_name} style={{ maxWidth: "min(100%, 520px)", maxHeight: 420, objectFit: "contain", border: "1px solid #d9e1da" }} /></a>}<small style={{ color: "#687169" }}>{file.file_type || "file"}{file.file_size ? `, ${Math.round(file.file_size / 1024)} KB` : ""} · <a href={fileUrl} download={file.file_name}>Open / download</a></small></div>})}</div> : <p style={{ color: "#687169" }}>No files attached.</p>}</Info>
  </div></main>;
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="surface" style={{ padding: "1.25rem", marginTop: 16 }}><h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>{title}</h2>{children}</section>;
}
