# Backend API - Notificações WhatsApp

## Endpoints Necessários

### 1. Salvar Preferências de Notificação

**Endpoint:** `POST /api/notification-preferences`  
**Autenticação:** JWT Token (usuário logado)  
**Descrição:** Salva ou atualiza as preferências de notificação do usuário

#### Request Body
```json
{
  "whatsappEnabled": true,
  "whatsappPhone": "5582999999999",
  "emailEnabled": true,
  "emailAddress": "cliente@email.com",
  "pushEnabled": false,
  "pushSubscription": null
}
```

#### Response Success (201)
```json
{
  "success": true,
  "message": "Preferências salvas com sucesso",
  "preferences": {
    "id": 1,
    "userId": "user_123",
    "whatsappEnabled": true,
    "whatsappPhone": "5582999999999",
    "emailEnabled": true,
    "emailAddress": "cliente@email.com",
    "pushEnabled": false,
    "createdAt": "2026-03-08T10:00:00Z",
    "updatedAt": "2026-03-08T10:00:00Z"
  }
}
```

#### Response Error (400)
```json
{
  "success": false,
  "message": "Número de telefone inválido"
}
```

---

### 2. Buscar Preferências

**Endpoint:** `GET /api/notification-preferences`  
**Autenticação:** JWT Token  
**Descrição:** Retorna as preferências do usuário logado

#### Response Success (200)
```json
{
  "id": 1,
  "userId": "user_123",
  "whatsappEnabled": true,
  "whatsappPhone": "5582999999999",
  "emailEnabled": true,
  "emailAddress": "cliente@email.com",
  "pushEnabled": false,
  "createdAt": "2026-03-08T10:00:00Z",
  "updatedAt": "2026-03-08T10:00:00Z"
}
```

---

### 3. Atualizar Preferências

**Endpoint:** `PUT /api/notification-preferences`  
**Autenticação:** JWT Token  
**Descrição:** Atualiza preferências existentes

#### Request Body
```json
{
  "whatsappEnabled": false,
  "emailEnabled": true,
  "emailAddress": "novo@email.com"
}
```

#### Response Success (200)
```json
{
  "success": true,
  "message": "Preferências atualizadas"
}
```

---

### 4. Deletar Preferências

**Endpoint:** `DELETE /api/notification-preferences`  
**Autenticação:** JWT Token  
**Descrição:** Remove todas as notificações do usuário

#### Response Success (200)
```json
{
  "success": true,
  "message": "Notificações desativadas"
}
```

---

### 5. Webhook ao Criar Produto (Interno)

**Trigger:** Quando admin cria novo produto via `POST /api/produtos`  
**Ação:** Enviar notificações automaticamente

#### Fluxo Interno no Backend

```javascript
// routes/products.js
router.post('/produtos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 1. Criar produto
    const produto = await db.createProduct(req.body);
    
    // 2. Disparar notificações (async, não bloqueia resposta)
    notificationService.notifyNewProduct(produto).catch(err => {
      console.error('Erro ao enviar notificações:', err);
    });
    
    // 3. Retornar produto criado
    res.status(201).json(produto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Implementação Backend

### Schema do Banco de Dados (PostgreSQL)

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
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Índices para performance
  INDEX idx_whatsapp_enabled (whatsapp_enabled),
  INDEX idx_email_enabled (email_enabled),
  INDEX idx_push_enabled (push_enabled)
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Service de Notificações

```javascript
// services/notificationService.js
const twilio = require('twilio');

