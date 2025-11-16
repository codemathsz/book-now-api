# 🚀 Deploy no Render.com

## 📋 Pré-requisitos

1. ✅ Código no GitHub
2. ✅ Conta no [Render.com](https://render.com)
3. ✅ Supabase configurado

---

## 🔧 Passo a Passo

### 1️⃣ Push para o GitHub

```bash
git add .
git commit -m "Preparar para deploy no Render"
git push origin main
```

### 2️⃣ Criar Web Service no Render

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Selecione o repositório `book-now-api`

### 3️⃣ Configurar o Serviço

**Configurações básicas:**
- **Name:** `book-now-api` (ou o nome que preferir)
- **Region:** `Oregon` (mais próximo do Brasil no plano grátis)
- **Branch:** `main`
- **Root Directory:** deixe em branco
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

**Plano:**
- Selecione **Free** (0$/mês)

### 4️⃣ Adicionar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
JWT_SECRET=seu-secret-super-seguro-mude-aqui
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://seu-frontend.vercel.app
```

⚠️ **IMPORTANTE:** 
- Copie os valores do seu arquivo `.env` local
- A `PORT=10000` é padrão do Render (não mude)
- `FRONTEND_URL` será a URL do seu frontend após deploy

### 5️⃣ Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (2-3 minutos)
3. Quando aparecer "Live", seu backend está no ar! 🎉

### 6️⃣ Testar

```bash
# Substituir pela sua URL do Render
curl https://book-now-api.onrender.com/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-11-16T..."
}
```

---

## 🌐 URLs do Render

Após o deploy, você terá:
- **URL da API:** `https://book-now-api.onrender.com`
- **Exemplo completo:** `https://book-now-api.onrender.com/api/auth/login`

---

## 🔄 Deploy Automático

O Render faz **deploy automático** quando você faz push no GitHub! 

```bash
git add .
git commit -m "Atualizar backend"
git push
# Render vai detectar e fazer redeploy automaticamente
```

---

## 📊 Monitoramento

No dashboard do Render você pode ver:
- ✅ Logs em tempo real
- ✅ Métricas de uso
- ✅ Status do serviço
- ✅ Histórico de deploys

---

## ⚙️ Configurações Adicionais (Opcional)

### Aumentar timeout (se necessário)
No dashboard → Settings:
- **Health Check Path:** `/health`
- **Health Check Timeout:** 30 segundos

### Custom Domain (se quiser)
Settings → Custom Domains → Add Domain

---

## 🐛 Troubleshooting

### Erro: "Build failed"
- Verifique se `npm run build` funciona localmente
- Veja os logs no Render

### Erro: "Service unhealthy"
- Verifique se o servidor está escutando na porta `process.env.PORT`
- Confira as variáveis de ambiente

### Erro 500 ao acessar endpoints
- Verifique as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY`
- Veja os logs: Dashboard → Logs

### Backend "dorme" (cold start)
- Plano grátis hiberna após 15 minutos de inatividade
- Primeira requisição pode levar ~30 segundos
- Solução: usar um cron job para fazer ping a cada 10 minutos (UptimeRobot)

---

## 📝 Próximos Passos

1. ✅ Deploy do backend no Render
2. 🔜 Atualizar `VITE_API_URL` no frontend para a URL do Render
3. 🔜 Deploy do frontend (Vercel/Netlify)
4. 🔜 Atualizar `FRONTEND_URL` no Render com URL do frontend

---

## 💡 Dicas

- **Logs:** Sempre verifique os logs no dashboard
- **Redeploy:** Manual → Dashboard → Manual Deploy → Deploy latest commit
- **Rollback:** Você pode voltar para deploys anteriores
- **Free tier:** 750h/mês (suficiente para 1 app rodando 24/7)

---

**🎉 Pronto! Seu backend está em produção!**
