SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `goldenshifa`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `goldenshifa`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Payment`;
DROP TABLE IF EXISTS `OrderItem`;
DROP TABLE IF EXISTS `Order`;
DROP TABLE IF EXISTS `Coupon`;
DROP TABLE IF EXISTS `Address`;
DROP TABLE IF EXISTS `CartItem`;
DROP TABLE IF EXISTS `Cart`;
DROP TABLE IF EXISTS `InventoryLog`;
DROP TABLE IF EXISTS `Inventory`;
DROP TABLE IF EXISTS `ProductImage`;
DROP TABLE IF EXISTS `Product`;
DROP TABLE IF EXISTS `Category`;
DROP TABLE IF EXISTS `Admin`;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `StoreSetting`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `User` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Admin` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Admin_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Category` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `imageUrl` VARCHAR(512) NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Product` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `shortDescription` VARCHAR(512) NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `compareAt` DECIMAL(10, 2) NULL,
  `imageUrl` VARCHAR(512) NULL,
  `origin` VARCHAR(191) NULL,
  `weight` VARCHAR(191) NULL,
  `isFeatured` TINYINT(1) NOT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `categoryId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Product_slug_key` (`slug`),
  KEY `Product_categoryId_idx` (`categoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ProductImage` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `productId` INT NOT NULL,
  `url` VARCHAR(512) NOT NULL,
  `alt` VARCHAR(191) NULL,
  `sortOrder` INT NOT NULL DEFAULT 0,
  `isPrimary` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ProductImage_productId_idx` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Inventory` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `productId` INT NOT NULL,
  `sku` VARCHAR(191) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `lowStockAt` INT NOT NULL DEFAULT 5,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Inventory_productId_key` (`productId`),
  UNIQUE KEY `Inventory_sku_key` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `InventoryLog` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `productId` INT NOT NULL,
  `action` ENUM('INITIAL', 'ADJUSTMENT', 'SALE', 'RESTOCK', 'RETURN') NOT NULL,
  `quantityBefore` INT NOT NULL,
  `quantityAfter` INT NOT NULL,
  `note` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `InventoryLog_productId_idx` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Cart` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Cart_userId_key` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `CartItem` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cartId` INT NOT NULL,
  `productId` INT NOT NULL,
  `quantity` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `CartItem_cartId_productId_key` (`cartId`, `productId`),
  KEY `CartItem_productId_idx` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Address` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `line1` VARCHAR(512) NOT NULL,
  `line2` VARCHAR(512) NULL,
  `city` VARCHAR(191) NOT NULL,
  `postalCode` VARCHAR(191) NULL,
  `country` VARCHAR(191) NOT NULL DEFAULT 'Tunisie',
  `isDefault` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Address_userId_idx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Coupon` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `discountType` ENUM('PERCENTAGE', 'FIXED') NOT NULL,
  `value` DECIMAL(10, 2) NOT NULL,
  `minimumAmount` DECIMAL(10, 2) NULL,
  `usageLimit` INT NULL,
  `usedCount` INT NOT NULL DEFAULT 0,
  `expiresAt` DATETIME(3) NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Coupon_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Order` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orderNumber` VARCHAR(191) NOT NULL,
  `userId` INT NULL,
  `addressId` INT NULL,
  `customerName` VARCHAR(191) NOT NULL,
  `customerEmail` VARCHAR(191) NOT NULL,
  `customerPhone` VARCHAR(191) NULL,
  `shippingLine1` VARCHAR(512) NOT NULL,
  `shippingCity` VARCHAR(191) NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `discountTotal` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `shippingTotal` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `total` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('PENDING', 'CONFIRMED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `couponId` INT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Order_orderNumber_key` (`orderNumber`),
  KEY `Order_userId_idx` (`userId`),
  KEY `Order_addressId_idx` (`addressId`),
  KEY `Order_couponId_idx` (`couponId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `OrderItem` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orderId` INT NOT NULL,
  `productId` INT NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL,
  `unitPrice` DECIMAL(10, 2) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `OrderItem_orderId_idx` (`orderId`),
  KEY `OrderItem_productId_idx` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Payment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orderId` INT NOT NULL,
  `provider` VARCHAR(191) NOT NULL DEFAULT 'manual',
  `status` ENUM('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `amount` DECIMAL(10, 2) NOT NULL,
  `reference` VARCHAR(191) NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payment_orderId_key` (`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `StoreSetting` (
  `id` INT NOT NULL DEFAULT 1,
  `deliveryFee` DECIMAL(10, 2) NOT NULL DEFAULT 7.00,
  `freeDelivery` TINYINT(1) NOT NULL DEFAULT 0,
  `paymentMethodLabel` VARCHAR(191) NOT NULL DEFAULT 'Paiement a la livraison',
  `paymentProvider` VARCHAR(191) NOT NULL DEFAULT 'cash_on_delivery',
  `homeHeroImageUrl` VARCHAR(512) NULL,
  `homeStoryImageUrl` VARCHAR(512) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Admin` (`id`, `name`, `email`, `password`, `role`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Administrateur GoldenShifa', 'admin@goldenshifa.com', '$2a$10$He07LM8f1.dadmDi7sGJYum1vm.E8hmOfJtJMhym5NuBr1fTcRZ26', 'ADMIN', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

INSERT INTO `StoreSetting`
  (`id`, `deliveryFee`, `freeDelivery`, `paymentMethodLabel`, `paymentProvider`, `homeHeroImageUrl`, `homeStoryImageUrl`, `createdAt`, `updatedAt`)
VALUES
  (1, 7.00, 0, 'Paiement a la livraison', 'cash_on_delivery', '/uploads/1778348867545-chatgpt-image-9-mai-2026-18-23-16.png', NULL, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

INSERT INTO `Category` (`id`, `name`, `slug`, `description`, `imageUrl`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Miels premium', 'miels-premium', 'Miels naturels haut de gamme aux saveurs riches et authentiques.', 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=80', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
(2, 'Produits de la ruche', 'produits-de-la-ruche', 'Pollen, propolis et specialites naturelles issues de la ruche.', 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1000&q=80', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
(3, 'Coffrets cadeaux', 'coffrets-cadeaux', 'Compositions elegantes pour offrir le meilleur de GoldenShifa.', 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=1000&q=80', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

INSERT INTO `Product`
  (`id`, `name`, `slug`, `shortDescription`, `description`, `price`, `compareAt`, `imageUrl`, `origin`, `weight`, `isFeatured`, `isActive`, `categoryId`, `createdAt`, `updatedAt`)
VALUES
  (1, 'Miel de jujubier royal', 'miel-de-jujubier-royal', 'Miel ambre intense, noble et delicatement boise.', 'Un miel de jujubier premium a la texture dense et au gout profond. Ideal pour une degustation pure, dans une infusion tiede ou comme cadeau naturel raffine.', 38.00, 45.00, 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=80', 'Ruchers du Sud', '500 g', 1, 1, 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (2, 'Miel de fleurs sauvages', 'miel-de-fleurs-sauvages', 'Miel floral doux et lumineux pour le quotidien.', 'Un miel naturel aux notes florales, parfait au petit-dejeuner, dans les desserts ou avec une tisane. Sa douceur en fait un indispensable familial.', 22.00, NULL, 'https://images.unsplash.com/photo-1578922794704-7bdd46f70ce0?auto=format&fit=crop&w=1000&q=80', 'Prairies naturelles', '500 g', 1, 1, 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (3, 'Miel d''eucalyptus', 'miel-d-eucalyptus', 'Miel aromatique aux notes fraiches et puissantes.', 'Un miel de caractere avec une finale fraiche, apprecie dans les boissons chaudes et les routines bien-etre pendant les saisons froides.', 27.50, NULL, 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1000&q=80', 'Forets d eucalyptus', '500 g', 0, 1, 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (4, 'Propolis naturelle', 'propolis-naturelle', 'Extrait naturel de propolis pour la routine bien-etre.', 'Une propolis selectionnee avec soin, issue des ruchers partenaires GoldenShifa. Format pratique pour une utilisation quotidienne.', 18.50, NULL, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=1000&q=80', 'Ruchers GoldenShifa', '30 ml', 0, 1, 2, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  (5, 'Coffret decouverte miel', 'coffret-decouverte-miel', 'Trois saveurs GoldenShifa dans un coffret elegant.', 'Un coffret cadeau reunissant une selection de miels naturels pour decouvrir plusieurs profils aromatiques et offrir une experience premium.', 49.00, 56.00, 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=1000&q=80', 'Selection GoldenShifa', '3 x 250 g', 1, 1, 3, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

INSERT INTO `ProductImage` (`id`, `productId`, `url`, `alt`, `sortOrder`, `isPrimary`, `createdAt`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=80', 'Miel de jujubier royal', 0, 1, CURRENT_TIMESTAMP(3)),
(2, 2, 'https://images.unsplash.com/photo-1578922794704-7bdd46f70ce0?auto=format&fit=crop&w=1000&q=80', 'Miel de fleurs sauvages', 0, 1, CURRENT_TIMESTAMP(3)),
(3, 3, 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1000&q=80', 'Miel d''eucalyptus', 0, 1, CURRENT_TIMESTAMP(3)),
(4, 4, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=1000&q=80', 'Propolis naturelle', 0, 1, CURRENT_TIMESTAMP(3)),
(5, 5, 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=1000&q=80', 'Coffret decouverte miel', 0, 1, CURRENT_TIMESTAMP(3));

INSERT INTO `Inventory` (`id`, `productId`, `sku`, `stock`, `lowStockAt`, `updatedAt`) VALUES
(1, 1, 'GS-MIEL-JUJUBIER-500', 24, 5, CURRENT_TIMESTAMP(3)),
(2, 2, 'GS-MIEL-FLEURS-500', 42, 5, CURRENT_TIMESTAMP(3)),
(3, 3, 'GS-MIEL-EUCALYPTUS-500', 30, 5, CURRENT_TIMESTAMP(3)),
(4, 4, 'GS-PROPOLIS-30', 36, 5, CURRENT_TIMESTAMP(3)),
(5, 5, 'GS-COFFRET-DECOUVERTE', 18, 5, CURRENT_TIMESTAMP(3));

INSERT INTO `InventoryLog` (`productId`, `action`, `quantityBefore`, `quantityAfter`, `note`, `createdAt`) VALUES
(1, 'INITIAL', 0, 24, 'Stock initial import SQL', CURRENT_TIMESTAMP(3)),
(2, 'INITIAL', 0, 42, 'Stock initial import SQL', CURRENT_TIMESTAMP(3)),
(3, 'INITIAL', 0, 30, 'Stock initial import SQL', CURRENT_TIMESTAMP(3)),
(4, 'INITIAL', 0, 36, 'Stock initial import SQL', CURRENT_TIMESTAMP(3)),
(5, 'INITIAL', 0, 18, 'Stock initial import SQL', CURRENT_TIMESTAMP(3));

INSERT INTO `Coupon`
  (`id`, `code`, `description`, `discountType`, `value`, `minimumAmount`, `usageLimit`, `usedCount`, `expiresAt`, `isActive`, `createdAt`, `updatedAt`)
VALUES
  (1, 'BIENVENUE10', 'Remise de bienvenue de 10%', 'PERCENTAGE', 10.00, 20.00, 200, 0, NULL, 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));
