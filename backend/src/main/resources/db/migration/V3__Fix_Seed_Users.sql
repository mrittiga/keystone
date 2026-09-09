-- Update passwords to 'Test@123' hash for all seed users
UPDATE users 
SET password_hash = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVym5p.o4Qf2gP3E42Jp/XOW' 
WHERE email IN ('manager@meridian.com', 'dispatcher@meridian.com', 'technician@meridian.com', 'customer@acme.com');

-- Add tech@meridian.com alias to support Vercel Quick Fill button
INSERT INTO users (email, name, password_hash, role, active, customer_id) 
VALUES ('tech@meridian.com', 'Mike Technician', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVym5p.o4Qf2gP3E42Jp/XOW', 'TECHNICIAN', true, NULL)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;
