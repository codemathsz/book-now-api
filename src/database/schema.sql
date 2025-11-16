-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por email
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE time_slots (
  id SERIAL PRIMARY KEY,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  label VARCHAR(20) NOT NULL,
  max_tables INTEGER NOT NULL DEFAULT 6,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO time_slots (start_time, end_time, label, max_tables, is_active) VALUES
  ('12:00', '12:30', '12:00-12:30', 6, TRUE),
  ('12:30', '13:00', '12:30-13:00', 6, TRUE),
  ('13:00', '13:30', '13:00-13:30', 6, TRUE);


CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time_slot_id INTEGER NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  table_number INTEGER NOT NULL CHECK (table_number >= 1 AND table_number <= 6),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_time_slot_id ON reservations(time_slot_id);
CREATE INDEX idx_reservations_status ON reservations(status);

CREATE UNIQUE INDEX idx_reservations_unique_active 
  ON reservations(user_id, time_slot_id, date) 
  WHERE status = 'active';

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reservations_updated_at 
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Senha: admin123 (hash bcrypt)
INSERT INTO users (email, name, password, role) VALUES
  ('admin@booknow.com', 'Administrador', '$2b$10$8Z0qJYxKZ0qJYxKZ0qJYxO8Z0qJYxKZ0qJYxKZ0qJYxKZ0qJYxKZ0', 'admin');

-- NOTA: Você precisará gerar o hash real da senha usando bcrypt
-- Em Node.js: const hash = await bcrypt.hash('admin123', 10);
-- Substitua o hash acima pelo hash real antes de executar

-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Policy: Time slots são públicos (leitura)
CREATE POLICY "Time slots are viewable by everyone" ON time_slots
  FOR SELECT USING (is_active = TRUE);

-- Policy: Usuários podem ler suas próprias reservas
CREATE POLICY "Users can read own reservations" ON reservations
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Usuários podem criar suas próprias reservas
CREATE POLICY "Users can create own reservations" ON reservations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Usuários podem atualizar (cancelar) suas próprias reservas
CREATE POLICY "Users can update own reservations" ON reservations
  FOR UPDATE USING (auth.uid()::text = user_id::text);