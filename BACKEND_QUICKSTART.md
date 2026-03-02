# ⚡ Quick Start - Backend Developer

**Tempo estimado**: 30 minutos para implementação básica

---

## 🎯 O que você precisa fazer

Criar uma API REST com 6 endpoints para gerenciar produtos de móveis e eletros.

---

## 📦 Endpoint Essenciais

```
baseURL: http://localhost:3000/api

✅ GET    /products           # Listar todos
✅ GET    /products/:id       # Buscar por ID  
✅ POST   /products           # Criar novo
✅ PUT    /products/:id       # Atualizar
✅ DELETE /products/:id       # Remover
✅ POST   /products/:id/sold  # Marcar como vendido
```

---

## 🗄️ Modelo de Dados

```json
{
  "id": 1,
  "name": "Sofá 3 Lugares",
  "slug": "sofa-3-lugares",
  "description": "Descrição completa...",
  "price": 189900,              // ⚠️ EM CENTAVOS!
  "costPrice": 130000,          // ⚠️ EM CENTAVOS!
  "condition": "novo",          // ou "usado"
  "category": "Sofá",           // string livre
  "images": ["url1.jpg"],       // array de URLs
  "stock": 5,
  "dimensions": {
    "width": 220,
    "height": 85,
    "depth": 95,
    "unit": "cm"
  },
  "material": "Tecido",
  "color": "Cinza",
  "brand": "Util Lar",
  "warranty": "90 dias",
  "featured": true,
  "soldDate": null,             // ISO 8601 quando vendido
  "createdAt": "2026-02-28T10:00:00Z",
  "updatedAt": "2026-02-28T10:00:00Z"
}
```

### Campos Obrigatórios

```typescript
{
  name: string,
  description: string,
  price: number,          // em centavos
  condition: 'novo' | 'usado',
  category: string,
  stock: number,
  featured: boolean
}
```

### ⚠️ IMPORTANTE: Preços em Centavos

```javascript
R$ 1.899,00  →  price: 189900
R$ 459,50    →  price: 45950
R$ 10,00     →  price: 1000
```

---

## 🚀 Implementação Rápida

### 1. Criar Tabela/Collection

#### PostgreSQL

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  cost_price INTEGER,
  condition VARCHAR(10) NOT NULL,
  category VARCHAR(100) NOT NULL,
  images TEXT[],
  stock INTEGER NOT NULL DEFAULT 0,
  dimensions JSONB,
  material VARCHAR(100),
  color VARCHAR(50),
  brand VARCHAR(100),
  warranty VARCHAR(100),
  featured BOOLEAN DEFAULT false,
  sold_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### MongoDB (Mongoose)

```javascript
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  costPrice: Number,
  condition: { type: String, enum: ['novo', 'usado'], required: true },
  category: { type: String, required: true },
  images: [String],
  stock: { type: Number, default: 0 },
  dimensions: {
    width: Number,
    height: Number,
    depth: Number,
    unit: String
  },
  material: String,
  color: String,
  brand: String,
  warranty: String,
  featured: { type: Boolean, default: false },
  soldDate: Date
}, { timestamps: true });
```

---

### 2. Implementar Geração de Slug

```javascript
// JavaScript/TypeScript
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// "Sofá 3 Lugares" → "sofa-3-lugares"
```

```python
# Python
from slugify import slugify

slug = slugify("Sofá 3 Lugares")  # → "sofa-3-lugares"
```

---

### 3. Implementar Endpoints

#### Node.js + Express

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// CORS obrigatório!
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// 1. Listar todos
app.get('/api/products', async (req, res) => {
  const { category, condition, featured } = req.query;
  // Aplicar filtros se fornecidos
  const products = await db.findProducts({ category, condition, featured });
  res.json(products);
});

// 2. Buscar por ID
app.get('/api/products/:id', async (req, res) => {
  const product = await db.findProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(product);
});

// 3. Criar novo
app.post('/api/products', async (req, res) => {
  const data = req.body;
  data.slug = generateSlug(data.name);
  const product = await db.createProduct(data);
  res.status(201).json(product);
});

// 4. Atualizar
app.put('/api/products/:id', async (req, res) => {
  const data = req.body;
  if (data.name) data.slug = generateSlug(data.name);
  const product = await db.updateProduct(req.params.id, data);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(product);
});

