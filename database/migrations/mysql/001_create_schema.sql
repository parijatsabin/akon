-- ============================================================
-- Migration: 001_create_schema
-- Provider:  MySQL 8.0+
-- Description: Full ANOK schema for MySQL.
--   Same logical structure as Postgres/Supabase.
--   Differences: no arrays (JSON instead), no citext (COLLATE),
--   no UUID default (use uuid() function), ENUM inline.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
    `id`                CHAR(36)     NOT NULL DEFAULT (UUID()),
    `email`             VARCHAR(320) NOT NULL COLLATE utf8mb4_unicode_ci,
    `password_hash`     TEXT         NOT NULL,
    `user_type`         ENUM('customer','admin') NOT NULL DEFAULT 'customer',
    `first_name`        VARCHAR(100),
    `last_name`         VARCHAR(100),
    `phone`             VARCHAR(20),
    `avatar_url`        TEXT,
    `is_active`         TINYINT(1)   NOT NULL DEFAULT 1,
    `is_email_verified` TINYINT(1)   NOT NULL DEFAULT 0,
    `created_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `last_login_at`     DATETIME,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── user_sessions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `user_sessions` (
    `id`            CHAR(36)  NOT NULL DEFAULT (UUID()),
    `user_id`       CHAR(36)  NOT NULL,
    `token_hash`    TEXT      NOT NULL,
    `expires_at`    DATETIME  NOT NULL,
    `created_at`    DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ip_address`    VARCHAR(45),
    `user_agent`    TEXT,
    PRIMARY KEY (`id`),
    KEY `idx_sessions_user_id` (`user_id`),
    KEY `idx_sessions_expires_at` (`expires_at`),
    CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── site_content ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `site_content` (
    `id`            INT          NOT NULL AUTO_INCREMENT,
    `section`       VARCHAR(100) NOT NULL,
    `content`       JSON         NOT NULL,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `updated_by`    CHAR(36),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_site_content_section` (`section`),
    KEY `idx_site_content_section` (`section`),
    CONSTRAINT `fk_site_content_user` FOREIGN KEY (`updated_by`)
        REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── products ──────────────────────────────────────────────────
-- MySQL has no array type — fragrance notes stored as JSON arrays
CREATE TABLE IF NOT EXISTS `products` (
    `id`            CHAR(36)     NOT NULL DEFAULT (UUID()),
    `slug`          VARCHAR(200) NOT NULL,
    `name`          VARCHAR(200) NOT NULL,
    `collection`    ENUM(
                        'Signature Collection','Luxury Collection',
                        'Limited Edition','Seasonal Fragrances'
                    ) NOT NULL,
    `description`   TEXT,
    `price_npr`     INT          NOT NULL,
    `badge`         VARCHAR(100),
    `accent_color`  VARCHAR(20)  NOT NULL DEFAULT '#a27f3f',
    `image_url`     TEXT         NOT NULL,
    `product_url`   TEXT         NOT NULL,
    -- JSON arrays e.g. ["Bergamot","Pink Pepper"]
    `notes_top`     JSON         NOT NULL,
    `notes_heart`   JSON         NOT NULL,
    `notes_base`    JSON         NOT NULL,
    `sort_order`    INT          NOT NULL DEFAULT 0,
    `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_products_slug` (`slug`),
    KEY `idx_products_collection`  (`collection`),
    KEY `idx_products_is_active`   (`is_active`),
    KEY `idx_products_sort_order`  (`sort_order`),
    CONSTRAINT `chk_products_price` CHECK (`price_npr` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── testimonials ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `testimonials` (
    `id`            INT          NOT NULL AUTO_INCREMENT,
    `quote`         TEXT         NOT NULL,
    `author_name`   VARCHAR(200) NOT NULL,
    `author_title`  VARCHAR(200),
    `rating`        TINYINT      NOT NULL DEFAULT 5,
    `sort_order`    INT          NOT NULL DEFAULT 0,
    `is_visible`    TINYINT(1)   NOT NULL DEFAULT 1,
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_testimonials_is_visible` (`is_visible`),
    CONSTRAINT `chk_testimonials_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── newsletter_subscribers ────────────────────────────────────
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
    `id`                CHAR(36)     NOT NULL DEFAULT (UUID()),
    `email`             VARCHAR(320) NOT NULL COLLATE utf8mb4_unicode_ci,
    `subscribed_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `is_active`         TINYINT(1)   NOT NULL DEFAULT 1,
    `unsubscribed_at`   DATETIME,
    `ip_address`        VARCHAR(45),
    `user_agent`        TEXT,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_newsletter_email` (`email`),
    KEY `idx_newsletter_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── orders ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `orders` (
    `id`                CHAR(36)     NOT NULL DEFAULT (UUID()),
    `order_number`      VARCHAR(30)  NOT NULL,
    `customer_id`       CHAR(36),
    `status`            ENUM('pending','confirmed','processing','shipped',
                             'delivered','cancelled','refunded')
                        NOT NULL DEFAULT 'pending',
    `subtotal_npr`      INT          NOT NULL,
    `shipping_npr`      INT          NOT NULL DEFAULT 0,
    `discount_npr`      INT          NOT NULL DEFAULT 0,
    `total_npr`         INT          NOT NULL,
    `shipping_address`  JSON         NOT NULL,
    `notes`             TEXT,
    `admin_notes`       TEXT,
    `created_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `confirmed_at`      DATETIME,
    `shipped_at`        DATETIME,
    `delivered_at`      DATETIME,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_orders_order_number` (`order_number`),
    KEY `idx_orders_customer_id`    (`customer_id`),
    KEY `idx_orders_status`         (`status`),
    KEY `idx_orders_created_at`     (`created_at`),
    CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`)
        REFERENCES `users`(`id`) ON DELETE SET NULL,
    CONSTRAINT `chk_orders_total` CHECK (
        `total_npr` = `subtotal_npr` + `shipping_npr` - `discount_npr`
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── order_items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `order_items` (
    `id`                CHAR(36)     NOT NULL DEFAULT (UUID()),
    `order_id`          CHAR(36)     NOT NULL,
    `product_id`        CHAR(36),
    `product_name`      VARCHAR(200) NOT NULL,
    `product_slug`      VARCHAR(200) NOT NULL,
    `collection`        VARCHAR(100) NOT NULL,
    `image_url`         TEXT         NOT NULL,
    `unit_price_npr`    INT          NOT NULL,
    `quantity`          INT          NOT NULL DEFAULT 1,
    `line_total_npr`    INT          NOT NULL,
    `created_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_order_items_order_id` (`order_id`),
    KEY `idx_order_items_product`  (`product_id`),
    CONSTRAINT `fk_order_items_order`   FOREIGN KEY (`order_id`)
        REFERENCES `orders`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`)
        REFERENCES `products`(`id`) ON DELETE SET NULL,
    CONSTRAINT `chk_order_items_qty`   CHECK (`quantity` > 0),
    CONSTRAINT `chk_order_items_total` CHECK (
        `line_total_npr` = `unit_price_npr` * `quantity`
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── customer_addresses ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `customer_addresses` (
    `id`            CHAR(36)     NOT NULL DEFAULT (UUID()),
    `user_id`       CHAR(36)     NOT NULL,
    `label`         VARCHAR(50)  NOT NULL DEFAULT 'Home',
    `full_name`     VARCHAR(200) NOT NULL,
    `phone`         VARCHAR(20)  NOT NULL,
    `address_line1` VARCHAR(300) NOT NULL,
    `address_line2` VARCHAR(300),
    `city`          VARCHAR(100) NOT NULL,
    `district`      VARCHAR(100),
    `province`      VARCHAR(100),
    `country`       VARCHAR(100) NOT NULL DEFAULT 'Nepal',
    `postal_code`   VARCHAR(20),
    `is_default`    TINYINT(1)   NOT NULL DEFAULT 0,
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_addresses_user_id` (`user_id`),
    CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── migration_history ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `migration_history` (
    `id`                INT          NOT NULL AUTO_INCREMENT,
    `migration_name`    VARCHAR(200) NOT NULL,
    `version`           VARCHAR(20)  NOT NULL,
    `executed_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `execution_time_ms` INT,
    `database_provider` VARCHAR(20)  NOT NULL,
    `status`            VARCHAR(20)  NOT NULL,
    `checksum`          VARCHAR(64)  NOT NULL,
    `error_message`     TEXT,
    `rolled_back_at`    DATETIME,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_migration_no_duplicate` (`migration_name`, `database_provider`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
