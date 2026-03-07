-- CreateTable
CREATE TABLE "supporters" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_hash" TEXT,
    "country" TEXT NOT NULL,
    "affiliation" TEXT,
    "consent_given" BOOLEAN NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT true,
    "is_initial_supporter" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_hash" TEXT,
    "user_agent_hash" TEXT,

    CONSTRAINT "supporters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "supporters_email_key" ON "supporters"("email");

-- CreateIndex
CREATE INDEX "supporters_email_idx" ON "supporters"("email");

-- CreateIndex
CREATE INDEX "supporters_is_approved_created_at_idx" ON "supporters"("is_approved", "created_at");

-- CreateIndex
CREATE INDEX "supporters_is_initial_supporter_idx" ON "supporters"("is_initial_supporter");
