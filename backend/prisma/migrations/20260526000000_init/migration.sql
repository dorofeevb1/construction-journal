CREATE TABLE "WorkType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "WorkType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "journal_entries" (
    "id" SERIAL NOT NULL,
    "work_date" DATE NOT NULL,
    "volume" DECIMAL(12,3) NOT NULL,
    "unit" VARCHAR(32) NOT NULL,
    "worker_name" VARCHAR(255) NOT NULL,
    "work_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkType_name_key" ON "WorkType"("name");
CREATE INDEX "journal_entries_work_date_idx" ON "journal_entries"("work_date");

ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_work_type_id_fkey"
    FOREIGN KEY ("work_type_id") REFERENCES "WorkType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
