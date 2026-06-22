-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT 'Doces da Maria',
    "pixKey" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "themeColor" TEXT NOT NULL DEFAULT '#b45309',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "emptyMessage" TEXT NOT NULL DEFAULT '',
    "aboutText" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "hours" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Settings" ("emptyMessage", "id", "logoUrl", "pixKey", "storeName", "themeColor", "whatsapp") SELECT "emptyMessage", "id", "logoUrl", "pixKey", "storeName", "themeColor", "whatsapp" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
