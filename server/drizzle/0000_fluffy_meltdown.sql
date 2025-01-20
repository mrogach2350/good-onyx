CREATE TABLE "auctions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auctions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"company" text,
	"url" text,
	"vehicleId" integer
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "offers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" integer,
	"retrivedAt" timestamp,
	"offerCode" text,
	"offeringCompany" text DEFAULT 'carmax',
	"validUntil" timestamp,
	"vehicleId" integer
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vehicles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text,
	"listNumber" text,
	"engine" text,
	"transmission" text,
	"make" text,
	"model" text,
	"mileage" integer,
	"vin" text NOT NULL,
	"year" integer,
	"url" text NOT NULL,
	"auctionId" integer
);
