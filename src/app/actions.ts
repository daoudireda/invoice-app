"use server";
import { db } from "@/db";
import { Customers, invoices, Status } from "@/db/schema";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY));

export async function createAction(formData: FormData) {
  const { userId, orgId } = await auth();

  const value = Math.floor(parseFloat(String(formData.get("value")))) * 100;
  const description = String(formData.get("description"));
  const name = String(formData.get("name"));
  const email = String(formData.get("email"));

  if (!userId) {
    return;
  }
  const [customer] = await db
    .insert(Customers)
    .values({
      name,
      email,
      userId,
      organizationId: orgId || null,
    })
    .returning({
      id: Customers.id,
    });

  const results = await db
    .insert(invoices)
    .values({
      status: "open",
      value,
      description,
      userId,
      customerId: customer.id,
      organizationId: orgId || null,
    })
    .returning({
      id: invoices.id,
    });
  redirect(`/invoices/${results[0].id}`);
}

export async function updateStatus(formData: FormData) {
  const { userId, orgId } = await auth();
  if (!userId) {
    return;
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as Status;

  if (orgId) {
    await db
      .update(invoices)
      .set({
        status,
      })
      .where(
        and(eq(invoices.organizationId, orgId), eq(invoices.id, parseInt(id)))
      );
  } else {
    await db
      .update(invoices)
      .set({
        status,
      })
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.id, parseInt(id)),
          isNull(invoices.organizationId)
        )
      );
  }

  revalidatePath(`/invoices/${id}`, "page");
}

export async function deleteInvoiceAction(formData: FormData) {
  const { userId, orgId } = await auth();
  if (!userId) {
    return;
  }

  const id = formData.get("id") as string;

  if (orgId) {
    await db
      .delete(invoices)
      .where(
        and(eq(invoices.organizationId, orgId), eq(invoices.id, parseInt(id)))
      );
  } else {
    await db
      .delete(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.id, parseInt(id)),
          isNull(invoices.organizationId)
        )
      );
  }

  redirect(`/dashboard`);
}

export async function createPayment(formData: FormData) {
  const headersList = headers();
  const origin = (await headersList).get("origin");

  const id = formData.get("id") as string;
  const [result] = await db
    .select({
      status: invoices.status,
      value: invoices.value,
    })
    .from(invoices)
    .where(eq(invoices.id, parseInt(id)))
    .limit(1);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price_data: {
          currency: "usd",
          product: "prod_R7902ovpL6lgpS",
          unit_amount: result.value,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/invoices/${id}/payment?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/invoices/${id}/payment?status=canceled&session_id={CHECKOUT_SESSION_ID}`,
  });
  if (!session.url) {
    throw new Error("Invalid Session");
  } else {
    redirect(session.url);
  }
}
