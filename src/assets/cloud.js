import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL,
  key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
let client = null;
export let cloudConfiguration = "local";
if (url || key) {
  try {
    if (!url || !key) throw Error("Incomplete configuration");
    client = createClient(url, key);
    cloudConfiguration = "configured";
  } catch {
    cloudConfiguration = "invalid";
  }
}
export const cloud = client;
export async function requireUser() {
  if (!cloud)
    throw Error(
      "Cloud chưa kết nối. Bạn vẫn có thể import, lắp ráp và export cục bộ. Xem Workspace settings.",
    );
  const {
    data: { user },
    error,
  } = await cloud.auth.getUser();
  if (error || !user) throw Error("Đăng nhập ở mục Community trước khi gửi.");
  return user;
}
export async function invoke(name, body) {
  await requireUser();
  const { data, error } = await cloud.functions.invoke(name, { body });
  if (error) {
    let message = error.message;
    try {
      const detail = await error.context.json();
      message = detail.error || message;
    } catch {}
    throw Error(message);
  }
  if (data?.error) throw Error(data.error);
  return data;
}
export async function approved() {
  if (!cloud) return [];
  const { data, error } = await cloud
    .from("community_assets")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
}
export async function pending() {
  if (!cloud) return [];
  const { data, error } = await cloud
    .from("community_assets")
    .select("*")
    .neq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
}
export async function downloadCloud(asset) {
  if (!cloud) throw Error("Chưa cấu hình kho.");
  const { data, error } = await cloud.storage
    .from("space-lot-models")
    .download(asset.storage_path);
  if (error) throw error;
  return new File([data], asset.title + ".glb", { type: "model/gltf-binary" });
}

export async function modelRequests() {
  if (!cloud) return [];
  const { data, error } = await cloud
    .from("model_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
}
