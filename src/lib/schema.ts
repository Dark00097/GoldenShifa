import { exec, row } from './db';

async function columnExists(tableName: string, columnName: string) {
  const result = await row<{ count: number }>(
    `
      SELECT COUNT(*) AS count
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
    `,
    [tableName, columnName]
  );
  return Number(result?.count || 0) > 0;
}

async function addColumnIfMissing(tableName: string, columnName: string, definition: string) {
  if (await columnExists(tableName, columnName)) return;
  await exec(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
}

export async function ensureSchema() {
  await addColumnIfMissing('Product', 'isComingSoon', 'isComingSoon TINYINT(1) NOT NULL DEFAULT 0 AFTER isActive');
  await addColumnIfMissing('OrderItem', 'productVariantId', 'productVariantId INT NULL AFTER productId');
  await addColumnIfMissing('OrderItem', 'variantLabel', 'variantLabel VARCHAR(80) NULL AFTER name');

  await exec(`
    CREATE TABLE IF NOT EXISTS ProductVariant (
      id INT NOT NULL AUTO_INCREMENT,
      productId INT NOT NULL,
      label VARCHAR(80) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      compareAt DECIMAL(10,2) NULL,
      isDefault TINYINT(1) NOT NULL DEFAULT 0,
      isActive TINYINT(1) NOT NULL DEFAULT 1,
      sortOrder INT NOT NULL DEFAULT 0,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY ProductVariant_productId_idx (productId),
      CONSTRAINT ProductVariant_productId_fk
        FOREIGN KEY (productId) REFERENCES Product(id)
        ON DELETE CASCADE
    )
  `);
}
