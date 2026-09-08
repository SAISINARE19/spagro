import { signIn, signOut } from "./actions";
import { createServerInsforgeClient } from "@/lib/insforge/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function Admin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
	const { error } = await searchParams;
	const db = await createServerInsforgeClient();
	const { data: { user } } = db ? await db.auth.getCurrentUser() : { data: { user: null } };
	const { data: profile } = user && db ? await db.database.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };

	if (!user || profile?.role !== "admin") return <Login error={error} />;

	const tables = ["products", "categories", "laser_projects", "gallery", "enquiries"] as const;
	const [results, { data: enquiries }] = await Promise.all([
		Promise.all(tables.map(table => db.database.from(table).select("id", { count: "exact", head: true }))),
		db.database.from("enquiries").select("id,name,type,status,created_at").order("created_at", { ascending: false }),
	]);

	return <main style={{ minHeight: "78vh", background: "#eef1ec", padding: "3rem 1rem 5rem" }}><div className="shell">
		<div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, flexWrap: "wrap" }}><div><p className="eyebrow">S.P. AGRO admin</p><h1 className="display" style={{ margin: ".5rem 0 1.5rem", fontSize: "clamp(2.5rem,6vw,5rem)" }}>Customer requests.</h1></div><form action={signOut}><button className="button button-primary">Sign out</button></form></div>
		<div className="card-grid">{results.map((result, index) => <div className="surface" style={{ padding: "1.3rem" }} key={tables[index]}><span className="eyebrow">{tables[index].replace("_", " ")}</span><b style={{ fontSize: "2.3rem", display: "block", marginTop: 10 }}>{result.count ?? 0}</b></div>)}</div>
		<section className="surface" style={{ padding: "1.5rem", marginTop: 20 }}><h2 style={{ marginTop: 0 }}>All quotes and requests</h2>{enquiries?.length ? <div style={{ display: "grid", gap: 10 }}>{enquiries.map(enquiry => <a href={`/admin/enquiries/${enquiry.id}`} key={enquiry.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderTop: "1px solid #edf0eb", paddingTop: 12, flexWrap: "wrap" }}><span><b>{enquiry.name}</b><small style={{ display: "block", color: "#687169" }}>{enquiry.type} · {enquiry.status}</small></span><time style={{ color: "#687169", fontSize: ".85rem" }}>{new Date(enquiry.created_at).toLocaleString()}</time></a>)}</div> : <p style={{ color: "#687169" }}>No requests or quotes yet.</p>}</section>
	</div></main>;
}

function Login({ error }: { error?: string }) {
	return <main className="shell" style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "3rem 1rem" }}><div className="surface" style={{ width: "min(100%, 420px)", padding: "2rem", display: "grid", gap: 14 }}><p className="eyebrow">S.P. AGRO</p><h1 className="section-title" style={{ margin: 0 }}>Admin login</h1>{error && <p style={{ color: "#b32222" }}>{error === "config" ? "InsForge is not configured." : error === "access" ? "This account is not an admin." : "Sign in was not accepted."}</p>}<form action={signIn} style={{ display: "grid", gap: 14 }}><label>Email<input className="field" type="email" name="email" required /></label><label>Password<input className="field" type="password" name="password" required /></label><button className="button button-primary">Sign in</button></form></div></main>;
}
