"use server";

import { createAuthActions } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerInsforgeClient } from "@/lib/insforge/server";
import { uploadAdminImage } from "@/lib/admin-upload";
import { slugify } from "@/lib/utils";

function config() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || process.env.INSFORGE_ADMIN_KEY;
  return baseUrl && anonKey ? { baseUrl, anonKey } : null;
}

function text(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim(); }
function list(formData: FormData, key: string) { return text(formData, key).split("\n").map(value => value.trim()).filter(Boolean); }
function specifications(formData: FormData) {
  return Object.fromEntries(text(formData, "specifications").split("\n").map(line => line.split(":")).filter(([key, value]) => key?.trim() && value?.trim()).map(([key, value]) => [key.trim(), value.trim()]));
}
function refresh(...paths: string[]) { paths.forEach(path => revalidatePath(path)); }

async function admin() {
  const db = await createServerInsforgeClient();
  if (!db) throw new Error("InsForge is not configured.");
  const { data: { user } } = await db.auth.getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await db.database.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Forbidden");
  return db;
}

export async function signIn(formData: FormData) {
  const options = config();
  if (!options) redirect("/admin?error=config");
  const cookieStore = await cookies();
  const auth = createAuthActions({ ...options, cookies: cookieStore });
  const { error } = await auth.signInWithPassword({ email: text(formData, "email"), password: text(formData, "password") });
  if (error) redirect("/admin?error=invalid");
  const db = await createServerInsforgeClient();
  const { data: { user } } = db ? await db.auth.getCurrentUser() : { data: { user: null } };
  const { data: profile } = user && db ? await db.database.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
  if (!user || profile?.role !== "admin") {
    await auth.signOut();
    redirect("/admin?error=access");
  }
  redirect("/admin");
}

export async function signOut() {
  const options = config();
  if (options) await createAuthActions({ ...options, cookies: await cookies() }).signOut();
  redirect("/");
}

export async function createCategory(formData: FormData) {
  const db = await admin(); const name = text(formData, "name");
  if (!name) throw new Error("Category name is required.");
  const { error } = await db.database.from("categories").insert([{ name, slug: slugify(text(formData, "slug") || name), description: text(formData, "description") || null, active: formData.get("active") === "on" }]);
  if (error) throw new Error(error.message); refresh("/", "/machinery", "/admin/categories");
}

export async function createProduct(formData: FormData) {
  const db = await admin(); const name = text(formData, "name");
  if (!name) throw new Error("Product name is required.");
  const { data: products, error } = await db.database.from("products").insert([{
    name, slug: slugify(text(formData, "slug") || name), category_id: text(formData, "category_id") || null,
    short_description: text(formData, "short_description") || null, description: text(formData, "description") || null,
    features: list(formData, "features"), applications: list(formData, "applications"), specifications: specifications(formData),
    featured: formData.get("featured") === "on", published: formData.get("published") === "on",
  }]).select("id");
  const product = products?.[0]; if (error || !product) throw new Error(error?.message ?? "Could not create product.");
  const image = await uploadAdminImage("product-images", formData.get("image"), `products/${product.id}`);
  if (image) { const { error: imageError } = await db.database.from("product_images").insert([{ product_id: product.id, image_url: image.url, image_key: image.key, alt_text: text(formData, "image_alt") || name, sort_order: 0 }]); if (imageError) throw new Error(imageError.message); }
  refresh("/", "/machinery", `/machinery/${slugify(text(formData, "slug") || name)}`, "/admin/products");
}

export async function createMaterial(formData: FormData) {
  const db = await admin(); const name = text(formData, "name"); if (!name) throw new Error("Material name is required.");
  const { error } = await db.database.from("materials").insert([{ name, active: formData.get("active") === "on" }]); if (error) throw new Error(error.message); refresh("/laser-cutting", "/admin/materials");
}

export async function createLaserProject(formData: FormData) {
  const db = await admin(); const title = text(formData, "title"); if (!title) throw new Error("Project title is required.");
  const { data: projects, error } = await db.database.from("laser_projects").insert([{ title, slug: slugify(text(formData, "slug") || title), description: text(formData, "description") || null, category_id: text(formData, "category_id") || null, material: text(formData, "material") || null, featured: formData.get("featured") === "on", published: formData.get("published") === "on" }]).select("id");
  const project = projects?.[0]; if (error || !project) throw new Error(error?.message ?? "Could not create laser project.");
  const image = await uploadAdminImage("laser-images", formData.get("image"), `projects/${project.id}`);
  if (image) { const { error: imageError } = await db.database.from("laser_project_images").insert([{ laser_project_id: project.id, image_url: image.url, image_key: image.key, alt_text: text(formData, "image_alt") || title, sort_order: 0 }]); if (imageError) throw new Error(imageError.message); }
  refresh("/", "/laser-cutting", `/laser-cutting/${slugify(text(formData, "slug") || title)}`, "/admin/laser-projects");
}

export async function createGalleryItem(formData: FormData) {
  const db = await admin(); const image = await uploadAdminImage("gallery-images", formData.get("image"), "gallery");
  if (!image) throw new Error("Please choose an image for the gallery.");
  const { error } = await db.database.from("gallery").insert([{ title: text(formData, "title") || null, category: text(formData, "category") || "Machinery", description: text(formData, "description") || null, image_url: image.url, image_key: image.key, alt_text: text(formData, "alt_text") || null, sort_order: Number(text(formData, "sort_order") || 0), published: formData.get("published") === "on" }]);
  if (error) throw new Error(error.message); refresh("/", "/gallery", "/admin/gallery");
}

export async function updateSettings(formData: FormData) {
  const db = await admin();
  const { error } = await db.database.from("site_settings").update({ business_name: text(formData, "business_name") || "S.P. AGRO", phone: text(formData, "phone") || null, whatsapp: text(formData, "whatsapp") || null, email: text(formData, "email") || null, address: text(formData, "address"), business_hours: text(formData, "business_hours") || null, maps_url: text(formData, "maps_url") || null, hero_heading: text(formData, "hero_heading"), hero_subtitle: text(formData, "hero_subtitle"), about_text: text(formData, "about_text") || null, footer_text: text(formData, "footer_text") || null }).eq("id", 1);
  if (error) throw new Error(error.message); refresh("/", "/about", "/contact", "/admin/settings");
}

export async function updateEnquiryStatus(formData: FormData) {
  const db = await admin(); const { error } = await db.database.from("enquiries").update({ status: text(formData, "status") }).eq("id", text(formData, "id")); if (error) throw new Error(error.message); refresh("/admin", "/admin/enquiries");
}