class NotificationService {
  constructor() {
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  /**
   * Notificar todos os usuários sobre novo produto
   */
  async notifyNewProduct(product) {
    // 1. Buscar usuários com notificações ativas
    const whatsappUsers = await this.getWhatsAppSubscribers();
    const emailUsers = await this.getEmailSubscribers();
    
    // 2. Enviar WhatsApp (paralelo)
    const whatsappPromises = whatsappUsers.map(user => 
      this.sendWhatsAppNotification(user.whatsapp_phone, product)
    );
    
    // 3. Enviar Emails (paralelo)
    const emailPromises = emailUsers.map(user => 
      this.sendEmailNotification(user.email_address, product)
    );
    
    // 4. Aguardar todos
    await Promise.allSettled([...whatsappPromises, ...emailPromises]);
    
    console.log(`✅ Notificações enviadas: ${whatsappUsers.length} WhatsApp, ${emailUsers.length} Email`);
  }

  /**
   * Enviar notificação via WhatsApp (Twilio)
   */
  async sendWhatsAppNotification(phoneNumber, product) {
    try {
      const message = this.formatWhatsAppMessage(product);
      
      await this.twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${phoneNumber}`,
        body: message
      });
      
      console.log(`✅ WhatsApp enviado para ${phoneNumber}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar WhatsApp para ${phoneNumber}:`, error.message);
    }
  }

  /**
   * Formatar mensagem para WhatsApp
   */
  formatWhatsAppMessage(product) {
    const price = (product.salePrice / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    return `
🆕 *Novo Produto Disponível!*

📦 ${product.name}
💰 ${price}
📏 ${product.width}cm x ${product.height}cm x ${product.depth}cm

Acesse agora: ${process.env.FRONTEND_URL}/produtos/${product.id}
    `.trim();
  }

  /**
   * Buscar usuários com WhatsApp ativo
   */
  async getWhatsAppSubscribers() {
    const { rows } = await db.query(`
      SELECT whatsapp_phone 
      FROM notification_preferences 
      WHERE whatsapp_enabled = true 
        AND whatsapp_phone IS NOT NULL
    `);
    return rows;
  }

  /**
   * Buscar usuários com Email ativo
   */
  async getEmailSubscribers() {
    const { rows } = await db.query(`
      SELECT email_address 
      FROM notification_preferences 
      WHERE email_enabled = true 
        AND email_address IS NOT NULL
    `);
    return rows;
  }
}

module.exports = new NotificationService();
```

---

### Controller de Preferências

```javascript
// controllers/notificationPreferencesController.js
const db = require('../database');

exports.savePreferences = async (req, res) => {
  const userId = req.user.id; // Do JWT
  const {
    whatsappEnabled,
    whatsappPhone,
    emailEnabled,
    emailAddress,
    pushEnabled,
    pushSubscription
  } = req.body;

  try {
    // Validar dados
    if (whatsappEnabled && !whatsappPhone) {
      return res.status(400).json({
        success: false,
        message: 'Número de WhatsApp é obrigatório'
      });
    }

    if (emailEnabled && !emailAddress) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Salvar ou atualizar
    const query = `
      INSERT INTO notification_preferences (
        user_id, whatsapp_enabled, whatsapp_phone, 
        email_enabled, email_address, 
        push_enabled, push_subscription
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) 
      DO UPDATE SET
        whatsapp_enabled = $2,
        whatsapp_phone = $3,
        email_enabled = $4,
        email_address = $5,
        push_enabled = $6,
        push_subscription = $7,
        updated_at = NOW()
      RETURNING *
    `;

    const { rows } = await db.query(query, [
      userId,
      whatsappEnabled,
      whatsappPhone,
      emailEnabled,
      emailAddress,
      pushEnabled,
      pushSubscription
    ]);

    res.status(201).json({
      success: true,
      message: 'Preferências salvas com sucesso',
      preferences: rows[0]
    });
  } catch (error) {
    console.error('Erro ao salvar preferências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar preferências'
    });
  }
};

exports.getPreferences = async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await db.query(
      'SELECT * FROM notification_preferences WHERE user_id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.json({
        whatsappEnabled: false,
        emailEnabled: false,
        pushEnabled: false
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    res.status(500).json({ error: 'Erro ao buscar preferências' });
  }
};

exports.deletePreferences = async (req, res) => {
  const userId = req.user.id;

  try {
    await db.query(
      'DELETE FROM notification_preferences WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Notificações desativadas'
    });
  } catch (error) {
    console.error('Erro ao deletar preferências:', error);
    res.status(500).json({ error: 'Erro ao deletar preferências' });
  }
};
```

---

### Rotas

```javascript
// routes/notificationPreferences.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationPreferencesController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, controller.savePreferences);
router.get('/', authenticateToken, controller.getPreferences);
router.put('/', authenticateToken, controller.savePreferences); // Mesmo método
router.delete('/', authenticateToken, controller.deletePreferences);

module.exports = router;
```

---

## Configuração Twilio

### Variáveis de Ambiente (.env)

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886

# Frontend URL
FRONTEND_URL=http://localhost:4200
```

### Setup Twilio

1. **Criar conta:** https://www.twilio.com/try-twilio
2. **Configurar WhatsApp Sandbox:** Console > Messaging > Try it Out > Send a WhatsApp message
3. **Conectar número:** Enviar mensagem "join [sandbox-name]" para número do Twilio
4. **Obter credenciais:** Account SID e Auth Token no dashboard

---

## Testando a Integração

### 1. Testar Salvamento de Preferências

```bash
curl -X POST http://localhost:8080/api/notification-preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "whatsappEnabled": true,
    "whatsappPhone": "5582999999999",
    "emailEnabled": false,
    "emailAddress": ""
  }'
```

### 2. Testar Criação de Produto (dispara notificação)

```bash
curl -X POST http://localhost:8080/api/produtos \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sofá Retrátil Premium",
    "category": "Sofá",
    "salePrice": 450000,
    "costPrice": 300000,
    "stock": 5
  }'
```

### 3. Verificar no WhatsApp

Cliente conectado ao sandbox do Twilio receberá:

```
🆕 Novo Produto Disponível!

📦 Sofá Retrátil Premium
💰 R$ 4.500,00
📏 200cm x 90cm x 85cm

Acesse agora: http://localhost:4200/produtos/123
```

---

## Próximos Passos

### Fase 1: MVP (Atual)
- ✅ Frontend com formulário de preferências
- ✅ Service e Repository
- ✅ Validação de dados
- 🔄 Backend endpoints (/api/notification-preferences)
- 🔄 Integração Twilio
- 🔄 Webhook ao criar produto

### Fase 2: Melhorias
- 📋 Filas (Bull + Redis) para envio assíncrono
- 📋 Logs de tentativas e falhas
- 📋 Dashboard admin com métricas
- 📋 Templates personalizáveis
- 📋 Agendamento de notificações

### Fase 3: Produção
- 📋 WhatsApp Business API (aprovação Meta)
- 📋 Templates aprovados
- 📋 Rate limiting
- 📋 Monitoramento (Sentry, DataDog)
- 📋 A/B testing de mensagens
