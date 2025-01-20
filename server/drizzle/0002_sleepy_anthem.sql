ALTER TABLE "offers" RENAME COLUMN "offerCode" TO "code";--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "retrivedAt" SET DEFAULT now();