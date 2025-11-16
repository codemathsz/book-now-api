# 🗄️ Guia de Configuração do Supabase

## Passo 1: Criar Conta e Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Faça login com GitHub (recomendado) ou email
4. Clique em **"New Project"**
5. Preencha:
   - **Name**: book-now-api (ou nome que preferir)
   - **Database Password**: Crie uma senha forte (guarde ela!)
   - **Region**: Escolha a mais próxima (Brazil East recomendado)
   - **Pricing Plan**: Free (suficiente para o desafio)
6. Clique em **"Create new project"**
7. Aguarde ~2 minutos até o projeto ser provisionado

## Passo 2: Obter Credenciais

1. No menu lateral, vá em **Settings** (ícone de engrenagem)
2. Clique em **API** no submenu
3. Você verá:
   - **Project URL**: `https://xxxxxxxxxxx.supabase.co`
   - **Project API keys**:
     - `anon` `public` (essa é a que vamos usar)

4. **Copie essas credenciais** e cole no arquivo `.env`:

```env
SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

## Passo 3: Executar SQL para Criar Tabelas

1. No menu lateral do Supabase, clique em **SQL Editor**
2. Clique em **"+ New query"**
3. Copie TODO o conteúdo do arquivo `src/database/schema.sql`
4. Cole no editor SQL
5. **IMPORTANTE**: Antes de executar, gere o hash da senha admin:
   
   No terminal, execute:
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
   ```
   
   Copie o hash gerado e substitua na linha do INSERT do usuário admin:
   ```sql
   INSERT INTO users (email, name, password, role) VALUES
     ('admin@booknow.com', 'Administrador', 'COLE_O_HASH_AQUI', 'admin');
   ```

6. Clique em **RUN** (ou pressione Ctrl+Enter)
7. Você deve ver: **"Success. No rows returned"**

## Passo 4: Verificar Tabelas Criadas

1. No menu lateral, clique em **Table Editor**
2. Você deve ver 3 tabelas:
   - ✅ **users**
   - ✅ **time_slots** (com 3 registros)
   - ✅ **reservations** (vazia)

## Passo 5: Testar Conexão

No terminal do projeto, execute:

```bash
npm run dev
```

Se aparecer:
```
🚀 Server running on http://localhost:3000
📝 Environment: development
```

## 🔒 Configuração de Segurança (Opcional mas Recomendado)

Por padrão, o Supabase tem RLS (Row Level Security) habilitado. Como estamos usando JWT próprio (não o auth do Supabase), vamos desabilitar temporariamente:

1. No SQL Editor, execute:

```sql
-- Desabilitar RLS temporariamente para usar JWT próprio
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots DISABLE ROW LEVEL SECURITY;
```

## 📊 Visualizar Dados (durante desenvolvimento)

- **Table Editor**: Ver/editar dados manualmente
- **Database**: Ver estrutura, índices, relacionamentos
- **Logs**: Ver logs de queries e erros

## 🚨 Solução de Problemas

### Erro: "SUPABASE_URL e SUPABASE_ANON_KEY devem estar definidos"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Certifique-se que as variáveis estão sem aspas
- Reinicie o servidor após editar o `.env`

### Erro: "relation 'users' does not exist"
- Execute o script SQL novamente
- Verifique se está no projeto correto no Supabase

### Erro ao criar usuário: "duplicate key value violates unique constraint"
- O email já existe na tabela
- Use outro email ou delete o registro antigo no Table Editor