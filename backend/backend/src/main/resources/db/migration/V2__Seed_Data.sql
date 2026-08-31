INSERT INTO customers (name, code, contact_email, contact_phone, address) VALUES
('ACME Corporation', 'CUST_001', 'contact@acme.com', '+1-555-0100', '123 Business Ave, New York'),
('Tech Innovations Inc', 'CUST_002', 'hello@techinnovations.com', '+1-555-0200', '456 Innovation St, San Francisco');

INSERT INTO users (email, name, password_hash, role, active, customer_id) VALUES
('dispatcher@meridian.com', 'John Dispatcher', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DISPATCHER', true, NULL),
('technician@meridian.com', 'Mike Technician', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'TECHNICIAN', true, NULL),
('manager@meridian.com', 'Sarah Manager', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MANAGER', true, NULL),
('customer@acme.com', 'Alice Customer', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', true, 1),
('customer2@techinnovations.com', 'Bob Customer', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', true, 2);

INSERT INTO sites (name, address, city, postcode, contact_person, contact_phone, customer_id) VALUES
('ACME Manhattan Office', '123 Business Ave', 'New York', '10001', 'John Smith', '+1-555-0110', 1),
('ACME Brooklyn Warehouse', '789 Industrial Rd', 'Brooklyn', '11201', 'Jane Doe', '+1-555-0120', 1),
('Tech SF Campus', '100 Silicon Valley Blvd', 'San Francisco', '94105', 'Mike Johnson', '+1-415-0100', 2);

INSERT INTO parts (sku, name, description, unit_cost, stock_quantity, min_stock_level) VALUES
('PART_HVAC_001', 'HVAC Filter 16x25x1', 'Standard air filter', 12.50, 150, 20),
('PART_HVAC_002', 'Compressor Unit', 'AC compressor replacement', 450.00, 8, 2),
('PART_ELEC_001', 'Circuit Breaker 20A', '20 Amp circuit breaker', 45.00, 75, 10),
('PART_PLUMB_001', 'PVC Pipe 1 inch', 'PVC piping per meter', 8.75, 200, 30),
('PART_PLUMB_002', 'Water Valve', 'Main water supply valve', 65.00, 25, 5);

INSERT INTO work_orders (code, title, description, status, priority, customer_id, site_id, assigned_to_id, sla_due_date, sla_breached) VALUES
('WO-2025-00001', 'HVAC Annual Maintenance', 'Routine HVAC maintenance and filter change', 'NEW', 'MEDIUM', 1, 1, NULL, NULL, false),
('WO-2025-00002', 'Electrical Panel Repair', 'Fix circuit breaker issues in main panel', 'ASSIGNED', 'HIGH', 1, 1, 2, NOW() + INTERVAL '8 hours', false),
('WO-2025-00003', 'Plumbing Inspection', 'Water system inspection and pressure check', 'IN_PROGRESS', 'MEDIUM', 2, 3, 2, NOW() + INTERVAL '24 hours', false),
('WO-2025-00004', 'Emergency AC Unit Failure', 'Urgent AC unit failure', 'ASSIGNED', 'URGENT', 1, 2, 2, NOW() - INTERVAL '2 hours', true);

INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by_id, note) VALUES
(1, 'NEW', 'NEW', 1, 'Work order created'),
(2, 'NEW', 'ASSIGNED', 1, 'Assigned to Mike Technician'),
(3, 'NEW', 'ASSIGNED', 1, 'Assigned to Mike Technician'),
(3, 'ASSIGNED', 'IN_PROGRESS', 2, 'Started work on site'),
(4, 'NEW', 'ASSIGNED', 3, 'Emergency escalation');
