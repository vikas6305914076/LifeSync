CREATE DATABASE IF NOT EXISTS lifesyncdb;
USE lifesyncdb;

CREATE TABLE IF NOT EXISTS families (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    family_id BIGINT,
    family_role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    CONSTRAINT fk_user_family FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS family_invites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    family_id BIGINT NOT NULL,
    invited_by_user_id BIGINT NOT NULL,
    invited_email VARCHAR(150) NOT NULL,
    invite_token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_invite_family FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
    CONSTRAINT fk_invite_user FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    user_id BIGINT NOT NULL,
    family_id BIGINT,
    CONSTRAINT fk_expense_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_family FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    completed BOOLEAN NOT NULL,
    user_id BIGINT NOT NULL,
    family_id BIGINT,
    CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_family FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS groceries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    purchased BOOLEAN NOT NULL,
    user_id BIGINT NOT NULL,
    family_id BIGINT,
    CONSTRAINT fk_grocery_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_grocery_family FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medicines (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    reminder_time VARCHAR(100) NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_medicine_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
