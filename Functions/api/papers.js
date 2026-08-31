export async function onRequestGet({ env }) {
  let list = await env.PAPERS.get("papers_list", { type: "json" }) || [];
  return new Response(JSON.stringify(list), { headers: { "Content-Type": "application/json" } });
}

export async function onRequestPost({ request, env }) {
  let body = await request.json();
  let list = await env.PAPERS.get("papers_list", { type: "json" }) || [];
  let newPaper = {
    id: Date.now(),
    title: body.title,
    subject: body.subject,
    year: body.year,
    uni: body.uni,
    course: body.course,
    link: body.link,
    downloads: 0,
    likes: 0,
    likedBy: [],
    comments: []
  };
  list.unshift(newPaper);
  await env.PAPERS.put("papers_list", JSON.stringify(list));
  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
}
