import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/createLead",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const result = await ctx.runMutation(api.leads.createLead, {
      templateId: body.templateId || "",
      email: body.email || "",
      phone: body.phone || "",
      guests: parseInt(body.guests || "0", 10),
      names: body.names || "",
      date: body.date || "",
      location: body.location || "",
      message: body.message || "",
    });
    return new Response(JSON.stringify({ success: true, leadId: result.leadId }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }),
});

http.route({
  path: "/getLead",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const leadId = url.searchParams.get("leadId");
    if (!leadId) {
      return new Response(JSON.stringify({ success: false, error: "Missing leadId" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    const lead = await ctx.runQuery(api.leads.getLead, { leadId });
    return new Response(JSON.stringify({ success: true, data: lead }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }),
});

function corsHeaders() {
  return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
}

function corsOk() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function checkPassword(password: string) {
  const correct = process.env.ADMIN_PASSWORD;
  if (password !== correct) throw new Error("Unauthorized");
}

// CORS preflight
["/createLead", "/getLead", "/admin/listLeads", "/admin/getLead", "/admin/updateStatus"].forEach(function(p) {
  http.route({ path: p, method: "OPTIONS", handler: httpAction(async () => corsOk()) });
});

http.route({
  path: "/admin/listLeads",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    try {
      checkPassword(body.password || "");
      const leads = await ctx.runQuery(api.admin.listLeads, {
        status: body.status || undefined,
      });
      return new Response(JSON.stringify({ success: true, leads }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

http.route({
  path: "/admin/updateStatus",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    try {
      checkPassword(body.password || "");
      const result = await ctx.runMutation(api.admin.updateLeadStatus, {
        leadId: body.leadId || "",
        status: body.status || "",
      });
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

http.route({
  path: "/admin/getLead",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    try {
      checkPassword(body.password || "");
      const lead = await ctx.runQuery(api.admin.getLead, {
        leadId: body.leadId || "",
      });
      return new Response(JSON.stringify({ success: true, lead }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

export default http;
