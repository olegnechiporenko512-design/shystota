const STORAGE_KEY = "tt_attr";

export const ATTR_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "ttclid",
  "gclid",
] as const;

export type AttrField = (typeof ATTR_FIELDS)[number];
export type Attribution = Record<AttrField, string>;

function emptyAttribution(): Attribution {
  return {
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
    fbclid: "",
    ttclid: "",
    gclid: "",
  };
}

function clip(value: string, max: number): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const prev = readAttribution();
  let changed = false;
  for (const field of ATTR_FIELDS) {
    const value = params.get(field);
    if (!value) continue;
    const clean = clip(value, field === "fbclid" || field === "ttclid" || field === "gclid" ? 300 : 200);
    if (!clean || prev[field] === clean) continue;
    prev[field] = clean;
    changed = true;
  }
  if (changed || !sessionStorage.getItem(STORAGE_KEY)) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
  }
}

export function readAttribution(): Attribution {
  const result = emptyAttribution();
  if (typeof window === "undefined") return result;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return result;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return result;
    for (const field of ATTR_FIELDS) {
      const value = (parsed as Record<string, unknown>)[field];
      if (typeof value === "string") {
        result[field] = clip(value, 300);
      }
    }
    return result;
  } catch {
    return result;
  }
}
