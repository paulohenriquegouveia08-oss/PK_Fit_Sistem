-- Create Enum for Role
-- Note: Postgres enums are case sensitive. Using standard text for compatibility but constraint ensures validity.
DROP TYPE IF EXISTS "Role" CASCADE;
CREATE TYPE "Role" AS ENUM ('ADMIN_GLOBAL', 'ADMIN_ACADEMIA', 'PROFESSOR', 'PERSONAL', 'ALUNO');

-- Create Academy Table
CREATE TABLE "Academy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Academy_pkey" PRIMARY KEY ("id")
);

-- Create User Table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ALUNO',
    "academy_id" TEXT,
    "first_access" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Unique Constraint on Academy CNPJ
CREATE UNIQUE INDEX "Academy_cnpj_key" ON "Academy"("cnpj");

-- Create Unique Constraint on User Email
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Add Foreign Key for User -> Academy
ALTER TABLE "User" ADD CONSTRAINT "User_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seed Global Admin
INSERT INTO "User" ("id", "name", "email", "password_hash", "role", "first_access", "updated_at")
VALUES (
    gen_random_uuid(),
    'Admin Global',
    'paulohenriquegouveia08@gmail.com',
    crypt('15Paulohg', gen_salt('bf')),
    'ADMIN_GLOBAL',
    false,
    CURRENT_TIMESTAMP
);
