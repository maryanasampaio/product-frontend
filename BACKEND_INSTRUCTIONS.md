# Instruções para Implementação Backend - Notificações WhatsApp

## ✅ Pré-requisitos (Já configurado)
- Conta Twilio criada
- Sandbox WhatsApp configurado
- Credenciais disponíveis:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - Número sandbox: `+14155238886`

---

## 🎯 O que você precisa fazer

### 1. Configurar Variáveis de Ambiente (2 minutos)

Adicione no `.env` do backend:

```env
# Twilio WhatsApp
TWILIO_ACCOUNT_SID=seu_account_sid_aqui
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=+14155238886

# Frontend URL (para links nas mensagens)
FRONTEND_URL=http://localhost:4200
```

---

### 2. Instalar Dependência (1 minuto)

```bash
npm install twilio
```

---

### 3. Criar Tabela no Banco de Dados (2 minutos)

Execute o SQL no PostgreSQL:

```sql
CREATE TABLE notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  whatsapp_phone VARCHAR(20),
  email_enabled BOOLEAN DEFAULT FALSE,
  email_address VARCHAR(255),
  push_enabled BOOLEAN DEFAULT FALSE,
  push_subscription JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_enabled ON notification_preferences(whatsapp_enabled);
CREATE INDEX idx_email_enabled ON notification_preferences(email_enabled);
CREATE INDEX idx_push_enabled ON notification_preferences(push_enabled);
```

---

### 4. Criar Arquivos (30 minutos)

#### 📁 `services/whatsappService.js`
**Código completo em:** [TWILIO_QUICKSTART.md](TWILIO_QUICKSTART.md) - Passo 6 (linhas ~40-240)

**Resumo:** Este serviço contém:
- `sendMessage(phoneNumber, message)` - Envia mensagem via Twilio
- `formatNewProductMessage(product)` - Formata mensagem de produto
- `notifyNewProduct(product, subscribers)` - Envia para todos inscritos
- `sendTestMessage(phoneNumber)` - Envia teste

---

#### 📁 `controllers/notificationPreferencesController.js`
**Código completo em:** [BACKEND_NOTIFICATION_API.md](BACKEND_NOTIFICATION_API.md) - Seção "Controller de Preferências" (linhas ~286-400)

**Funções:**
- `savePreferences(req, res)` - Salva preferências do usuário
- `getPreferences(req, res)` - Busca preferências
- `deletePreferences(req, res)` - Remove preferências

---

#### 📁 `routes/notificationPreferences.js`
**Código completo em:** [BACKEND_NOTIFICATION_API.md](BACKEND_NOTIFICATION_API.md) - Seção "Rotas" (linhas ~408-420)

Define 4 rotas:
- `POST /api/notification-preferences`
- `GET /api/notification-preferences`
- `PUT /api/notification-preferences`
- `DELETE /api/notification-preferences`

---

### 5. Registrar Rotas no App (2 minutos)

No seu `app.js` ou `index.js`:

```javascript
const notificationRoutes = require('./routes/notificationPreferences');
app.use('/api/notification-preferences', notificationRoutes);
```

---

### 6. Adicionar Webhook ao Criar Produto (5 minutos)

**Local:** `routes/produtos.js` (ou onde está `POST /produtos`)

**Adicione estas linhas:**

```javascript
// No topo do arquivo
const whatsappService = require('../services/whatsappService');

// No POST /produtos, após criar o produto:
router.post('/produtos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 1. Criar produto (código existente)
    const produto = await db.createProduct(req.body);
    
    // 2. NOVO: Enviar notificações WhatsApp (não bloqueia resposta)
    db.query(`
      SELECT whatsapp_phone 
      FROM notification_preferences 
      WHERE whatsapp_enabled = true 
        AND whatsapp_phone IS NOT NULL
    `).then(({ rows }) => {
      if (rows.length > 0) {
        whatsappService.notifyNewProduct(produto, rows).catch(err => {
          console.error('❌ Erro ao enviar notificações:', err);
        });
      }
    });
    
    // 3. Retornar produto (código existente)
    res.status(201).json(produto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### 7. Testar Implementação (10 minutos)

#### Teste 1: Mensagem Direta

Crie `test-whatsapp.js` na raiz do backend:

```javascript
require('dotenv').config();
const whatsappService = require('./services/whatsappService');

