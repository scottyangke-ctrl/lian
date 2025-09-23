CREATE TYPE "public"."side" AS ENUM('BUY', 'SELL');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "EMAStrategy" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategy_name" text,
	"symbol" text NOT NULL,
	"emaPeriod" integer DEFAULT 50 NOT NULL,
	"quantity" real NOT NULL,
	"priceOffset" real NOT NULL,
	"interval" text NOT NULL,
	"side" "side" NOT NULL,
	"checkInterval" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" "status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StrategyLog" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategy_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"action" text NOT NULL,
	"message" text,
	"details" jsonb
);
