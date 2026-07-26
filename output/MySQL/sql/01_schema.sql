-- MySQL 8.x 学习库：企业订单案例表结构
-- 本脚本不会删除已有数据库或表，可重复执行 CREATE IF NOT EXISTS。

CREATE DATABASE IF NOT EXISTS mysql_learning
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE mysql_learning;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户主键',
  email VARCHAR(255) NOT NULL COMMENT '登录邮箱，全局唯一',
  username VARCHAR(80) NOT NULL COMMENT '用户显示名称',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希，禁止保存明文',
  status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'active/disabled',
  last_login_at DATETIME(3) NULL COMMENT '最后登录时间',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_status_created (status, created_at),
  CONSTRAINT chk_users_status CHECK (status IN ('active', 'disabled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='用户表';

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类主键',
  parent_id BIGINT UNSIGNED NULL COMMENT '父分类主键，NULL 表示根分类',
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  category_code VARCHAR(50) NOT NULL COMMENT '稳定业务编码',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '同级排序值',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_categories_code (category_code),
  KEY idx_categories_parent_sort (parent_id, sort_order, id),
  CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='商品分类表';

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商品主键',
  category_id BIGINT UNSIGNED NOT NULL COMMENT '所属分类',
  product_code VARCHAR(64) NOT NULL COMMENT '商品业务编码',
  name VARCHAR(200) NOT NULL COMMENT '商品名称',
  price DECIMAL(12, 2) NOT NULL COMMENT '当前销售价，单位元',
  stock INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '当前可用库存',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT 'draft/on_sale/off_sale',
  extra_attributes JSON NULL COMMENT '低频扩展属性',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_products_code (product_code),
  KEY idx_products_category_status_created
    (category_id, status, created_at),
  KEY idx_products_status_price (status, price),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_status
    CHECK (status IN ('draft', 'on_sale', 'off_sale'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='商品表';

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单主键',
  order_no VARCHAR(40) NOT NULL COMMENT '公开订单号',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '下单用户',
  idempotency_key VARCHAR(100) NULL COMMENT '客户端幂等键',
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    COMMENT 'pending/paid/shipped/completed/cancelled',
  total_amount DECIMAL(12, 2) NOT NULL COMMENT '订单最终金额，单位元',
  shipping_address JSON NULL COMMENT '下单时收货地址快照',
  paid_at DATETIME(3) NULL,
  shipped_at DATETIME(3) NULL,
  completed_at DATETIME(3) NULL,
  cancelled_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_orders_order_no (order_no),
  UNIQUE KEY uk_orders_user_idempotency (user_id, idempotency_key),
  KEY idx_orders_user_created_id (user_id, created_at, id),
  KEY idx_orders_user_status_created_id
    (user_id, status, created_at, id),
  KEY idx_orders_status_created (status, created_at),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_orders_amount CHECK (total_amount >= 0),
  CONSTRAINT chk_orders_status CHECK (
    status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='订单主表';

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单明细主键',
  order_id BIGINT UNSIGNED NOT NULL COMMENT '订单主键',
  product_id BIGINT UNSIGNED NOT NULL COMMENT '关联商品主键',
  product_name_snapshot VARCHAR(200) NOT NULL COMMENT '成交时商品名称',
  unit_price DECIMAL(12, 2) NOT NULL COMMENT '成交单价，单位元',
  quantity INT UNSIGNED NOT NULL COMMENT '购买数量',
  line_amount DECIMAL(12, 2) NOT NULL COMMENT '明细金额，单位元',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_items_order_product (order_id, product_id),
  KEY idx_order_items_product_order (product_id, order_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_items_unit_price CHECK (unit_price >= 0),
  CONSTRAINT chk_order_items_line_amount CHECK (line_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='订单商品明细表';

CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '库存流水主键',
  product_id BIGINT UNSIGNED NOT NULL COMMENT '商品主键',
  order_id BIGINT UNSIGNED NULL COMMENT '关联订单，可空',
  movement_type VARCHAR(20) NOT NULL
    COMMENT 'order_deduct/order_release/manual_adjust',
  quantity_delta INT NOT NULL COMMENT '库存变化，扣减为负，增加为正',
  stock_after INT UNSIGNED NOT NULL COMMENT '变化后的库存快照',
  remark VARCHAR(255) NULL COMMENT '调整原因',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_stock_movements_product_created (product_id, created_at),
  KEY idx_stock_movements_order (order_id),
  CONSTRAINT fk_stock_movements_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_stock_movements_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_stock_movements_type CHECK (
    movement_type IN ('order_deduct', 'order_release', 'manual_adjust')
  ),
  CONSTRAINT chk_stock_movements_delta CHECK (quantity_delta <> 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='库存变更流水';

CREATE TABLE IF NOT EXISTS outbox_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '事件主键',
  event_id CHAR(36) NOT NULL COMMENT '事件全局唯一 ID',
  aggregate_type VARCHAR(50) NOT NULL COMMENT '聚合类型，如 order',
  aggregate_id VARCHAR(64) NOT NULL COMMENT '聚合业务 ID',
  event_type VARCHAR(100) NOT NULL COMMENT '事件类型',
  payload JSON NOT NULL COMMENT '事件数据',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/published/failed',
  retry_count INT UNSIGNED NOT NULL DEFAULT 0,
  published_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_outbox_events_event_id (event_id),
  KEY idx_outbox_events_status_created (status, created_at),
  CONSTRAINT chk_outbox_events_status
    CHECK (status IN ('pending', 'published', 'failed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='事务发件箱事件表';

SHOW TABLES;

