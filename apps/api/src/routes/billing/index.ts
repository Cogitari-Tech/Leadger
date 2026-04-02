import { Hono } from "hono";
import Stripe from "stripe";
import { supabaseAdmin as supabase } from "../../config/supabase";

const billingRoutes = new Hono();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as any,
});

// Endpoint to create a checkout session for a specific tenant
billingRoutes.post("/checkout-session", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const tenantId = c.req.header("x-tenant-id");

    if (!authHeader || !tenantId) {
      return c.json({ error: "Missing authentication or tenant context" }, 401);
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (userError || !user) {
      return c.json({ error: "Invalid user token" }, 401);
    }

    // Verify user is an owner or admin of the tenant
    const { data: memberData, error: memberError } = await supabase
      .from("tenant_members")
      .select("role:roles!inner(name)")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (
      memberError ||
      !memberData ||
      // In Supabase, the role relationship is returned differently depending on schema. Let's assume an array or direct object.
      // Easiest is to just allow it to fetch role and check name.
      !memberData.role ||
      (Array.isArray(memberData.role)
        ? !memberData.role.some((r: any) => ["owner", "admin"].includes(r.name))
        : !["owner", "admin"].includes((memberData.role as any).name))
    ) {
      return c.json(
        { error: "Insufficient permissions to manage billing" },
        403,
      );
    }

    // Fetch tenant to get stripe_customer_id
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("name, stripe_customer_id, email, cnpj")
      .eq("id", tenantId)
      .single();

    if (!tenantData) {
      return c.json({ error: "Tenant not found" }, 404);
    }

    let customerId = tenantData.stripe_customer_id;

    // Create a customer if it doesn't have one
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: tenantData.name,
        email: tenantData.email || user.email,
        metadata: {
          tenant_id: tenantId,
          cnpj: tenantData.cnpj || "",
        },
      });
      customerId = customer.id;

      // Update tenant
      await supabase
        .from("tenants")
        .update({ stripe_customer_id: customerId })
        .eq("id", tenantId);
    }

    // Create the session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Leadgers Platform Subscription",
              description: "Assinatura mensal para o ecossistema de governança",
            },
            unit_amount: 500000, // R$ 5000,00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/dashboard`,
      metadata: {
        tenant_id: tenantId,
      },
    });

    return c.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Session error:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Endpoint for Stripe Webhooks
billingRoutes.post("/webhook", async (c) => {
  const sig = c.req.header("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return c.json({ error: "Missing signature or secret" }, 400);
  }

  let event;
  try {
    const body = await c.req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return c.json({ error: "Webhook Error" }, 400);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenant_id;

        if (tenantId && session.mode === "subscription") {
          await supabase
            .from("tenants")
            .update({
              plan_status: "active",
              plan: "paid",
            })
            .eq("id", tenantId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        const status = subscription.status; // past_due, active, canceled...

        await supabase
          .from("tenants")
          .update({
            plan_status: status,
            plan: "paid",
            plan_expires_at: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        await supabase
          .from("tenants")
          .update({
            plan_status: "canceled",
            plan: "free",
          })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }

    return c.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return c.json({ error: "Internal Error" }, 500);
  }
});

export default billingRoutes;
