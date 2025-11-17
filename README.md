# 🍽️ Book Now API - Desafio Fullstack Grupo Lucio

Sistema de reserva de mesas no refeitório - Backend API

## 🚀 Tecnologias

- Node.js + Express + TypeScript
- PostgreSQL (Supabase)
- JWT Authentication
- express-validator

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 🗄️ Configuração do Banco de Dados

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Execute o SQL em `src/database/schema.sql` no SQL Editor do Supabase
4. Copie a URL e a ANON KEY para o arquivo `.env`

## 🔌 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Informações do usuário logado

### Reservas
- `GET /api/reservations` - Listar minhas reservas
- `GET /api/reservations/availability?date=YYYY-MM-DD` - Ver disponibilidade
- `POST /api/reservations` - Criar reserva
- `DELETE /api/reservations/:id` - Cancelar reserva

### Dashboard (Admin)
- `GET /api/dashboard/overview?date=YYYY-MM-DD` - Estatísticas do dia
- `GET /api/dashboard/reservations?date=YYYY-MM-DD` - Todas as reservas

## 📋 Regras de Negócio

- 3 horários disponíveis: 12h-12h30, 12h30-13h, 13h-13h30
- 6 mesas por horário
- Máximo 1 reserva por horário por colaborador
- Máximo 2 horários por dia por colaborador
- Reservas vinculadas ao colaborador autenticado

## 🔐 Autenticação

A API utiliza JWT (Bearer Token). Inclua o token no header:

```
Authorization: Bearer seu-token-aqui
```
