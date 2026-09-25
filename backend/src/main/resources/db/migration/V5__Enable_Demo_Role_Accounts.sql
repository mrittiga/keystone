UPDATE users
SET active = true
WHERE email IN (
    'dispatcher@meridian.com',
    'technician@meridian.com',
    'manager@meridian.com',
    'customer@acme.com'
);