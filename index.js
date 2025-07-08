export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle login API
    if (url.pathname === "/api/login") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const body = await request.json();
      const { email, password } = body;

      // ✅ Replace this with your real authentication logic
      if (email === "test@example.com" && password === "secret") {
        return new Response(JSON.stringify({ success: true, token: "demo-token" }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: false, message: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle signup API
    if (url.pathname === "/api/signup") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const body = await request.json();
      const { email, password } = body;

      // ✅ Replace this with your real signup logic
      return new Response(JSON.stringify({ success: true, userId: "new-user-id" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // For all other requests, serve static files
    return env.ASSETS.fetch(request);
  }
};
