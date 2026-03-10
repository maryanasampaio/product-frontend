# 🚀 Setup Rápido - Notificações WhatsApp com Twilio

## ⏱️ Tempo estimado: 15 minutos

---

## 📋 Pré-requisitos
- Node.js instalado
- Backend rodando
- Conta Gmail (para criar conta Twilio)

---

## Passo 1: Criar Conta Twilio (3 minutos)

1. Acesse: https://www.twilio.com/try-twilio
2. Preencha o formulário:
   - Email
   - Senha forte
   - Primeiro nome / Último nome
3. Verificar email
4. Verificar telefone (SMS grátis)
5. Selecionar: **"I want to send messages with WhatsApp"**

🎁 **Você ganhará $15.50 em créditos grátis!**

---

## Passo 2: Configurar WhatsApp Sandbox (2 minutos)

1. No Twilio Console, vá em:
   - **Messaging** > **Try it out** > **Send a WhatsApp message**

2. Você verá instruções assim:
   ```
   Conecte seu WhatsApp ao Twilio Sandbox:
   
   1. Abra o WhatsApp no seu celular
   2. Adicione o número: +1 415 523 8886
   3. Envie a mensagem: join [seu-codigo-unico]
   ```

3. **Faça isso no seu celular agora**
4. Você receberá uma confirmação: ✅ "You are all set!"

---

## Passo 3: Obter Credenciais (1 minuto)

1. No Twilio Console, clique em **Account** (canto superior direito)
2. Copie:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: (clique em "Show" para revelar)

---

## Passo 4: Instalar Dependências Backend (1 minuto)

```bash
cd seu-backend
npm install twilio
```

---

## Passo 5: Configurar .env (1 minuto)

Adicione no arquivo `.env` do backend:

```env
# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=+14155238886

# Frontend URL (para links nas mensagens)
FRONTEND_URL=http://localhost:4200
```

---

## Passo 6: Criar Serviço de WhatsApp (5 minutos)

### 📁 **Arquivo:** `backend/services/whatsappService.js`

```javascript
const twilio = require('twilio');

class WhatsAppService {
  constructor() {
    // Inicializar cliente Twilio
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    this.fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
  }

  /**
   * Enviar mensagem para um número
   */
  async sendMessage(phoneNumber, message) {
    try {
      // Formatar número: precisa começar com +55 (Brasil)
      const toNumber = phoneNumber.startsWith('+') 
        ? `whatsapp:${phoneNumber}` 
        : `whatsapp:+${phoneNumber}`;

      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: toNumber,
        body: message
      });

      console.log(`✅ WhatsApp enviado para ${phoneNumber} - SID: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error(`❌ Erro ao enviar WhatsApp para ${phoneNumber}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Formatar mensagem de novo produto
   */
  formatNewProductMessage(product) {
    const price = (product.salePrice / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    const url = `${process.env.FRONTEND_URL}/produtos/${product.id}`;

    return `
🆕 *Novo Produto Disponível!*

📦 ${product.name}
💰 ${price}
📏 ${product.width || 0}cm x ${product.height || 0}cm x ${product.depth || 0}cm

Acesse agora: ${url}
    `.trim();
  }

  /**
   * Notificar sobre novo produto (envia para todos inscritos)
   */
  async notifyNewProduct(product, subscribers) {
    console.log(`📤 Enviando notificações para ${subscribers.length} usuários...`);

    const message = this.formatNewProductMessage(product);
    const results = [];

    // Enviar para cada inscrito
    for (const subscriber of subscribers) {
      const result = await this.sendMessage(subscriber.whatsapp_phone, message);
      results.push({
        phone: subscriber.whatsapp_phone,
        ...result
      });
      
      // Delay de 100ms entre mensagens (evitar rate limit)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Enviadas: ${successful} | ❌ Falhas: ${failed}`);
    return results;
  }

  /**
   * Enviar mensagem de teste
   */
  async sendTestMessage(phoneNumber) {
    const message = `
🎉 *Teste de Notificação*

Suas notificações do WhatsApp estão ativas!

Você receberá alertas quando novos produtos forem publicados.
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }
}

module.exports = new WhatsAppService();
```

---

## Passo 7: Integrar com Criação de Produto (2 minutos)

### 📁 **Arquivo:** `backend/routes/produtos.js` (ou products.js)

```javascript
const whatsappService = require('../services/whatsappService');
const db = require('../database'); // Seu módulo de banco de dados

// Rota de criar produto
router.post('/produtos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 1. Criar produto normalmente
    const produto = await db.createProduct(req.body);

    // 2. Buscar usuários com WhatsApp ativo (não bloqueia resposta)
    db.query(`
      SELECT whatsapp_phone 
      FROM notification_preferences 
      WHERE whatsapp_enabled = true 
        AND whatsapp_phone IS NOT NULL
    `).then(({ rows }) => {
      if (rows.length > 0) {
        // Enviar notificações em background
        whatsappService.notifyNewProduct(produto, rows).catch(err => {
          console.error('Erro ao enviar notificações:', err);
        });
      }
    });

    // 3. Retornar produto criado imediatamente
    res.status(201).json(produto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Passo 8: Testar! (3 minutos)

### **Teste 1: Enviar mensagem de teste direto**

Crie um script `backend/test-whatsapp.js`:

```javascript
require('dotenv').config();
const whatsappService = require('./services/whatsappService');

async function test() {
  // Seu número (precisa estar conectado ao sandbox)
  const phoneNumber = '5582999999999'; // SUBSTITUA pelo seu número
  
  const result = await whatsappService.sendTestMessage(phoneNumber);
  console.log('Resultado:', result);
}

test();
```

Execute:
```bash
node test-whatsapp.js
```

✅ **Você receberá uma mensagem no WhatsApp!**

### **Teste 2: Criar produto e receber notificação**

```bash
curl -X POST http://localhost:8080/api/produtos \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Notificação WhatsApp",
    "category": "Teste",
    "salePrice": 100000,
    "costPrice": 50000,
    "stock": 1
  }'
