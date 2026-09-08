import { createInsforgeClient } from "@/lib/insforge/client";
import type { Category, GalleryItem, LaserProject, Product, SiteSettings } from "@/types/database";

const fallbackGallery: GalleryItem[] = [
  { id: "gallery-fallback-1", title: "Workshop setup", category: "Machinery", description: "Field-ready equipment in active use.", image_url: "/images/unnamed.webp", alt_text: "Agricultural machinery in the workshop" },
  { id: "gallery-fallback-2", title: "Precision fit", category: "Fabrication", description: "Laser-cut components with careful finishing.", image_url: "/images/unnamed (1).webp", alt_text: "Precision laser-cut metal component" },
  { id: "gallery-fallback-3", title: "Assembly detail", category: "Production", description: "A close look at fabrication quality and assembly.", image_url: "/images/unnamed (2).webp", alt_text: "Metal assembly and fabrication detail" },
  { id: "gallery-fallback-4", title: "Cutting pattern", category: "Laser work", description: "Detailed laser cutting for agricultural and industrial uses.", image_url: "/images/unnamed (3).webp", alt_text: "Laser cutting pattern and finished parts" },
  { id: "gallery-fallback-5", title: "Field application", category: "Agriculture", description: "Practical machinery for real farm conditions.", image_url: "/images/unnamed (4).webp", alt_text: "Farm machinery in use" },
  { id: "gallery-fallback-6", title: "Workshop finish", category: "Quality", description: "The final finish and workshop attention that defines our work.", image_url: "/images/unnamed (5).webp", alt_text: "Finished workshop machinery detail" },
];

const legacyImageMap: Record<string, string> = {
  "/images/gallery-1.png": "/images/unnamed.webp",
  "/images/gallery-2.png": "/images/unnamed (1).webp",
  "/images/gallery-3.png": "/images/unnamed (2).webp",
  "/images/gallery-4.png": "/images/unnamed (3).webp",
  "/images/gallery-5.png": "/images/unnamed (4).webp",
  "/images/gallery-6.png": "/images/unnamed (5).webp",
  "/images/laser-6.png": "/images/image-1788843957869.png",
  "/images/laser-7.png": "/images/image-1788843951808.png",
};

function fixLegacyImageUrl(url: string) {
  return legacyImageMap[url] ?? url;
}

export const defaultSettings: SiteSettings = {
  business_name: "S.P. AGRO", phone: null, whatsapp: null, email: null,
  address: "Near Shital Pump, Babhaleshwar Kh., Maharashtra - 413737, India",
  business_hours: null, maps_url: null,
  hero_heading: "Built for Agriculture. Made with Precision.",
  hero_subtitle: "Reliable agricultural machinery and precision laser cutting solutions for farmers, fabricators and industries.",
  about_text: "S.P. AGRO focuses on practical agricultural machinery, custom components and precision manufacturing.",
  footer_text: "Practical machinery. Precision manufacturing.",
};

