-- Replace old mesto_r labels with new ones in zapis and razgruzka
UPDATE "zapis" SET "mesto_r" = 'Без разгрузки' WHERE "mesto_r" = 'Другое';
UPDATE "zapis" SET "mesto_r" = 'Авто' WHERE "mesto_r" = 'Рампа1';
UPDATE "zapis" SET "mesto_r" = 'Склад' WHERE "mesto_r" = 'Рампа2';

UPDATE "razgruzka" SET "mesto_r" = 'Без разгрузки' WHERE "mesto_r" = 'Другое';
UPDATE "razgruzka" SET "mesto_r" = 'Авто' WHERE "mesto_r" = 'Рампа1';
UPDATE "razgruzka" SET "mesto_r" = 'Склад' WHERE "mesto_r" = 'Рампа2';

-- Set default for new rows
ALTER TABLE "zapis" ALTER COLUMN "mesto_r" SET DEFAULT 'Склад';
