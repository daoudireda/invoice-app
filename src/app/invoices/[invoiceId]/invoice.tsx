"use client";
import { Badge } from "@/components/ui/badge";

import { Customers, invoices } from "@/db/schema";

import Container from "@/components/container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import AVAILABLE_STATUSES from "@/data/invoices";
import { updateStatus, deleteInvoiceAction } from "@/app/actions";
import { ChevronDown, CreditCard, Ellipsis, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOptimistic } from "react";
import Link from "next/link";

interface InvoiceProps {
  invoice: typeof invoices.$inferSelect & {
    customer: typeof Customers.$inferSelect;
  };
}

export default function InvoicePage({ invoice }: InvoiceProps) {
  const [currentStatus, setCurrentStatus] = useOptimistic(
    invoice.status,
    (state, newStatus) => {
      return String(newStatus);
    }
  );

  async function handleOnUpdateStatus(formData: FormData) {
    const originalStatus = currentStatus;
    setCurrentStatus(formData.get("status") as string);
    try {
      await updateStatus(formData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setCurrentStatus(originalStatus);
    }
  }

  return (
    <main className="h-full w-full ">
      <Container>
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-4">
            Invoices {invoice.id}
            <Badge
              className={cn({
                "bg-blue-500": currentStatus === "open",
                "bg-green-600": currentStatus === "paid",
                "bg-zinc-700": currentStatus === "void",
                "bg-red-600": currentStatus === "uncollectible",
              })}
            >
              {invoice.status}
            </Badge>
          </h1>
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  Change status
                  <ChevronDown className="w-4 h-full"></ChevronDown>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {AVAILABLE_STATUSES.map((status) => (
                  <DropdownMenuItem key={status.id}>
                    <form action={handleOnUpdateStatus}>
                      <input type="hidden" name="id" value={invoice.id} />
                      <input type="hidden" name="status" value={status.id} />
                      <button>{status.label}</button>
                    </form>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <span className="sr-only">More options</span>
                    <Ellipsis className="w-4 h-auto"></Ellipsis>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-2">
                        <Trash2 className="w-4 h-auto"></Trash2>
                        Delete Invoice
                      </button>
                    </DialogTrigger>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href={`/invoices/${invoice.id}/payment`}
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-auto"></CreditCard>
                      Payment
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    Delete invoice ?
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your invoice and remove your data from our servers.
                  </DialogDescription>
                  <DialogFooter>
                    <form
                      className="flex justify-center"
                      action={deleteInvoiceAction}
                    >
                      <input type="hidden" name="id" value={invoice.id} />
                      <Button
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-auto"></Trash2>
                        Delete Invoice
                      </Button>
                    </form>
                  </DialogFooter>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <p className="text-3xl mb-3">${(invoice.value / 100).toFixed(2)}</p>

        <p className="text-lg mb-8">{invoice.description}</p>

        <h2 className="font-bold text-lg mb-4">Billing Details</h2>
        <ul className="grid gap-2">
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Invoice ID :
            </strong>
            <span>{invoice.id}</span>
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
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              <span>Billing Email : </span>
            </strong>
            <span>{invoice.customer.email}</span>
          </li>
        </ul>
      </Container>
    </main>
  );
}
