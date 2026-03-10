# Integração de Notificações WhatsApp

## Arquitetura da Solução

### 1. Fluxo do Cliente

```
Cliente → Frontend (Ativa WhatsApp) → Backend (Salva preferências) → Banco de Dados
                                                                       ↓
Novo Produto Criado → Backend dispara webhook → Serviço de WhatsApp → Cliente recebe mensagem
```

### 2. Componentes Necessários

#### Frontend (Angular)
- ✅ **Página de Configurações** (`notifications-settings.component.ts`) - Já existe
- 🔄 **Service de Notificações** - Precisa criar
- 🔄 **Repository de Notificações** - Precisa criar
- 🔄 **Model de Preferências** - Precisa criar

#### Backend (Node.js)
- 🔄 **Rotas de Preferências**
  - `POST /api/notification-preferences` - Salvar preferências
  - `GET /api/notification-preferences/:userId` - Buscar preferências
  - `PUT /api/notification-preferences/:userId` - Atualizar
  - `DELETE /api/notification-preferences/:userId` - Deletar

- 🔄 **Webhook de Produtos**
  - Trigger ao criar produto novo
  - Buscar todos os usuários com notificações ativas
  - Enviar mensagem via WhatsApp

- 🔄 **Integração WhatsApp**
  - Opção 1: WhatsApp Business API (oficial, requer aprovação Meta)
  - Opção 2: Twilio API (mais fácil, custo por mensagem)
  - Opção 3: API2Cart, MessageBird, etc.

### 3. Banco de Dados

#### Tabela: `notification_preferences`
```sql
CREATE TABLE notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE,  -- Identificador único do cliente
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_phone VARCHAR(20),
  email_enabled BOOLEAN DEFAULT false,
  email_address VARCHAR(255),
  push_enabled BOOLEAN DEFAULT false,
  push_subscription JSONB,      -- Token de push notification
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Opções de Implementação WhatsApp

#### 🚀 Opção 1: Twilio (Recomendado para começar)
**Vantagens:**
- Fácil de implementar
- Documentação excelente
- Sandbox gratuito para testes
- Custo previsível ($0.005 por mensagem)

**Passos:**
1. Criar conta Twilio (free tier disponível)
2. Configurar número WhatsApp Business
3. Instalar SDK: `npm install twilio`
4. Implementar envio de mensagens

```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

await client.messages.create({
  from: 'whatsapp:+14155238886',
  to: `whatsapp:${phoneNumber}`,
  body: 'Novo produto disponível! Confira...'
});
```

#### 🔧 Opção 2: Evolution API (Open Source)
**Vantagens:**
- Gratuito (self-hosted)
- Não precisa aprovação Meta
- Multi-device suportado

**Passos:**
1. Instalar Evolution API: `docker run -p 8080:8080 atendai/evolution-api`
2. Conectar WhatsApp via QR Code
3. Usar REST API para enviar mensagens

#### ⭐ Opção 3: WhatsApp Business API (Oficial)
**Vantagens:**
- Oficial do Meta
- Mais confiável
- Recursos avançados (botões, templates)

**Desvantagens:**
- Requer aprovação Meta (2-7 dias)
- Custo mais alto
- Setup mais complexo

### 5. Implementação Inicial (Twilio)

#### Backend - Webhook de Produto Novo

```javascript
// routes/products.js
router.post('/products', authenticateToken, async (req, res) => {
  // Criar produto
  const product = await db.createProduct(req.body);
  
  // Disparar notificações
  await notificationService.notifyNewProduct(product);
  
  res.json(product);
});

// services/notificationService.js
async function notifyNewProduct(product) {
  // Buscar usuários com WhatsApp ativo
  const users = await db.query(`
    SELECT whatsapp_phone 
    FROM notification_preferences 
    WHERE whatsapp_enabled = true
  `);
  
  // Enviar para cada um
  for (const user of users) {
    await sendWhatsAppMessage(user.whatsapp_phone, {
      productName: product.name,
      price: product.salePrice,
      image: product.images[0]
    });
  }
}

async function sendWhatsAppMessage(phoneNumber, product) {
  const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  
  await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${phoneNumber}`,
    body: `
🆕 *Novo Produto Disponível!*

📦 ${product.productName}
💰 ${formatCurrency(product.price)}

Acesse agora: ${process.env.FRONTEND_URL}/produtos
    `.trim()
  });
}
```

### 6. Implementação Frontend

#### Service de Notificações

```typescript
// notification.service.ts
interface NotificationPreferences {
  whatsappEnabled: boolean;
  whatsappPhone: string;
  emailEnabled: boolean;
  emailAddress: string;
  pushEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}
  
  savePreferences(prefs: NotificationPreferences): Observable<any> {
    return this.http.post('/api/notification-preferences', prefs);
  }
  
  getPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>('/api/notification-preferences');
  }
}
```

### 7. Fluxo Completo

1. **Cliente ativa notificações:**
   - Acessa `/configuracoes/notificacoes`
   - Ativa WhatsApp
   - Informa número: `82999999999`
   - Frontend salva no backend
   - Backend armazena no banco

2. **Admin cria produto:**
   - Acessa dashboard admin
   - Cria novo produto
   - Backend salva produto
   - Backend dispara webhook de notificação
   - Sistema busca todos com WhatsApp ativo
   - Envia mensagem para cada um via Twilio

3. **Cliente recebe:**
   - Mensagem no WhatsApp
   - Clica no link
   - Acessa site e vê produto

### 8. Considerações de Segurança

- ✅ Validar formato de número de telefone
- ✅ Sanitizar dados antes de enviar
- ✅ Rate limiting (evitar spam)
- ✅ Opt-out fácil para usuário
- ✅ LGPD: armazenar consentimento explícito
- ✅ Criptografar números no banco

### 9. Próximos Passos

**Fase 1: Setup Básico**
1. ✅ Criar models e interfaces
2. ✅ Criar service de notificações
3. ✅ Criar repository de notificações
4. ✅ Conectar página existente ao backend

**Fase 2: Backend**
1. 🔄 Criar endpoints de preferências
2. 🔄 Criar tabela no banco de dados
3. 🔄 Implementar webhook de produto novo

**Fase 3: WhatsApp**
1. 🔄 Criar conta Twilio
2. 🔄 Configurar número WhatsApp
3. 🔄 Implementar envio de mensagens
4. 🔄 Testar com sandbox

**Fase 4: Produção**
1. 🔄 Adicionar filas (Bull/Redis)
2. 🔄 Monitoramento de entregas
3. 🔄 Logs de notificações
4. 🔄 Dashboard de métricas

### 10. Custos Estimados

**Twilio (Recomendado):**
- Sandbox: Gratuito (apenas testes)
- Produção: $0.005 por mensagem
- Ex: 1000 notificações/mês = $5.00

**WhatsApp Business API:**
- Conversas iniciadas pelo negócio: $0.005-0.09 por conversa
- Taxas variam por país

**Evolution API:**
- Gratuito (self-hosted)
- Custo apenas de servidor
