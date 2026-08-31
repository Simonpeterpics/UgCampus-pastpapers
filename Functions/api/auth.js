export async function onRequestPost({ request, env }) {
  try {
    let { password } = await request.json();
    let input = password.trim();
    
    // EMERGENCY PASSWORDS - Works even if Cloudflare secret fails!
    let allowed = [
      "simon@pics",
      "Simon@pics", 
      "SIMON@PICS",
      env.ADMIN_PASSWORD || ""
    ];
    
    // Clean list
    allowed = allowed.map(p => p.trim().toLowerCase());
    let check = input.toLowerCase();
    
    if (allowed.includes(check)) {
      return new Response(JSON.stringify({ success: true, message: "Active!" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    } else {
      return new Response(JSON.stringify({ 
        error: "Wrong! You typed: " + input + " | Secret in Cloudflare: " + (env.ADMIN_PASSWORD ? "FOUND ("+env.ADMIN_PASSWORD.length+" letters)" : "NOT FOUND - PLEASE ADD IN CLOUDFLARE!)") 
      }), { status: 401 });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
