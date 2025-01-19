CREATE TABLE "lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "vehicles_to_lists" (
	"vehicleId" integer NOT NULL,
	"listId" integer NOT NULL,
	CONSTRAINT "vehicles_to_lists_vehicleId_listId_pk" PRIMARY KEY("vehicleId","listId")
);
--> statement-breakpoint
ALTER TABLE "vehicles_to_lists" ADD CONSTRAINT "vehicles_to_lists_vehicleId_vehicles_id_fk" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles_to_lists" ADD CONSTRAINT "vehicles_to_lists_listId_lists_id_fk" FOREIGN KEY ("listId") REFERENCES "public"."lists"("id") ON DELETE no action ON UPDATE no action;