async function test() {
  // IMPORTANTE: Use o número que conectou no sandbox (formato: 5582999999999)
  const phoneNumber = '5582999999999'; // SUBSTITUA
  
  const result = await whatsappService.sendTestMessage(phoneNumber);
  console.log('Resultado:', result);
}

test();
```

Execute:
```bash
node test-whatsapp.js
```

**✅ Você deve receber uma mensagem no WhatsApp!**

---

#### Teste 2: API de Preferências

```bash
# 1. Fazer login para pegar token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@email.com","password":"senha"}'

# 2. Salvar preferências (SUBSTITUA O TOKEN)
curl -X POST http://localhost:8080/api/notification-preferences \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "whatsappEnabled": true,
    "whatsappPhone": "5582999999999",
    "emailEnabled": false
  }'

# Resposta esperada:
# {"success": true, "message": "Preferências salvas com sucesso"}
```

---

#### Teste 3: Criar Produto (Teste Final!)

```bash
# Criar produto como admin
curl -X POST http://localhost:8080/api/produtos \
  -H "Authorization: Bearer TOKEN_ADMIN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sofá Teste WhatsApp",
    "category": "Sofá",
    "salePrice": 150000,
    "costPrice": 80000,
    "stock": 5,
    "width": 200,
    "height": 90,
    "depth": 85
  }'
```

**✅ Todos os usuários com WhatsApp ativo devem receber a notificação!**

---

## 📚 Documentação Completa

Se precisar de mais detalhes:

1. **[TWILIO_QUICKSTART.md](TWILIO_QUICKSTART.md)** - Guia passo-a-passo completo
2. **[BACKEND_NOTIFICATION_API.md](BACKEND_NOTIFICATION_API.md)** - Código completo de todos os arquivos
3. **[WHATSAPP_NOTIFICATION_IMPLEMENTATION.md](WHATSAPP_NOTIFICATION_IMPLEMENTATION.md)** - Arquitetura e segurança

---

## ✅ Checklist

- [ ] `.env` configurado com credenciais Twilio
- [ ] `npm install twilio` executado
- [ ] Tabela `notification_preferences` criada no banco
- [ ] Arquivo `whatsappService.js` criado
- [ ] Arquivo `notificationPreferencesController.js` criado
- [ ] Arquivo `routes/notificationPreferences.js` criado
- [ ] Rotas registradas no app.js
- [ ] Webhook adicionado no POST /produtos
- [ ] Backend reiniciado
- [ ] Teste 1 passou (mensagem direta)
- [ ] Teste 2 passou (API de preferências)
- [ ] Teste 3 passou (criar produto + notificação)

---

## 🆘 Problemas Comuns

### ❌ "Authentication Error"
- Verificar se credenciais no `.env` estão corretas
- Verificar se não tem espaços extras

### ❌ "Unverified WhatsApp Recipient"
- Usuário precisa ter enviado "join [codigo]" para o sandbox
- Verificar se o número está no formato correto: `5582999999999`

### ❌ Mensagem não chega
- Verificar logs no console do backend
- Verificar logs no Twilio Console > Monitor > WhatsApp
- Confirmar que o usuário está conectado ao sandbox

---

## 📊 Monitoramento

- **Ver mensagens:** Twilio Console > Monitor > Logs > WhatsApp
- **Ver saldo:** Twilio Console > Balance
- **Ver status:** Cada mensagem mostra `delivered`, `sent` ou `failed`

---

## ⏱️ Tempo Estimado Total: ~50 minutos

- Configuração: 5 min
- Criação de arquivos: 30 min (copiando dos docs)
- Testes: 15 min

---

## 🚀 Próximos Passos (Opcional - Produção)

Para sair do sandbox e usar em produção:
1. Comprar número WhatsApp próprio no Twilio (~$1/mês)
2. Usuários não precisarão mais enviar "join"
3. Criar templates aprovados pelo WhatsApp

**Ver:** [TWILIO_QUICKSTART.md](TWILIO_QUICKSTART.md) seção "Para Produção"
