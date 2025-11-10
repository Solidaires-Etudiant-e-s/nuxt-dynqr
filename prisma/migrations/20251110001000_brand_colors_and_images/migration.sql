ALTER TABLE `dqr_brands`
  ADD COLUMN `fg_color` VARCHAR(9) NULL,
  ADD COLUMN `bg_color` VARCHAR(9) NULL;

CREATE TABLE `dqr_brand_images` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `brand_id` INTEGER NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `dqr_brand_images` ADD CONSTRAINT `dqr_brand_images_brand_id_fkey`
  FOREIGN KEY (`brand_id`) REFERENCES `dqr_brands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

