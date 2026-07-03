-- Autolens seed data
-- Run AFTER schema.sql, in the Supabase SQL editor.
--
-- Creates two demo accounts (password for both: autolens-demo):
--   dealer@autolens.demo  -> Lena Whitfield, Summit Auto Group (dealer)
--   seller@autolens.demo  -> Marcus Okafor (private seller)
-- and 15 active listings with photos.
--
-- Listing photos hotlink to unsplash.com placeholders. Swap them for your
-- own uploads any time; real user uploads go to Supabase Storage as normal.

-- ---------------------------------------------------------------------------
-- Demo users
-- ---------------------------------------------------------------------------
insert into auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'dealer@autolens.demo',
    crypt('autolens-demo', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Lena Whitfield","account_type":"dealer"}',
    'authenticated', 'authenticated', now() - interval '120 days', now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'seller@autolens.demo',
    crypt('autolens-demo', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Marcus Okafor","account_type":"private"}',
    'authenticated', 'authenticated', now() - interval '95 days', now()
  );

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values
  (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{"sub":"00000000-0000-0000-0000-000000000001","email":"dealer@autolens.demo"}',
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '{"sub":"00000000-0000-0000-0000-000000000002","email":"seller@autolens.demo"}',
    'email', now(), now(), now()
  );

-- The on_auth_user_created trigger has already created bare profiles. Fill them in.
update profiles set
  dealer_name = 'Summit Auto Group',
  location = 'Boise, ID',
  phone = '(208) 555-0147',
  created_at = now() - interval '120 days'
where id = '00000000-0000-0000-0000-000000000001';

update profiles set
  location = 'Pocatello, ID',
  phone = '(208) 555-0193',
  created_at = now() - interval '95 days'
where id = '00000000-0000-0000-0000-000000000002';

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------
insert into listings (
  id, seller_id, title, make, model, year, price, mileage, fuel_type,
  transmission, body_type, colour, condition, description, location,
  status, views, created_at, updated_at
) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   '2019 Porsche 911 Carrera S', 'Porsche', '911 Carrera S', 2019, 94750, 23410,
   'petrol', 'automatic', 'coupe', 'GT Silver', 'used',
   'One-owner Carrera S with the Sport Chrono package, sport exhaust, and full service history at Porsche Boise. New rear tires at 21k. PPF on the full front end. Clean Carfax, no paint work.',
   'Boise, ID', 'active', 412, now() - interval '3 days', now() - interval '3 days'),

  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   '2017 Ford Mustang GT', 'Ford', 'Mustang GT', 2017, 31200, 48930,
   'petrol', 'manual', 'coupe', 'Race Red', 'used',
   '5.0 V8 with the 6-speed manual. Performance Package: Brembos, 3.73 Torsen diff, strut tower brace. Adult owned, never tracked, garage kept through winter. Records for every oil change since new.',
   'Pocatello, ID', 'active', 287, now() - interval '5 days', now() - interval '5 days'),

  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   '2021 Tesla Model 3 Long Range', 'Tesla', 'Model 3 Long Range', 2021, 33890, 31275,
   'electric', 'automatic', 'sedan', 'Red Multi-Coat', 'used',
   'Dual motor Long Range with 19in Sport Wheels and the all-black interior. Battery health report included: 92% of original capacity. Autopilot, heated seats all around, mobile charger included.',
   'Boise, ID', 'active', 366, now() - interval '2 days', now() - interval '2 days'),

  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   '2018 BMW M4 Competition', 'BMW', 'M4 Competition', 2018, 46500, 36820,
   'petrol', 'automatic', 'coupe', 'San Marino Blue', 'used',
   'Competition Package M4 with the DCT gearbox, carbon roof, and harman/kardon audio. Two owners, both serviced at BMW dealers. New front pads and rotors in March. Comes with a second set of winter wheels.',
   'Salt Lake City, UT', 'active', 298, now() - interval '7 days', now() - interval '7 days'),

  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002',
   '2020 Jeep Wrangler Unlimited Sahara', 'Jeep', 'Wrangler Unlimited Sahara', 2020, 38975, 29140,
   'petrol', 'automatic', 'suv', 'Firecracker Red', 'used',
   'Four-door Sahara with the hardtop and the cold weather group. Never off-roaded hard, mostly highway miles to the mountains. New all-terrains with under 5k on them. Tow package installed.',
   'Idaho Falls, ID', 'active', 245, now() - interval '9 days', now() - interval '9 days'),

  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
   '2016 Mercedes-Benz C300 4MATIC', 'Mercedes-Benz', 'C300', 2016, 21480, 61205,
   'petrol', 'automatic', 'sedan', 'Iridium Silver', 'used',
   'AWD C300 with the Premium 1 package: Burmester audio, blind spot assist, heated front seats. Fresh service B completed last month. Tires at 70%. Clean title, two previous owners.',
   'Boise, ID', 'active', 178, now() - interval '12 days', now() - interval '12 days'),

  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001',
   '2022 Toyota RAV4 Hybrid XLE', 'Toyota', 'RAV4 Hybrid XLE', 2022, 32640, 18090,
   'hybrid', 'automatic', 'suv', 'Lunar Rock', 'used',
   'One-owner hybrid RAV4 still under factory powertrain warranty. 40 mpg combined in real-world driving. Weather package with heated seats and steering wheel. Toyota Safety Sense 2.5.',
   'Twin Falls, ID', 'active', 203, now() - interval '4 days', now() - interval '4 days'),

  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002',
   '2015 Volkswagen Golf GTI SE', 'Volkswagen', 'Golf GTI', 2015, 14990, 78460,
   'petrol', 'manual', 'hatchback', 'Carbon Steel Gray', 'used',
   '6-speed manual GTI with the Performance Package (larger brakes, limited-slip diff). Timing chain tensioner updated, water pump replaced at 70k with receipts. Daily driven and maintained on schedule.',
   'Pocatello, ID', 'active', 156, now() - interval '15 days', now() - interval '15 days'),

  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001',
   '2019 Chevrolet Silverado 1500 LT', 'Chevrolet', 'Silverado 1500 LT', 2019, 34250, 52310,
   'petrol', 'automatic', 'truck', 'Northsky Blue', 'used',
   'Crew cab 4x4 with the 5.3L V8 and trailering package. Spray-in bedliner, soft tonneau cover, tow mirrors. One owner, no accidents, dealer maintained. Brake controller already wired.',
   'Ogden, UT', 'active', 221, now() - interval '8 days', now() - interval '8 days'),

  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002',
   '2018 Audi A4 Premium Plus', 'Audi', 'A4 Premium Plus', 2018, 24870, 44975,
   'petrol', 'automatic', 'sedan', 'Mythos Black', 'used',
   'Quattro A4 with Virtual Cockpit, B&O sound, and the cold weather package. New Continentals all around in the fall. Always garaged, non-smoker, no kids hauled in it. Selling because I bought a truck.',
   'Pocatello, ID', 'active', 142, now() - interval '11 days', now() - interval '11 days'),

  ('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001',
   '2023 Hyundai Ioniq 5 SEL', 'Hyundai', 'Ioniq 5 SEL', 2023, 36420, 9840,
   'electric', 'automatic', 'suv', 'Digital Teal', 'used',
   'AWD Ioniq 5 with under 10k miles, still under full factory warranty until 2028. 800V architecture charges 10 to 80% in about 18 minutes on a fast charger. Highway Driving Assist, heat pump equipped.',
   'Boise, ID', 'active', 318, now() - interval '1 day', now() - interval '1 day'),

  ('10000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002',
   '2014 Subaru Outback 2.5i Limited', 'Subaru', 'Outback 2.5i Limited', 2014, 12350, 96720,
   'petrol', 'automatic', 'wagon', 'Twilight Blue', 'used',
   'Head gaskets done at 88k with receipts, the one job every Outback buyer asks about. New battery and front struts this year. Heated leather, power liftgate, EyeSight. Honest car with life left in it.',
   'Idaho Falls, ID', 'active', 134, now() - interval '18 days', now() - interval '18 days'),

  ('10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001',
   '2020 Dodge Challenger R/T', 'Dodge', 'Challenger R/T', 2020, 33775, 27660,
   'petrol', 'manual', 'coupe', 'Go Mango', 'used',
   '5.7 HEMI with the 6-speed manual and the Performance Handling Group. Stock exhaust, never modified, never raced. Adult owned and stored under a cover. Cold A/C, new rear tires.',
   'Salt Lake City, UT', 'active', 264, now() - interval '6 days', now() - interval '6 days'),

  ('10000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000002',
   '2021 Honda CR-V EX-L', 'Honda', 'CR-V EX-L', 2021, 28940, 24505,
   'petrol', 'automatic', 'suv', 'Platinum White Pearl', 'used',
   'AWD EX-L with leather, moonroof, and Honda Sensing. One owner, bought new at the local Honda store and serviced there since. Transferable extended warranty through 2028 or 75k miles.',
   'Pocatello, ID', 'active', 189, now() - interval '10 days', now() - interval '10 days'),

  ('10000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000002',
   '2017 Mazda MX-5 Miata Grand Touring', 'Mazda', 'MX-5 Miata Grand Touring', 2017, 19860, 41230,
   'petrol', 'manual', 'convertible', 'Soul Red', 'used',
   'ND Miata with the 6-speed manual, heated leather, and Bose audio. Soft top in great shape, no leaks. Summer car only, stored every winter on a battery tender. New plugs and brake fluid flush this spring.',
   'Spokane, WA', 'active', 226, now() - interval '14 days', now() - interval '14 days');

-- ---------------------------------------------------------------------------
-- Listing images (Unsplash placeholders)
-- ---------------------------------------------------------------------------
insert into listing_images (listing_id, storage_path, url, position) values
  ('10000000-0000-0000-0000-000000000001', 'seed/porsche-911-1.jpg', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000001', 'seed/porsche-911-2.jpg', 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80', 1),
  ('10000000-0000-0000-0000-000000000002', 'seed/mustang-gt-1.jpg', 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000003', 'seed/model-3-1.jpg', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000004', 'seed/bmw-m4-1.jpg', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000005', 'seed/wrangler-1.jpg', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000006', 'seed/c300-1.jpg', 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000007', 'seed/rav4-1.jpg', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000008', 'seed/gti-1.jpg', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000009', 'seed/silverado-1.jpg', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000010', 'seed/a4-1.jpg', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000011', 'seed/ioniq5-1.jpg', 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000012', 'seed/outback-1.jpg', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000013', 'seed/challenger-1.jpg', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000014', 'seed/crv-1.jpg', 'https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1200&q=80', 0),
  ('10000000-0000-0000-0000-000000000015', 'seed/miata-1.jpg', 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80', 0);
