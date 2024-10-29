ALTER TABLE "customers" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "organizationId" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "organizationId" text;