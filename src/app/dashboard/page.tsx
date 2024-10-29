import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import Link from "next/link";

import { db } from "@/db";
import { Customers, invoices } from "@/db/schema";
import { cn } from "@/lib/utils";
import Container from "@/components/container";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull } from "drizzle-orm";

export default async function Home() {
  const { userId, orgId } = await auth();
  if (!userId) {
    return;
  }
  let results;
  if (orgId) {
    results = await db
      .select()
      .from(invoices)
      .innerJoin(Customers, eq(invoices.customerId, Customers.id))
      .where(eq(invoices.organizationId, orgId));
  } else {
    results = await db
      .select()
      .from(invoices)
      .innerJoin(Customers, eq(invoices.customerId, Customers.id))
      .where(and(eq(invoices.userId, userId), isNull(invoices.organizationId)));
  }

  const invoice = results.map(({ invoices, customers }) => {
    return {
      ...invoices,
      customer: customers,
    };
  });

  return (
    <main className="h-full">
      <Container>
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p>
            <Button className="inline-flex gap-2" variant="ghost" asChild>
              <Link href="/invoices/new">
                <CirclePlus className="h-4 w-4"></CirclePlus>
                Create Invoice
              </Link>
            </Button>
          </p>
        </div>
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] p-4 ">Date</TableHead>
              <TableHead className="p-4">Customer</TableHead>
              <TableHead className="p-4">Email</TableHead>
              <TableHead className="text-center p-4">Status</TableHead>
              <TableHead className="text-right p-4">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.map((result) => {
              return (
                <TableRow key={result.id}>
                  <TableCell className="font-medium text-left">
                    <Link
                      className="font-semibold block p-4"
                      href={`/invoices/${result.id}`}
                    >
                      {new Date(result.createTs).toLocaleDateString()}
                    </Link>
                  </TableCell>
                  <TableCell className="text-left">
                    <Link
                      className="font-semibold  block p-4"
                      href={`/invoices/${result.id}`}
                    >
                      {result.customer.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-left">
                    <Link
                      className=" block p-4"
                      href={`/invoices/${result.id}`}
                    >
                      {result.customer.email}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center ">
                    <Link
                      className=" block p-4"
                      href={`/invoices/${result.id}`}
                    >
                      <Badge
                        className={cn({
                          "bg-blue-500": result.status === "open",
                          "bg-green-600": result.status === "paid",
                          "bg-zinc-700": result.status === "void",
                          "bg-red-600": result.status === "uncollectible",
                        })}
                      >
                        {result.status}
                      </Badge>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right ">
                    <Link
                      className=" block p-4"
                      href={`/invoices/${result.id}`}
                    >
                      ${(result.value / 100).toFixed(2)}
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Container>
    </main>
  );
}