export async function getSettings() { const db = createInsforgeClient(); if (!db) return defaultSettings; const { data } = await db.database.from("site_settings").select("*").eq("id", 1).maybeSingle(); return data ? { ...defaultSettings, ...data } : defaultSettings; }
export async function getCategories() { const db = createInsforgeClient(); if (!db) return [] as Category[]; const { data } = await db.database.from("categories").select("*").eq("active", true).order("name"); return (data ?? []) as Category[]; }
export async function getProducts(options: { featured?: boolean; category?: string; query?: string } = {}) {
  const db = createInsforgeClient(); if (!db) return [] as Product[];
  let query = db.database.from("products").select("*, category:categories(name,slug), product_images(*) ").eq("published", true).order("created_at", { ascending: false });
  if (options.featured) query = query.eq("featured", true); if (options.category) query = query.eq("category_id", options.category); if (options.query) query = query.ilike("name", `%${options.query}%`);
  const { data } = await query; return (data ?? []) as unknown as Product[];
}
export async function getProduct(slug: string) { const db = createInsforgeClient(); if (!db) return null; const { data } = await db.database.from("products").select("*, category:categories(name,slug), product_images(*)").eq("slug", slug).eq("published", true).maybeSingle(); return data as unknown as Product | null; }
export async function getLaserProjects(featured = false) {
  const db = createInsforgeClient();
  if (!db) {
    const fallback: LaserProject[] = [
      {
        id: "laser-fallback-1",
        title: "Eagle detail panel",
        slug: "eagle-detail-panel",
        description: "Custom decorative laser-cut panel with a refined finish and sharp detailing.",
        material: "Mild steel",
        featured: true,
        published: true,
        laser_categories: { name: "Decorative cutting", slug: "decorative-cutting" },
        laser_project_images: [{ id: "laser-image-6", image_url: "/images/image-1788843957869.png", image_key: null, alt_text: "Laser-cut decorative eagle panel", sort_order: 0 }],
      },
      {
        id: "laser-fallback-2",
        title: "Peacock panel",
        slug: "peacock-panel",
        description: "Decorative laser-cut work with elegant, flowing, ornamental details.",
        material: "Steel",
        featured: true,
        published: true,
        laser_categories: { name: "Decorative cutting", slug: "decorative-cutting" },
        laser_project_images: [{ id: "laser-image-7", image_url: "/images/image-1788843951808.png", image_key: null, alt_text: "Laser-cut decorative peacock panel", sort_order: 0 }],
      },
    ];
    return featured ? fallback.slice(0, 2) : fallback;
  }

  let query = db.database.from("laser_projects").select("*, laser_categories(name,slug), laser_project_images(*)").eq("published", true).order("created_at", { ascending: false });
  if (featured) query = query.eq("featured", true);
  const { data } = await query;
  const items = (data ?? []).map((project) => ({
    ...project,
    laser_project_images: project.laser_project_images?.map((image: { image_url: string }) => ({ ...image, image_url: fixLegacyImageUrl(image.image_url) })),
  })) as unknown as LaserProject[];
  return items.length ? items : (featured ? [] : [
    {
      id: "laser-fallback-1",
      title: "Eagle detail panel",
      slug: "eagle-detail-panel",
      description: "Custom decorative laser-cut panel with a refined finish and sharp detailing.",
      material: "Mild steel",
      featured: true,
      published: true,
      laser_categories: { name: "Decorative cutting", slug: "decorative-cutting" },
      laser_project_images: [{ id: "laser-image-6", image_url: "/images/image-1788843957869.png", image_key: null, alt_text: "Laser-cut decorative eagle panel", sort_order: 0 }],
    },
    {
      id: "laser-fallback-2",
      title: "Peacock panel",
      slug: "peacock-panel",
      description: "Decorative laser-cut work with elegant, flowing, ornamental details.",
      material: "Steel",
      featured: true,
      published: true,
      laser_categories: { name: "Decorative cutting", slug: "decorative-cutting" },
      laser_project_images: [{ id: "laser-image-7", image_url: "/images/image-1788843951808.png", image_key: null, alt_text: "Laser-cut decorative peacock panel", sort_order: 0 }],
    },
  ] as LaserProject[]);
}
export async function getGallery(limit?: number) {
  const db = createInsforgeClient();
  if (!db) return (limit ? fallbackGallery.slice(0, limit) : fallbackGallery) as GalleryItem[];

  let query = db.database.from("gallery").select("*").eq("published", true).order("sort_order");
  if (limit) query = query.limit(limit);
  const { data } = await query;

  const items = (data ?? []).map((item) => ({ ...item, image_url: fixLegacyImageUrl(item.image_url) })) as GalleryItem[];
  if (items.length > 0) return items;
  return (limit ? fallbackGallery.slice(0, limit) : fallbackGallery) as GalleryItem[];
}
