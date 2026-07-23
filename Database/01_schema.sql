-- =================================================================================
-- Task Management System - Example Database Schema (PostgreSQL)
-- =================================================================================
-- Note: This project uses Entity Framework Core (Code-First). 
-- This script is provided purely for reference or manual database scaffolding.
-- =================================================================================

-- 1. Users Table
CREATE TABLE "Users" (
    "Id" UUID PRIMARY KEY,
    "FirstName" VARCHAR(100) NOT NULL,
    "LastName" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(200) NOT NULL UNIQUE,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE "Categories" (
    "Id" UUID PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Color" VARCHAR(20) DEFAULT '#9e9e9e',
    "UserId" UUID NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_Categories_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

-- 3. TaskItems Table
CREATE TABLE "TaskItems" (
    "Id" UUID PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT NULL,
    "Priority" INTEGER NOT NULL DEFAULT 1,
    "Status" INTEGER NOT NULL DEFAULT 0,
    "DueDate" TIMESTAMP WITH TIME ZONE NULL,
    "CompletedAt" TIMESTAMP WITH TIME ZONE NULL,
    "UserId" UUID NOT NULL,
    "CategoryId" UUID NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_TaskItems_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_TaskItems_Categories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES "Categories" ("Id") ON DELETE SET NULL
);

-- 4. TaskComments Table
CREATE TABLE "TaskComments" (
    "Id" UUID PRIMARY KEY,
    "Comment" TEXT NOT NULL,
    "TaskItemId" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_TaskComments_TaskItems_TaskItemId" FOREIGN KEY ("TaskItemId") REFERENCES "TaskItems" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_TaskComments_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

-- 5. TaskAttachments Table
CREATE TABLE "TaskAttachments" (
    "Id" UUID PRIMARY KEY,
    "FileName" VARCHAR(255) NOT NULL,
    "FilePath" VARCHAR(1000) NOT NULL,
    "ContentType" VARCHAR(100) NOT NULL,
    "FileSize" BIGINT NOT NULL,
    "TaskItemId" UUID NOT NULL,
    "UploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_TaskAttachments_TaskItems_TaskItemId" FOREIGN KEY ("TaskItemId") REFERENCES "TaskItems" ("Id") ON DELETE CASCADE
);
