export async function onRequestGet({ env }) {
  try {
    let list = await env.PAPERS.get("papers_list", { type: "json" });
    if (!list) list = [];
    return new Response(JSON.stringify(list), { 
      headers: { "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*" } 
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.PAPERS) {
      return new Response(JSON.stringify({ error: "PAPERS KV not bound!" }), { status: 500 });
    }
    let body = await request.json();
    let list = await env.PAPERS.get("papers_list", { type: "json" });
    if (!list) list = [];
    
    let newPaper = {
      id: Date.now(),
      title: body.title || "Untitled",
      subject: body.subject || "General",
      year: body.year || "2024",
      uni: body.uni || "Unknown",
      course: body.course || "BCOM",
      link: body.link || "",
      downloads: 0,
      likes: 0,
      likedBy: [],
      comments: []
    };
    
    list.unshift(newPaper);
    await env.PAPERS.put("papers_list", JSON.stringify(list));
    
    return new Response(JSON.stringify({ success: true, paper: newPaper }), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
