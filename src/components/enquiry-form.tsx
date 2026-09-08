"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type Props = { type?: "contact" | "quote" | "laser"; product?: string };

export function EnquiryForm({ type = "quote", product }: Props) {
  const [state, setState] = useState<{ message: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setState(null);

    const response = await fetch("/api/enquiries", {
      method: "POST",
      body: new FormData(form),
    });
    const data = await response.json().catch(() => ({ message: "Unable to submit your request." }));

    setBusy(false);
    setState({ ok: response.ok, message: data.message });
    if (response.ok) form.reset();
  }

  return (
    <form onSubmit={submit} className="surface" style={{ padding: "clamp(1.25rem,4vw,2rem)", display: "grid", gap: 14 }}>
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="product" value={product ?? ""} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
        <label>Name<input required name="name" className="field" autoComplete="name" /></label>
        <label>Phone<input required name="phone" className="field" inputMode="tel" autoComplete="tel" /></label>
        <label>Email<input name="email" className="field" type="email" autoComplete="email" /></label>
        <label>Company / Farm<input name="company" className="field" /></label>
      </div>
      {type !== "contact" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        <label>Requirement type<select name="requirement_type" className="field"><option>Agricultural Machinery</option><option>Laser Cutting</option><option>Custom Solution</option><option>Other</option></select></label>
        <label>Quantity<input name="quantity" type="number" min="1" className="field" /></label>
        <label>Material<input name="material" className="field" placeholder="If known" /></label>
      </div>}
      <label>{type === "contact" ? "Message" : "Requirement"}<textarea required name="description" className="field" rows={5} placeholder="Tell us what you need." /></label>
      {type !== "contact" && <label>Drawing or reference <small>(PDF, PNG, JPG, JPEG, DXF — max 10 MB)</small><input name="files" className="field" type="file" accept="application/pdf,image/png,image/jpeg,application/dxf,image/vnd.dxf" multiple /></label>}
      <button className="button button-primary" disabled={busy}>{busy ? "Sending..." : <>Send request <Send size={16} /></>}</button>
      {state && <p style={{ margin: 0, color: state.ok ? "#2f6b37" : "#b32222" }}>{state.message}</p>}
    </form>
  );
}
