UPDATE users
SET active = true,
    password_hash = '$2a$10$ZGmzI3VM2q0UTz1nA40YGObNvWk0WMvGVtBLQ0UjRBFh7WH4uAWOS'
WHERE email IN (
    'dispatcher@meridian.com',
    'technician@meridian.com',
    'manager@meridian.com',
    'customer@acme.com'
);