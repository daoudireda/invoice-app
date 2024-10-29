import { Badge } from "@/components/ui/badge";

import { Customers, invoices } from "@/db/schema";

import Container from "@/components/container";

import { cn } from "@/lib/utils";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY));

import { createPayment, updateStatus } from "@/app/actions";
import Stripe from "stripe";

interface InvoicePageProps {
  params: { invoiceId: string };
  searchParams: {
    status: string;
    session_id: string;
  };
}

export default async function InvoicePage({
  params,
  searchParams,
}: InvoicePageProps) {
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;
  const invoiceId = Number.parseInt(awaitedParams.invoiceId);
  const sessionId = awaitedSearchParams.session_id;
  const isSuccess = sessionId && awaitedSearchParams.status === "success";
  const isCanceled = awaitedSearchParams.status === "canceled";
  let isError = isSuccess && !sessionId;

  console.log("isSuccess", isSuccess);
  console.log("isCanceled", isCanceled);
  console.log(awaitedSearchParams);

  if (isSuccess) {
    const { payment_status } = await stripe.checkout.sessions.retrieve(
      sessionId
    );

    if (payment_status !== "paid") {
      isError = true;
    } else {
      const formData = new FormData();
      formData.append("id", invoiceId.toString());
      formData.append("status", "paid");
      await updateStatus(formData);
    }
  }

  const [result] = await db
    .select({
      id: invoices.id,
      status: invoices.status,
      createTs: invoices.createTs,
      description: invoices.description,
      value: invoices.value,
      name: Customers.name,
    })
    .from(invoices)
    .innerJoin(Customers, eq(invoices.customerId, Customers.id))
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  const invoice = {
    ...result,
    customer: {
      name: result.name,
    },
  };

  return (
    <main className="h-full w-full ">
      <Container>
        {isError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-center rounded-lg mb-4"
            role="alert"
          >
            <span className="block sm:inline">
              There was an error processing your payment.
            </span>
          </div>
        )}
        {isCanceled && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-center rounded-lg mb-4"
            role="alert"
          >
            <span className="block sm:inline">
              Your payment was canceled, please try again.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2">
          <div>
            <div className="flex justify-between mb-8">
              <h1 className="text-3xl font-bold flex items-center gap-4">
                Invoices {invoiceId}
                <Badge
                  className={cn({
                    "bg-blue-500": invoice.status === "open",
                    "bg-green-600": invoice.status === "paid",
                    "bg-zinc-700": invoice.status === "void",
                    "bg-red-600": invoice.status === "uncollectible",
                  })}
                >
                  {invoice.status}
                </Badge>
              </h1>
            </div>
            <p className="text-3xl mb-3">${(invoice.value / 100).toFixed(2)}</p>

            <p className="text-lg mb-8">{invoice.description}</p>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">Manage Invoice</h2>
            {invoice.status === "open" && (
              <form action={createPayment}>
                <input type="hidden" name="id" value={invoice.id} />
                <Button className="flex gap-2 bg-green-700 font-bold">
                  <CreditCard className="w-5 h-auto"></CreditCard>
                  Pay Invoice
                </Button>
              </form>
            )}
            {invoice.status === "paid" && (
              <p className="text-xl font-bold items-center flex gap-2">
                <Check className="w-5 h-auto bg-green-500 rounded-full text-white p-1"></Check>
                Invoice Paid
              </p>
            )}
          </div>
        </div>

        <h2 className="font-bold text-lg mb-4">Billing Details</h2>
        <ul className="grid gap-2">
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Invoice ID :
            </strong>
            <span>{invoiceId}</span>
          </li>
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Invoice Date :
            </strong>
            <span>{new Date(invoice.createTs).toLocaleDateString()}</span>
          </li>
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Billing Name :
            </strong>
            <span>
              <span>{invoice.customer.name}</span>
            </span>
          </li>
        </ul>
      </Container>
    </main>
  );
}
