-- Seed: productos de ejemplo para Teo Comidas
insert into productos (nombre, descripcion, precio, imagen_url, categoria, disponible, orden) values
  -- Desayuno
  ('Café con medialunas', 'Café de especialidad + 3 medialunas de manteca', 3500, '/img/cafe-medialunas.jpg', 'desayuno', true, 1),
  ('Tostado de jamón y queso', 'Pan de masa madre, jamón cocido y queso en plancha', 4000, '/img/tostado-jyq.jpg', 'desayuno', true, 2),

  -- Almuerzo
  ('Pizza muzzarella', 'Masa madre, salsa de tomate casera y muzzarella', 7500, '/img/pizza-muzza.jpg', 'almuerzo', true, 1),
  ('Pizza fugazzeta', 'Masa madre con cebolla caramelizada y muzzarella', 8000, '/img/pizza-fuga.jpg', 'almuerzo', true, 2),
  ('Sanguche de bondiola', 'Bondiola braseada, cebolla crispy y chimichurri en pan de masa madre', 6500, '/img/sanguche-bondiola.jpg', 'almuerzo', true, 3),

  -- Merienda
  ('Focaccia con jamón crudo', 'Focaccia de masa madre, jamón crudo, rúcula y parmesano', 5500, '/img/focaccia-jc.jpg', 'merienda', true, 1),
  ('Café doble', 'Espresso doble de especialidad', 2500, '/img/cafe-doble.jpg', 'merienda', true, 2),

  -- Cena
  ('Pizza napolitana', 'Masa madre, tomate, muzzarella, anchoas y aceitunas', 8500, '/img/pizza-napo.jpg', 'cena', true, 1),
  ('Focaccia rellena', 'Focaccia de masa madre rellena de jamón, queso y morrones asados', 7000, '/img/focaccia-rellena.jpg', 'cena', true, 2),
  ('Sanguche de milanesa', 'Milanesa de ternera, lechuga, tomate y mayonesa casera', 7000, '/img/sanguche-mila.jpg', 'cena', true, 3);
