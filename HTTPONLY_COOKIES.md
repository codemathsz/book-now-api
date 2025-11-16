# 🔒 Autenticação com HttpOnly Cookies - Guia Completo

## ✨ O que foi implementado

O sistema agora usa **httpOnly cookies** para autenticação JWT, que é **muito mais seguro** que localStorage!

### 🛡️ Benefícios de Segurança

- ✅ **Protege contra XSS** - JavaScript malicioso não consegue acessar o token
- ✅ **HttpOnly flag** - Cookie inacessível via `document.cookie`
- ✅ **Secure flag** (produção) - Enviado apenas em HTTPS
- ✅ **SameSite** - Previne CSRF attacks
- ✅ **Cookies gerenciados pelo navegador** - Mais seguro que localStorage

---

## 🔧 Configuração do Backend

### 1. Dependências
```bash
npm install cookie-parser
npm install --save-dev @types/cookie-parser
```

### 2. Server.ts
```typescript
import cookieParser from 'cookie-parser';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // ✅ Permite envio de cookies
}));
app.use(cookieParser());
```

### 3. Variável de Ambiente (.env)
```env
FRONTEND_URL=http://localhost:5173
```

---

## 📡 Endpoints da API

### POST /api/auth/register
**Registro de novo usuário**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@email.com",
    "name": "Nome do Usuário",
    "password": "senha123"
  }'
```

**Resposta:**
- Define cookie `token` (httpOnly)
- Retorna dados do usuário (SEM o token no JSON)

```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "name": "Nome do Usuário",
    "role": "user"
  }
}
```

---

### POST /api/auth/login
**Login de usuário**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "usuario@email.com",
    "password": "senha123"
  }'
```

**Resposta:**
- Define cookie `token` (httpOnly)
- Retorna dados do usuário

```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "name": "Nome do Usuário",
    "role": "user"
  }
}
```

**Cookie definido:**
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; 
            HttpOnly; 
            Max-Age=604800; 
            Path=/; 
            SameSite=Lax
```

---

### GET /api/auth/me
**Obter dados do usuário logado**

```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Resposta:**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "name": "Nome do Usuário",
    "role": "user",
    "created_at": "2024-11-15T10:00:00Z"
  }
}
```

---

### POST /api/auth/logout
**Logout (limpa o cookie)**

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

**Resposta:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

## 🌐 Configuração do Frontend (React)

### 1. Axios com Credentials

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true // ✅ IMPORTANTE! Envia cookies automaticamente
});

export default api;
```

### 2. Login

```typescript
// src/services/authService.ts
import api from './api';

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  // Cookie é automaticamente salvo pelo navegador
  return response.data.user;
};

export const register = async (name: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data.user;
};

export const logout = async () => {
  await api.post('/auth/logout');
  // Cookie é automaticamente removido
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data.user;
};
```

### 3. Context de Autenticação

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as loginService, logout as logoutService } from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se já está logado (cookie existe)
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await loginService(email, password);
    setUser(userData);
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 4. Protected Route

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
```

---

## 🧪 Testando com cURL

### 1. Login e salvar cookie
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"admin@booknow.com","password":"admin123"}'
```

### 2. Usar o cookie em requisições
```bash
# Ver minhas reservas
curl http://localhost:3000/api/reservations \
  -b cookies.txt

# Criar reserva
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"time_slot_id":1,"date":"2024-11-20"}'

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

---

## 🔐 Configurações do Cookie

### Desenvolvimento (localhost)
```javascript
{
  httpOnly: true,        // JavaScript não acessa
  secure: false,         // HTTP ok (não precisa HTTPS)
  sameSite: 'lax',      // Permite navegação normal
  maxAge: 604800000      // 7 dias em ms
}
```

### Produção (HTTPS)
```javascript
{
  httpOnly: true,        // JavaScript não acessa
  secure: true,          // Apenas HTTPS
  sameSite: 'strict',   // Máxima proteção
  maxAge: 604800000      // 7 dias em ms
}
```

---

## ⚠️ Importante: CORS

Para cookies funcionarem entre domínios diferentes (mesmo localhost com portas diferentes), você precisa:

**Backend:**
```typescript
app.use(cors({
  origin: 'http://localhost:5173', // URL exata do frontend
  credentials: true // ✅ Permite cookies
}));
```

**Frontend:**
```typescript
axios.create({
  withCredentials: true // ✅ Envia cookies
});
```

---

## 🆚 Comparação: Cookies vs localStorage

| Aspecto | HttpOnly Cookies | localStorage |
|---------|------------------|--------------|
| **Proteção XSS** | ✅ Protegido | ❌ Vulnerável |
| **JavaScript Access** | ❌ Bloqueado | ✅ Acessível |
| **CSRF Protection** | ⚠️ Precisa SameSite | ✅ Não afetado |
| **Expira automaticamente** | ✅ Sim | ❌ Não |
| **Enviado automaticamente** | ✅ Sim | ❌ Manual |
| **Segurança** | 🔒 Alta | 🔓 Média |

---

## 🚨 Troubleshooting

### Cookies não são enviados
- ✅ Verifique `withCredentials: true` no axios
- ✅ Verifique `credentials: true` no CORS
- ✅ URLs devem ser exatas (não usar wildcard `*` no CORS)

### Cookie não é salvo
- ✅ Verifique se o domínio está correto
- ✅ Em produção, use HTTPS com `secure: true`
- ✅ Verifique se `cookieParser()` está configurado

### 401 Unauthorized
- ✅ Cookie pode ter expirado (7 dias)
- ✅ Faça logout e login novamente
- ✅ Verifique JWT_SECRET no .env

---

## ✅ Checklist de Implementação

- [x] Instalar `cookie-parser`
- [x] Configurar CORS com `credentials: true`
- [x] Adicionar `cookieParser()` middleware
- [x] Modificar `/auth/login` para enviar cookie
- [x] Modificar `/auth/register` para enviar cookie
- [x] Criar rota `/auth/logout`
- [x] Atualizar middleware `authenticate` para ler cookie
- [x] Configurar frontend com `withCredentials: true`
- [x] Testar login, requisições autenticadas e logout

---

**🎉 Agora seu sistema está muito mais seguro!**
