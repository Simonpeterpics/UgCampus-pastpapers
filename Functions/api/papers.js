export async function onRequestGet({ env }) {
  let list = await env.PAPERS.get("papers", "json");
  return new Response(JSON.stringify(list || []), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}
export async function onRequestPost({ request, env }) {
  let pass = (request.headers.get("x-admin-password") || "").trim().toLowerCase();
  if (pass!== "simon@pics") return new Response("Unauthorized", { status: 401 });
  let data = await request.json();
  let list = (await env.PAPERS.get("papers", "json")) || [];
  let newItem = { id: Date.now(),...data, likes: 0, likedBy: [], downloads: 0 };
  list.unshift(newItem);
  await env.PAPERS.put("papers", JSON.stringify(list));
  return new Response(JSON.stringify(newItem), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}
export async function onRequestDelete({ request, env }) {
  let pass = (request.headers.get("x-admin-password") || "").trim().toLowerCase();
  if (pass!== "simon@pics") return new Response("Unauthorized", { status: 401 });
  let url = new URL(request.url);
  let id = parseInt(url.searchParams.get("id"));
  let list = (await env.PAPERS.get("papers", "json")) || [];
  list = list.filter(p => p.id!== id);
  await env.PAPERS.put("papers", JSON.stringify(list));
  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}
export async function onRequestOptions() {
  return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, x-admin-password" } });
}