```

✅ **Você receberá notificação do novo produto!**

---

## 📊 Monitoramento

### Ver mensagens enviadas:

1. Twilio Console > **Monitor** > **Logs** > **WhatsApp**
2. Você verá:
   - Status: `delivered`, `sent`, `failed`
   - Custo de cada mensagem
   - Horário de envio

### Ver saldo:

1. Twilio Console > **Balance**
2. Mostra créditos restantes

---

## 🎯 Limitações do Sandbox

⚠️ **No Sandbox (grátis):**
- ✅ Funciona perfeitamente para testes
- ✅ Até 100 números conectados
- ⚠️ Usuários precisam enviar "join [codigo]" primeiro
- ⚠️ Número compartilhado com outros desenvolvedores

🚀 **Para Produção (upgrade):**
- Comprar número próprio (~$1/mês)
- Usuários NÃO precisam enviar "join"
- Número exclusivo
- Templates aprovados pelo WhatsApp

---

## 🔧 Troubleshooting

### ❌ "Authentication Error"
- Verificar `TWILIO_ACCOUNT_SID` e `TWILIO_AUTH_TOKEN` no `.env`
- Verificar se não tem espaços extras

### ❌ "Unverified WhatsApp Recipient"
- Usuário precisa enviar "join [codigo]" pro sandbox
- Ou fazer upgrade para número próprio

### ❌ "Insufficient Funds"
- Créditos acabaram
- Adicionar crédito no Twilio Console

### ❌ Mensagem não chega
- Verificar formato do número: `5582999999999` (com código do país)
- Verificar logs no Twilio Console

---

## 📈 Próximos Passos (Opcional)

### **Para Produção:**

1. **Comprar Número WhatsApp Business:**
   - Twilio Console > **Phone Numbers** > **Buy a number**
   - Filtrar: WhatsApp enabled
   - ~$1.00/mês

2. **Criar Templates Aprovados:**
   - WhatsApp exige templates para mensagens de marketing
   - Submeter template no Twilio Console
   - Aprovação em 24-48h

3. **Adicionar Fila:**
   ```bash
   npm install bull redis
   ```
   - Enviar notificações via fila (mais robusto)
   - Retry automático em caso de falha

---

## 💡 Dicas Pro

### **1. Rate Limiting**
```javascript
// Máximo 10 mensagens por segundo
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

for (const subscriber of subscribers) {
  await sendMessage(subscriber.phone);
  await delay(100); // 100ms entre cada
}
```

### **2. Logs Estruturados**
```javascript
{
  timestamp: new Date(),
  action: 'whatsapp_notification',
  productId: product.id,
  recipients: subscribers.length,
  successful: 45,
  failed: 2
}
```

### **3. Personalização**
```javascript
const message = `
Olá ${subscriber.name}! 👋

Novo produto da categoria que você gosta:
💰 ${product.name} - ${price}
`;
```

---

## ✅ Checklist Final

- [ ] Conta Twilio criada
- [ ] Sandbox WhatsApp configurado
- [ ] Seu celular conectado (enviou "join")
- [ ] Credenciais no `.env`
- [ ] `npm install twilio` executado
- [ ] Arquivo `whatsappService.js` criado
- [ ] Integrado com rota de produtos
- [ ] Teste manual funcionou
- [ ] Teste via API funcionou

---

## 🎉 Pronto!

Agora toda vez que um produto for criado, todos os clientes com WhatsApp ativo receberão uma notificação automaticamente!

**Custo:** $0.00 (usando créditos grátis) ou $0.005 por mensagem.

---

## 📞 Suporte

**Documentação Twilio:**
- WhatsApp: https://www.twilio.com/docs/whatsapp
- Node.js SDK: https://www.twilio.com/docs/libraries/node

**Precisa de ajuda?**
- Twilio Support Chat (24/7)
- Stack Overflow: [twilio-api] tag
