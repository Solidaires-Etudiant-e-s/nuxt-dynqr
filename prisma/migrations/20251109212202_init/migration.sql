-- CreateTable
CREATE TABLE `dqr_users` (
    `username` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dqr_links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(64) NOT NULL,
    `url` TEXT NOT NULL,
    `owner_username` VARCHAR(191) NOT NULL,
    `visitCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dqr_links_slug_key`(`slug`),
    INDEX `dqr_links_owner_idx`(`owner_username`),
    INDEX `dqr_links_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `dqr_links` ADD CONSTRAINT `dqr_links_owner_username_fkey` FOREIGN KEY (`owner_username`) REFERENCES `dqr_users`(`username`) ON DELETE CASCADE ON UPDATE CASCADE;
