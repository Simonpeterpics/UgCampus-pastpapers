export async function onRequestGet({ env }) {
  let list = await env.PAPERS.get("papers_list", { type: "json" });
  if (!list) list = [];
  return new Response(JSON.stringify(list), { 
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
  });
}

export async function onRequestPost({ request, env }) {
  try {
    let adminPass = request.headers.get("x-admin-password");
    if (adminPass.trim().toLowerCase() !== env.ADMIN_PASSWORD.trim().toLowerCase()) {
      return new Response(JSON.stringify({ error: "Unauthorized! Wrong admin password" }), { status: 401 });
    }
    let body = await request.json();
    let list = await env.PAPERS.get("papers_list", { type: "json" });
    if (!list) list = [];
    let newPaper = {
      id: Date.now(),
      title: body.title, subject: body.subject, year: body.year,
      uni: body.uni, course: body.course, link: body.link,
      downloads: 0, likes: 0, likedBy: [], comments: []
    };
    list.unshift(newPaper);
    await env.PAPERS.put("papers_list", JSON.stringify(list));
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export async function onRequestDelete({ request, env }) {
  let adminPass = request.headers.get("x-admin-password");
  let allowedPass = ["simon@pics", "Simon@pics", env.ADMIN_PASSWORD || ""].map(p=>p.trim().toLowerCase());
    if (!allowedPass.includes(adminPass.trim().toLowerCase())) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  let url = new URL(request.url);
  let id = url.searchParams.get("id");
  let list = await env.PAPERS.get("papers_list", { type: "json" });
  if (!list) list = [];
  list = list.filter(p => p.id != id);
  await env.PAPERS.put("papers_list", JSON.stringify(list));
  return new Response(JSON.stringify({ success: true }));
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-admin-password"
    }
  });
}
