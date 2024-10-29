import { db } from "@/db";
import { Customers, invoices } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import Invoice from "./invoice";

export default async function InvoicePage({
  params,
}: {
  params: { invoiceId: string };
}) {
  const awaitedParams = await params;
  const invoiceId = parseInt(awaitedParams.invoiceId);
  const { userId, orgId } = await auth();
  if (!userId) {
    return;
  }
  let result;
  if (orgId) {
    [result] = await db
      .select()
      .from(invoices)
      .innerJoin(Customers, eq(invoices.customerId, Customers.id))
      .where(
        and(eq(invoices.organizationId, orgId), eq(invoices.id, invoiceId))
      );
  } else {
    [result] = await db
      .select()
      .from(invoices)
      .innerJoin(Customers, eq(invoices.customerId, Customers.id))
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.id, invoiceId),
          isNull(invoices.organizationId)
        )
      )
      .limit(1);
  }

  if (isNaN(invoiceId)) {
    throw new Error("Invalid invoice ID");
  }

  if (!result) {
    notFound();
  }

  const invoice = {
    ...result.invoices,
    customer: result.customers,
  };

  return <Invoice invoice={invoice}></Invoice>;
}
