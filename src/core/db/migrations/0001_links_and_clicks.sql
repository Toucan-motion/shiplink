CREATE TABLE "click" (
	"id" text PRIMARY KEY NOT NULL,
	"link_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"referrer_host" text,
	"country" text,
	"device" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "link" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"destination" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "link_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "click" ADD CONSTRAINT "click_link_id_link_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."link"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link" ADD CONSTRAINT "link_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "click_link_id_created_at_idx" ON "click" USING btree ("link_id","created_at");--> statement-breakpoint
CREATE INDEX "link_user_id_idx" ON "link" USING btree ("user_id");