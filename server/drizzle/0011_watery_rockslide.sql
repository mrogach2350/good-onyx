ALTER TABLE "vehicles_to_lists" DROP CONSTRAINT "vehicles_to_lists_vehicleId_vehicles_id_fk";
--> statement-breakpoint
ALTER TABLE "vehicles_to_lists" DROP CONSTRAINT "vehicles_to_lists_listId_lists_id_fk";
--> statement-breakpoint
ALTER TABLE "vehicles_to_lists" ADD CONSTRAINT "vehicles_to_lists_vehicleId_vehicles_id_fk" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles_to_lists" ADD CONSTRAINT "vehicles_to_lists_listId_lists_id_fk" FOREIGN KEY ("listId") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;