// 5. Remover
app.delete('/api/products/:id', async (req, res) => {
  const deleted = await db.deleteProduct(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json({ message: 'Produto removido com sucesso' });
});

// 6. Marcar como vendido
app.post('/api/products/:id/sold', async (req, res) => {
  const soldDate = req.body.soldDate || new Date().toISOString();
  const product = await db.updateProduct(req.params.id, {
    soldDate,
    stock: 0
  });
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(product);
});

app.listen(3000, () => console.log('API rodando na porta 3000'));
```

---

### 4. Popular com Dados de Teste

```javascript
const testProducts = [
  {
    name: "Sofá 3 Lugares Retrátil Cinza",
    description: "Sofá confortável com mecanismo retrátil",
    price: 189900,
    costPrice: 130000,
    condition: "novo",
    category: "Sofá",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"],
    stock: 5,
    featured: true
  },
  {
    name: "Mesa de Jantar 6 Lugares",
    description: "Mesa em madeira maciça",
    price: 129900,
    costPrice: 85000,
    condition: "novo",
    category: "Mesa",
    images: ["https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=800"],
    stock: 3,
    featured: true
  }
];

// Inserir no banco
testProducts.forEach(async (product) => {
  product.slug = generateSlug(product.name);
  await db.createProduct(product);
});
```

---

## ✅ Checklist Rápido

```
□ Criar tabela/collection 'products'
□ Implementar geração automática de slug
□ Implementar GET /api/products
□ Implementar GET /api/products/:id
□ Implementar POST /api/products
□ Implementar PUT /api/products/:id
□ Implementar DELETE /api/products/:id
□ Implementar POST /api/products/:id/sold
□ Configurar CORS para localhost:4200
□ Popular banco com 3-5 produtos de teste
□ Testar todos endpoints no Postman
```

---

## 🧪 Testar

```bash
# 1. Criar produto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sofá de Teste",
    "description": "Descrição teste",
    "price": 100000,
    "costPrice": 70000,
    "condition": "novo",
    "category": "Sofá",
    "images": null,
    "stock": 5,
    "featured": false
  }'

# 2. Listar todos
curl http://localhost:3000/api/products

# 3. Buscar por ID
curl http://localhost:3000/api/products/1

# 4. Marcar como vendido
curl -X POST http://localhost:3000/api/products/1/sold \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 🔗 Conectar Frontend

Após implementar backend:

```typescript
// Frontend: src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'  // ⬅️ Sua API
};
```

E seguir: **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)**

---

## 📚 Documentação Completa

- **[📋 BACKEND_API_SPECIFICATION.md](./BACKEND_API_SPECIFICATION.md)** - Especificação técnica completa
- **[🔌 INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Guia de integração passo a passo  
- **[📮 API_EXAMPLES.md](./API_EXAMPLES.md)** - Exemplos de requisições HTTP
- **[📖 README.md](./README.md)** - Documentação geral do projeto

---

## 💡 Dicas

### Timestamps Automáticos

```javascript
// Sempre atualizar updatedAt ao editar
product.updatedAt = new Date().toISOString();
```

### Validação de Preços

```javascript
// Garantir que preços são inteiros positivos
if (price < 0 || !Number.isInteger(price)) {
  throw new Error('Preço deve ser inteiro positivo em centavos');
}
```

### Slug Único

```javascript
// Verificar se slug já existe antes de criar
const existing = await db.findBySlug(slug);
if (existing) {
  slug = `${slug}-${Date.now()}`;  // Adicionar timestamp
}
```

---

## 🐛 Problemas Comuns

### CORS Error
```javascript
// Adicionar ao Express
app.use(cors({ origin: 'http://localhost:4200' }));
```

### Preços Errados
```javascript
// Converter reais → centavos ao salvar
const priceInCents = Math.round(priceInReais * 100);
```

### Datas Inválidas
```javascript
// Usar ISO 8601
const date = new Date().toISOString();  // "2026-02-28T15:30:00Z"
```

---

## 📞 Precisa de Ajuda?

- Consultar **BACKEND_API_SPECIFICATION.md** para detalhes completos
- Testar endpoints no **Postman** usando **API_EXAMPLES.md**
- Seguir **INTEGRATION_GUIDE.md** para conectar ao frontend

---

**Boa sorte! 🚀**
