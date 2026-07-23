-- =================================================================================
-- Task Management System - Example Seed Data (PostgreSQL)
-- =================================================================================
-- Warning: Ensure you have corresponding tables before running these inserts.
-- IDs are hardcoded UUIDs for relationship consistency.
-- =================================================================================

-- Create a dummy user
-- PasswordHash is a BCrypt hash for "Password123!"
INSERT INTO "Users" ("Id", "FirstName", "LastName", "Email", "PasswordHash")
VALUES 
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Ahmet', 'Yılmaz', 'ahmet@example.com', '$2a$11$0FfX1YyZ7w7oH8Z3G1N1.OSv7q.H9O5QZ1x9Vw9p6r3N9K8Q1R2');

-- Create sample categories for this user
INSERT INTO "Categories" ("Id", "Name", "Color", "UserId")
VALUES 
('11111111-2222-3333-4444-555555555555', 'İş', '#e57373', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
('22222222-3333-4444-5555-666666666666', 'Ev', '#64b5f6', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
('33333333-4444-5555-6666-777777777777', 'Kişisel', '#81c784', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');

-- Create some tasks
-- Priority: 1=Low, 2=Normal, 3=High, 4=Urgent, 5=Critical
-- Status: 0=Pending, 1=InProgress, 2=Completed, 3=Cancelled
INSERT INTO "TaskItems" ("Id", "Title", "Description", "Priority", "Status", "DueDate", "UserId", "CategoryId")
VALUES 
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Haftalık Raporu Hazırla', 'Projenin haftalık ilerleme raporu hazırlanıp yönetime sunulacak.', 4, 1, '2026-12-31 17:00:00+00', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '11111111-2222-3333-4444-555555555555'),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'Market Alışverişi', 'Süt, yumurta, ekmek, kahve alınacak.', 2, 0, NULL, 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '22222222-3333-4444-5555-666666666666'),
('cccccccc-dddd-eeee-ffff-000000000000', 'Spora Git', 'Haftada en az 3 gün spor yapılmalı.', 3, 2, '2026-07-20 09:00:00+00', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '33333333-4444-5555-6666-777777777777');

-- Add some comments
INSERT INTO "TaskComments" ("Id", "Comment", "TaskItemId", "UserId")
VALUES 
(gen_random_uuid(), 'Rapor taslağı neredeyse bitti, sadece grafikler eksik.', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
(gen_random_uuid(), 'Marketten alınacaklar listesine deterjan da eklendi.', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');
