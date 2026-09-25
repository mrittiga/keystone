UPDATE users
SET active = false
WHERE email IN (
    'dispatcher@meridian.com',
    'technician@meridian.com',
    'manager@meridian.com',
    'customer@acme.com',
    'customer2@techinnovations.com'
);
