-- Seed data for Mehedi Tailors And Fabrics

-- Insert admin user
INSERT INTO users (name, email, password_hash, phone, role) 
VALUES (
    'Admin User',
    'admin@meheditailors.com',
    '$2b$10$YourHashedPasswordHere', -- password: admin123
    '+8801712345678',
    'admin'
);

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Shirts', 'Formal and casual shirts for men', '/images/categories/shirts.jpg'),
('Pants', 'Trousers and jeans', '/images/categories/pants.jpg'),
('Suits', 'Formal suits and blazers', '/images/categories/suits.jpg'),
('Traditional', 'Panjabi, Sherwani, and traditional wear', '/images/categories/traditional.jpg'),
('Ladies Wear', 'Salwar Kameez, Sarees', '/images/categories/ladies.jpg'),
('Kids Wear', 'Clothing for children', '/images/categories/kids.jpg');

-- Insert sample products
INSERT INTO products (name, category_id, description, price, stock, size, color, fabric) 
SELECT 
    'Premium Cotton Shirt',
    id,
    'High-quality cotton shirt with premium stitching',
    1250.00,
    50,
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['White', 'Blue', 'Gray'],
    ARRAY['Cotton', 'Linen']
FROM categories WHERE name = 'Shirts' LIMIT 1;

INSERT INTO products (name, category_id, description, price, discount_price, stock, size, color, fabric) 
SELECT 
    'Formal Suit Set',
    id,
    'Complete 3-piece formal suit',
    8500.00,
    7999.00,
    25,
    ARRAY['M', 'L', 'XL', 'XXL'],
    ARRAY['Black', 'Navy Blue', 'Charcoal Gray'],
    ARRAY['Wool', 'Polyester Blend']
FROM categories WHERE name = 'Suits' LIMIT 1;

-- Insert sample worker
INSERT INTO workers (name, role, salary_type, salary_amount, phone) 
VALUES (
    'Abdul Karim',
    'Master Tailor',
    'fixed',
    35000.00,
    '+8801711111111'
);

-- Insert activity log
INSERT INTO activity_logs (user_id, action, description) 
SELECT id, 'SYSTEM_INIT', 'System initialized with seed data'
FROM users WHERE email = 'admin@meheditailors.com';
