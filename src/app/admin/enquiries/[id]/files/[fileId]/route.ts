import { NextResponse } from "next/server";
import { createServerInsforgeClient } from "@/lib/insforge/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  const db = await createServerInsforgeClient();
  if (!db) return new NextResponse("InsForge is not configured.", { status: 503 });
  const { data: { user } } = await db.auth.getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { data: profile } = await db.database.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return new NextResponse("Forbidden", { status: 403 });

  const { data: file } = await db.database.from("enquiry_files").select("file_path,file_name,file_type").eq("id", fileId).eq("enquiry_id", id).maybeSingle();
  if (!file) return new NextResponse("File not found", { status: 404 });
  const { data, error } = await db.storage.from("enquiry-files").download(file.file_path);
  if (error || !data) return new NextResponse("File could not be loaded", { status: 404 });

  return new NextResponse(data as BodyInit, {
    headers: {
      "Content-Type": file.file_type || "application/octet-stream",
      "Content-Disposition": `inline; filename="${file.file_name.replace(/[^a-zA-Z0-9._-]/g, "_")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
