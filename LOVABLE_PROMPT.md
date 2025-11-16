# 🎨 Prompt para Lovable/v0.dev - Sistema de Reserva de Mesas

## 📋 Contexto do Projeto

Preciso de uma interface web moderna e elegante para um **sistema de reserva de mesas de refeitório corporativo**. O sistema permite que colaboradores reservem mesas em horários específicos do almoço e que administradores visualizem todas as reservas através de um dashboard analítico.

---

## 🎯 Objetivo

Criar uma aplicação React com design moderno, intuitivo e responsivo que se integre com a API REST já desenvolvida. A interface deve transmitir profissionalismo, ser fácil de usar e ter uma experiência fluida.

---

## 🎨 Design e Estilo

### Paleta de Cores Sugerida
- **Primary**: Azul corporativo (#2563EB ou #3B82F6) - para botões principais e destaques
- **Secondary**: Cinza moderno (#64748B) - para textos secundários
- **Success**: Verde (#10B981) - para disponibilidade e confirmações
- **Warning**: Amarelo/Laranja (#F59E0B) - para alertas e poucos lugares
- **Danger**: Vermelho (#EF4444) - para cancelamentos e indisponibilidade
- **Background**: Branco/Cinza claro (#F8FAFC, #F1F5F9) - fundos limpos
- **Text**: Cinza escuro (#1E293B) - textos principais

### Estilo Visual
- **Design System**: Moderno, clean, corporativo mas amigável
- **Componentes**: Cards com sombras suaves, bordas arredondadas (rounded-lg)
- **Tipografia**: Fontes sans-serif modernas (Inter, Poppins ou default do Tailwind)
- **Espaçamento**: Generoso, respirável, não cramped
- **Ícones**: Use Lucide React ou Heroicons para consistência
- **Animações**: Transições suaves (transition-all duration-300)
- **Responsividade**: Mobile-first, funciona perfeitamente em mobile, tablet e desktop

---

## 🗂️ Estrutura da Aplicação

### Páginas/Rotas Necessárias

1. **Landing Page** (`/`) - Página inicial pública
2. **Login** (`/login`) - Autenticação
3. **Registro** (`/register`) - Criar conta
4. **Dashboard do Usuário** (`/dashboard`) - Área do colaborador (protegida)
5. **Nova Reserva** (`/reservations/new`) - Criar reserva (protegida)
6. **Minhas Reservas** (`/reservations`) - Ver/cancelar reservas (protegida)
7. **Dashboard Admin** (`/admin/dashboard`) - Visão administrativa (protegida, admin only)

---

## 📱 Especificação Detalhada de Cada Tela

### 1. Landing Page (`/`)

**Layout:**
- Hero section com título chamativo e CTA
- Seção explicativa: "Como funciona?" com 3 passos (cards com ícones)
- Seção de horários disponíveis (visual)
- Footer com informações

**Elementos:**
- **Hero**: 
  - Título: "Reserve sua Mesa no Refeitório" (grande, bold)
  - Subtítulo: "Sistema inteligente de gestão de mesas - rápido, fácil e organizado"
  - Botão CTA: "Fazer Reserva" (primário, grande) → redireciona para /login se não autenticado
  - Ilustração ou ícone de mesa/refeitório (pode usar emoji 🍽️ ou ícone)

- **Como Funciona**: 3 cards lado a lado (grid responsivo)
  1. 📅 "Escolha o Horário" - Selecione entre 3 opções de almoço
  2. ✅ "Reserve Instantaneamente" - Garantimos sua mesa automaticamente
  3. 🔔 "Gerencie suas Reservas" - Cancele quando precisar

- **Horários**: Grid mostrando os 3 slots (12:00-12:30, 12:30-13:00, 13:00-13:30) com ícones de relógio

**Design:**
- Fundo com gradiente suave ou imagem de fundo blur
- Espaçamento generoso
- Responsivo: stack em mobile, grid em desktop

---

### 2. Login (`/login`)

**Layout:**
- Centralizado na tela (vertical e horizontal)
- Card com sombra média, fundo branco
- Largura máxima: 400px

**Elementos:**
- Logo ou título do app no topo
- Título: "Bem-vindo de volta"
- Form com:
  - Input de Email (com ícone de envelope)
  - Input de Senha (com ícone de cadeado e toggle show/hide)
  - Checkbox "Lembrar-me" (opcional)
  - Botão "Entrar" (primário, full width)
- Link: "Não tem conta? Cadastre-se" → `/register`
- Mensagens de erro em vermelho se login falhar

**Validações:**
- Email válido
- Senha mínima 6 caracteres
- Mostrar loading spinner no botão durante requisição

---

### 3. Registro (`/register`)

**Layout:**
- Similar ao login, centralizado
- Card com max-width: 400px

**Elementos:**
- Título: "Criar Conta"
- Form com:
  - Input de Nome completo (ícone de usuário)
  - Input de Email (ícone de envelope)
  - Input de Senha (ícone de cadeado, com strength indicator)
  - Input de Confirmar Senha
  - Botão "Criar Conta" (primário, full width)
- Link: "Já tem conta? Faça login" → `/login`
- Mensagens de erro específicas

**Validações:**
- Nome obrigatório
- Email válido e único
- Senha mínima 6 caracteres
- Senhas devem coincidir
- Loading durante criação

---

### 4. Dashboard do Usuário (`/dashboard`)

**Layout:**
- Navbar/Header fixo no topo:
  - Logo/nome do app à esquerda
  - Menu: "Dashboard" | "Nova Reserva" | "Minhas Reservas"
  - Avatar/nome do usuário à direita com dropdown (logout)
- Container principal com padding

**Elementos:**

**Seção 1: Boas-vindas**
- Título: "Olá, [Nome do Usuário]! 👋"
- Subtítulo com data atual formatada

**Seção 2: Cards de Resumo** (grid 3 colunas, responsivo)
1. Card "Próxima Reserva":
   - Ícone de calendário
   - Horário e data da próxima reserva
   - Número da mesa
   - Botão "Ver Detalhes"
   - Se não tem: "Nenhuma reserva agendada"

2. Card "Reservas Ativas":
   - Número total de reservas ativas
   - Ícone de checklist

3. Card "Ação Rápida":
   - Botão grande: "Nova Reserva" → `/reservations/new`

**Seção 3: Minhas Próximas Reservas**
- Lista (ou grid) com cards de cada reserva
- Cada card mostra:
  - Data (formatada: "Terça-feira, 20 de Novembro")
  - Horário (ex: "12:00 - 12:30")
  - Mesa número X
  - Badge de status ("Ativa" - verde)
  - Botão "Cancelar" (pequeno, outline vermelho)
- Se vazio: Empty state com ilustração e botão "Fazer Primeira Reserva"

**Design:**
- Layout limpo, cards com sombra leve
- Cores vibrantes mas profissionais
- Hover effects nos botões e cards

---

### 5. Nova Reserva (`/reservations/new`)

**Layout:**
- Container centralizado, max-width: 800px
- Stepper/wizard visual (opcional mas elegante)

**Elementos:**

**Título:** "Criar Nova Reserva" com ícone de adicionar

**Passo 1: Selecionar Data**
- Date picker customizado ou input date nativo estilizado
- Desabilitar datas passadas
- Mostrar dia da semana ao lado

**Passo 2: Selecionar Horário**
- Grid com 3 cards (um para cada horário):
  - **12:00 - 12:30**
  - **12:30 - 13:00**
  - **13:00 - 13:30**

**Cada card de horário deve mostrar:**
- Horário (grande, bold)
- Ícone de relógio
- **Disponibilidade visual**:
  - Badge verde: "X mesas disponíveis" (se > 2)
  - Badge amarelo: "Últimas X mesas" (se 1-2)
  - Badge vermelho: "Esgotado" (se 0)
- Barra de progresso visual mostrando ocupação (6 mesas)
- Botão "Selecionar" (primário se disponível, desabilitado se não)
- Cards clicáveis com hover effect

**Avisos/Validações visuais:**
- Se usuário já tem 2 reservas no dia: Alerta em destaque "Você atingiu o limite de 2 reservas por dia"
- Se já tem reserva naquele horário: Card desabilitado com mensagem "Você já tem reserva neste horário"

**Botões:**
- "Confirmar Reserva" (primário, grande, desabilitado até selecionar tudo)
- "Cancelar" (secundário)

**Feedback de Sucesso:**
- Modal ou toast de confirmação animado
- Mostrar detalhes da reserva criada (data, horário, mesa)
- Botão "Ver Minhas Reservas" e "Fazer Outra Reserva"

---

### 6. Minhas Reservas (`/reservations`)

**Layout:**
- Header com título "Minhas Reservas"
- Filtros/tabs:
  - "Próximas" (ativas, futuras)
  - "Hoje"
  - "Histórico" (passadas/canceladas)

**Elementos:**

**Lista de Reservas** (cards ou tabela estilizada):
- Cada reserva mostra:
  - **Data** (grande, com dia da semana)
  - **Horário** com ícone de relógio
  - **Mesa #X** com ícone de mesa
  - **Status badge**:
    - "Ativa" (verde)
    - "Cancelada" (cinza/vermelho)
  - **Ações**:
    - Botão "Cancelar" (vermelho, outline) - com confirmação modal
    - Tooltip: "Você pode cancelar até X horas antes"

**Empty State** (se não tem reservas):
- Ilustração ou ícone grande
- Mensagem: "Você ainda não tem reservas"
- Botão: "Fazer uma Reserva"

**Modal de Confirmação de Cancelamento:**
- Título: "Cancelar Reserva?"
- Mensagem: "Tem certeza que deseja cancelar a reserva para [data] às [horário]?"
- Botões: "Sim, Cancelar" (vermelho) e "Não, Manter" (secundário)

---

### 7. Dashboard Admin (`/admin/dashboard`)

**Layout:**
- Navbar diferenciada (com badge "Admin" ou cor diferente)
- Layout mais denso, focado em dados

**Elementos:**

**Filtros no Topo:**
- Date picker: "Selecionar Data" (default: hoje)
- Botão "Atualizar" para refresh dos dados

**Seção 1: Cards de Métricas** (grid 4 colunas, responsivo)
1. **Total de Reservas**
   - Número grande
   - Ícone de checklist
   - Badge com variação vs ontem (opcional)

2. **Reservas Canceladas**
   - Número
   - Ícone de X

3. **Taxa de Ocupação**
   - Percentual (ex: 78%)
   - Barra de progresso colorida
   - Sobre o total de 18 mesas (3 slots × 6 mesas)

4. **Horário mais Popular**
   - Horário com mais reservas
   - Ícone de trending up

**Seção 2: Ocupação por Horário** (Grid 3 cards)
Para cada time slot (12:00-12:30, 12:30-13:00, 13:00-13:30):
- Card grande com:
  - Horário (título)
  - "X de 6 mesas reservadas"
  - Barra de progresso visual (colorida por ocupação)
  - Grid de "mesas": 6 quadradinhos representando cada mesa
    - Verde: ocupada
    - Cinza claro: disponível
    - Cada quadradinho com número da mesa (1-6)

**Seção 3: Lista de Todas as Reservas**
- Tabela responsiva (ou cards em mobile) com:
  - **Colunas**: Nome | Email | Horário | Mesa | Status
  - Sortable (clicável nos headers)
  - Searchable (barra de busca por nome/email)
  - Paginação se muitas reservas
  - Badge visual de status
  - Hover effect nas linhas

**Seção 4: Gráfico/Visualização** (opcional mas impressionante)
- Chart.js ou Recharts:
  - Gráfico de barras: reservas por horário
  - Ou line chart: reservas ao longo dos últimos 7 dias

**Design:**
- Visual profissional, dashboard corporativo
- Muita informação mas organizada
- Cores para destacar métricas importantes
- Loading skeletons enquanto carrega dados

---

## 🎯 Resultado Esperado

Uma aplicação web moderna, fluida e intuitiva que parece profissional e poderia ser usada em produção. O design deve ser clean, os componentes reutilizáveis, o código bem estruturado e a experiência do usuário impecável. Deve impressionar tanto visualmente quanto tecnicamente.

---

## 💡 Inspirações de Design

- **Airbnb**: Simplicidade, cards bonitos, bom espaçamento
- **Linear**: Interface limpa, moderna, ótima tipografia
- **Vercel Dashboard**: Dashboard profissional, métricas claras
- **Notion**: UX fluida, componentes bem pensados
- **Stripe Dashboard**: Tabelas e gráficos elegantes

---

## 🎨 Exemplo de Paleta Específica

```css
/* Tailwind Config */
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  },
  success: {
    500: '#10b981',
    600: '#059669'
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706'
  },
  danger: {
    500: '#ef4444',
    600: '#dc2626'
  }
}
```

---