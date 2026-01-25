-- DropTable (удаляем старую таблицу notes)
DROP TABLE IF EXISTS "notes";

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_type_id" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zapis" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "trans" TEXT NOT NULL,
    "srok_dost" TIMESTAMP(3),
    "dat_obr" TIMESTAMP(3),
    "tim_obr" TEXT,
    "dat_razm" TIMESTAMP(3),
    "tim_razm" TEXT,
    "telephon" TEXT,

    CONSTRAINT "zapis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_key" ON "categories"("category");

-- CreateIndex
CREATE INDEX "zapis_name_idx" ON "zapis"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_type_id_fkey" FOREIGN KEY ("user_type_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
