-- Seed inicial para D1 (rode uma vez: npm run d1:seed)

INSERT OR REPLACE INTO "Admin" ("id", "passwordHash")
VALUES ('admin', '$2b$10$4eksGQhGB0RMFLq/V1YTA.RCMog9RqflgvKC25EI.Hk7hSYtdCfp.');

INSERT OR REPLACE INTO "Settings" (
  "id", "storeName", "pixKey", "whatsapp", "themeColor", "logoUrl",
  "emptyMessage", "aboutText", "address", "hours"
) VALUES (
  'default', 'Doces da Maria', '', '5519971675276', '#b45309', '',
  '', '', '', ''
);

INSERT OR IGNORE INTO "Product" (
  "id", "name", "price", "imageUrl", "pixBrCode", "promoText",
  "quantity", "isActive", "isFeatured", "sortOrder"
) VALUES
  ('seed-coxinha', 'Coxinha', 800, 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&auto=format&fit=crop&q=80', '', '', 5, 1, 0, 0),
  ('seed-brigadeiro', 'Brigadeiro', 500, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80', '', '', 8, 1, 0, 1),
  ('seed-bolo', 'Bolo (fatia)', 1200, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80', '', '', 2, 1, 0, 2);

INSERT OR REPLACE INTO "Product" (
  "id", "name", "price", "imageUrl", "pixBrCode", "promoText",
  "quantity", "isActive", "isFeatured", "sortOrder"
) VALUES (
  'seed-empada', 'Empada de frango', 700,
  'https://images.unsplash.com/photo-1773831061318-490f04ee6e07?w=800&auto=format&fit=crop&q=80',
  '', '1 empada R$7', 12, 1, 1, -1
);
