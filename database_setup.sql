-- Script de Configuración de la Base de Datos para Supabase (Don Pollo.WEB)

-- 1. Tabla de Menú / Productos
DROP TABLE IF EXISTS menu CASCADE;
CREATE TABLE menu (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  tags TEXT[],
  portions JSONB NOT NULL,
  has_types BOOLEAN DEFAULT FALSE,
  image_brasa TEXT,
  image_broaster TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Perfiles de Usuario
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Pedidos
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  delivery_method TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'PREPARANDO',
  estimated_time TEXT NOT NULL,
  has_discount BOOLEAN DEFAULT FALSE,
  discount_percent INT,
  subtotal NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en las tablas
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para Menu (lectura pública)
CREATE POLICY "Permitir lectura pública de menú" ON menu FOR SELECT USING (true);

-- Políticas de Seguridad para Profiles
CREATE POLICY "Permitir lectura de perfiles propios" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Permitir inserción de perfil propio" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Permitir actualización de perfil propio" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas de Seguridad para Orders
CREATE POLICY "Permitir lectura de pedidos propios" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Permitir inserción de pedidos propios" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir actualización de pedidos propios" ON orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Permitir borrado de pedidos propios" ON orders FOR DELETE USING (auth.uid() = user_id);

-- Poblar el Menú inicial
INSERT INTO menu (id, title, description, image_url, tags, portions, has_types, image_brasa, image_broaster) VALUES
('pollo', 'Pollo a tu Estilo', 'Elige entre nuestro clásico pollo jugoso A la Brasa o nuestro inconfundible pollo Broaster súper crujiente.', 'https://images.unsplash.com/photo-1517984055083-fd6e1e788e54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMGFuZCUyMHJvYXN0JTIwY2hpY2tlbnxlbnwxfHx8fDE3NzMxNzc3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080', ARRAY['Broaster', 'A la Brasa'], '[{"id": "1/4", "name": "Cuarto", "basePrice": 20}, {"id": "1/2", "name": "Medio", "basePrice": 38}, {"id": "1", "name": "Entero", "basePrice": 70}]'::jsonb, TRUE, 'https://images.unsplash.com/photo-1652545296882-cf7f118c4df5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJ1dmlhbiUyMHJvYXN0ZWQlMjBjaGlja2VufGVufDF8fHx8MTc3MzE3NDYzM3ww&ixlib=rb-4.1.0&q=80&w=1080', 'https://images.unsplash.com/photo-1672856399624-61b47d70d339?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmlzcHklMjBmcmllZCUyMGNoaWNrZW58ZW58MXx8fHwxNzczMTMyNTk1fDA&ixlib=rb-4.1.0&q=80&w=1080'),

('alitas', 'Alitas de Pollo', 'Cubeta de alitas doradas y crujientes. Perfectas para compartir o disfrutar solo.', 'https://images.unsplash.com/photo-1670688866261-db6697858df8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMGNoaWNrZW4lMjB3aW5ncyUyMGJ1Y2tldHxlbnwxfHx8fDE3NzMxNzUwNzB8MA&ixlib=rb-4.1.0&q=80&w=1080', ARRAY['Crujientes'], '[{"id": "6pz", "name": "6 Piezas", "basePrice": 25}, {"id": "12pz", "name": "12 Piezas", "basePrice": 45}]'::jsonb, FALSE, NULL, NULL),

('burger', 'Burguer Chicken', 'Pechuga de pollo broaster, verduras frescas, queso fundido y nuestras salsas especiales de la casa.', 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwYnVyZ2VyfGVufDF8fHx8MTc3MzE3NTA3MHww&ixlib=rb-4.1.0&q=80&w=1080', ARRAY['Favorito'], '[{"id": "simple", "name": "Simple", "basePrice": 18}, {"id": "doble", "name": "Doble Especial", "basePrice": 28}]'::jsonb, FALSE, NULL, NULL),

('nuggets', 'Nuggets de Pollo', 'Trocitos de pura pechuga de pollo, empanizados y fritos a la perfección. Ideales para los más peques.', 'https://images.unsplash.com/photo-1619881590738-a111d176d906?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwbnVnZ2V0c3xlbnwxfHx8fDE3NzMxMjM1MzR8MA&ixlib=rb-4.1.0&q=80&w=1080', ARRAY['Kids'], '[{"id": "6pz", "name": "6 Piezas", "basePrice": 15}, {"id": "10pz", "name": "10 Piezas", "basePrice": 22}]'::jsonb, FALSE, NULL, NULL),

('salchibroaster', 'Salchi-Broaster Especial', '¡Una montaña de sabor! Abundantes papas fritas bañadas con trozos de pollo broaster y salchichas.', 'https://images.unsplash.com/photo-1639744210631-209fce3e256c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2FkZWQlMjBmcmllc3xlbnwxfHx8fDE3NzMxNzc3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080', ARRAY['NUEVO', 'Gigante'], '[{"id": "personal", "name": "Personal", "basePrice": 20}, {"id": "familiar", "name": "Familiar", "basePrice": 35}]'::jsonb, FALSE, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  tags = EXCLUDED.tags,
  portions = EXCLUDED.portions,
  has_types = EXCLUDED.has_types,
  image_brasa = EXCLUDED.image_brasa,
  image_broaster = EXCLUDED.image_broaster;

-- 4. Tabla de Descuentos Usados por Usuario (Evita reutilización)
CREATE TABLE IF NOT EXISTS user_discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, code)
);

-- Si la tabla ya existe sin la columna order_id, la agregamos
ALTER TABLE user_discounts ADD COLUMN IF NOT EXISTS order_id TEXT REFERENCES orders(id) ON DELETE SET NULL;

ALTER TABLE user_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de descuentos propios" ON user_discounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Permitir inserción de descuentos propios" ON user_discounts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4.5 Tabla de Cupones Válidos del Sistema (para gestión y consulta)
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  discount_percent INT DEFAULT 5,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Si la tabla ya existe sin las columnas de uso, las agregamos
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT FALSE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS used_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS order_id TEXT REFERENCES orders(id) ON DELETE SET NULL;

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura pública de cupones" ON coupons;
CREATE POLICY "Permitir lectura pública de cupones" ON coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir actualización de cupones propios o libres" ON coupons;
CREATE POLICY "Permitir actualización de cupones propios o libres" ON coupons 
FOR UPDATE USING (
  is_used = false OR used_by = auth.uid()
) WITH CHECK (
  used_by = auth.uid()
);

-- Poblar los cupones iniciales si no existen
INSERT INTO coupons (code, discount_percent) VALUES
('POLLO5', 5), ('JEFE5', 5), ('SABOR5', 5), ('CRUJIENTE5', 5), ('DELICIOSO5', 5),
('OFERTA5', 5), ('BRASA5', 5), ('BROASTER5', 5), ('DONPOLLO5', 5), ('RICO5', 5),
('COMBO5', 5), ('FIESTA5', 5), ('FAMILIA5', 5), ('PAPA5', 5), ('ALITA5', 5),
('NUGGET5', 5), ('SALCHI5', 5), ('CHICKEN5', 5), ('EXPRESS5', 5), ('MENU5', 5),
('PECHUGA5', 5), ('MUSLO5', 5), ('PRESA5', 5), ('TROZOS5', 5), ('ENTERO5', 5),
('MITAD5', 5), ('CUARTO5', 5), ('CRISPY5', 5), ('GOLDEN5', 5), ('CAJITA5', 5),
('JUGOSO5', 5), ('TIERNO5', 5), ('DORADO5', 5), ('FRITO5', 5), ('SAZONADO5', 5),
('ESPECIAL5', 5), ('PREMIUM5', 5), ('MEGA5', 5), ('SUPER5', 5), ('MAXI5', 5),
('EXTRA5', 5), ('FILETE5', 5), ('CLASICO5', 5), ('NUEVO5', 5), ('FRESCO5', 5),
('CASERO5', 5), ('RAPIDO5', 5), ('CALIENTE5', 5), ('PICANTE5', 5), ('MASTER5', 5)
ON CONFLICT (code) DO NOTHING;

-- 5. Disparador (Trigger) para crear fila en Profiles automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'Usuario'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    'client'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
