# 📮 Exemplos de Requisições da API

Este documento contém exemplos práticos de requisições que podem ser testadas no **Postman**, **Insomnia** ou **cURL**.

---

## 🔧 Configuração Inicial

**Base URL**: `http://localhost:3000/api`

**Headers** (todas as requisições):
```
Content-Type: application/json
```

---

## 1️⃣ Listar Todos os Produtos

### Request

```http
GET http://localhost:3000/api/products
```

### Response 200 OK

```json
[
  {
    "id": 1,
    "name": "Sofá 3 Lugares Retrátil Cinza",
    "slug": "sofa-3-lugares-retratil-cinza",
    "description": "Sofá confortável de 3 lugares com mecanismo retrátil e encosto reclinável. Perfeito para sala de estar.",
    "price": 189900,
    "costPrice": 130000,
    "condition": "novo",
    "category": "Sofá",
    "images": [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800"
    ],
    "stock": 5,
    "dimensions": {
      "width": 220,
      "height": 85,
      "depth": 95,
      "unit": "cm"
    },
    "material": "Tecido e Espuma",
    "color": "Cinza",
    "brand": "Util Lar",
    "warranty": "90 dias",
    "featured": true,
    "soldDate": null,
    "createdAt": "2026-02-01T10:30:00Z",
    "updatedAt": "2026-02-01T10:30:00Z"
  },
  {
    "id": 2,
    "name": "Mesa de Jantar 6 Lugares Madeira Maciça",
    "slug": "mesa-jantar-6-lugares-madeira",
    "description": "Mesa de jantar robusta em madeira maciça, comporta até 6 pessoas.",
    "price": 129900,
    "costPrice": 85000,
    "condition": "novo",
    "category": "Mesa",
    "images": [
      "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=800"
    ],
    "stock": 3,
    "dimensions": {
      "width": 160,
      "height": 75,
      "depth": 90,
      "unit": "cm"
    },
    "material": "Madeira Maciça",
    "color": "Marrom",
    "brand": "Mobília Prime",
    "warranty": "6 meses",
    "featured": true,
    "soldDate": null,
    "createdAt": "2026-02-15T14:20:00Z",
    "updatedAt": "2026-02-15T14:20:00Z"
  }
]
```

### cURL

```bash
curl -X GET http://localhost:3000/api/products
```

---

## 2️⃣ Filtrar Produtos por Categoria

### Request

```http
GET http://localhost:3000/api/products?category=Sofá
```

### Query Parameters

- `category` (opcional): Filtra por categoria
- `condition` (opcional): `novo` ou `seminovo`
- `featured` (opcional): `true` ou `false`
- `soldDate` (opcional): `null` (apenas não vendidos)

### Exemplos de Filtros

```http
# Apenas sofás
GET /api/products?category=Sofá

# Apenas produtos novos
GET /api/products?condition=novo

# Apenas produtos em destaque
GET /api/products?featured=true

# Apenas produtos não vendidos
GET /api/products?soldDate=null

# Combinação: Sofás novos em destaque
GET /api/products?category=Sofá&condition=novo&featured=true
```

---

## 3️⃣ Buscar Produto por ID

### Request

```http
GET http://localhost:3000/api/products/1
```

### Response 200 OK

```json
{
  "id": 1,
  "name": "Sofá 3 Lugares Retrátil Cinza",
  "slug": "sofa-3-lugares-retratil-cinza",
  "description": "Sofá confortável de 3 lugares...",
  "price": 189900,
  "costPrice": 130000,
  "condition": "novo",
  "category": "Sofá",
  "images": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
  ],
  "stock": 5,
  "dimensions": {
    "width": 220,
    "height": 85,
    "depth": 95,
    "unit": "cm"
  },
  "material": "Tecido e Espuma",
  "color": "Cinza",
  "brand": "Util Lar",
  "warranty": "90 dias",
  "featured": true,
  "soldDate": null,
  "createdAt": "2026-02-01T10:30:00Z",
  "updatedAt": "2026-02-01T10:30:00Z"
}
```

### Response 404 Not Found

```json
{
  "error": "Produto não encontrado",
  "statusCode": 404
}
```

### cURL

```bash
curl -X GET http://localhost:3000/api/products/1
```

---

## 4️⃣ Criar Novo Produto

### Request

```http
POST http://localhost:3000/api/products
Content-Type: application/json
```

### Body (Completo)

```json
{
  "name": "Rack para TV até 55\" com LED",
  "description": "Rack moderno com iluminação LED embutida, 2 gavetas e prateleira central. Suporta TVs de até 55 polegadas.",
  "price": 79900,
  "costPrice": 52000,
  "condition": "novo",
  "category": "Rack",
  "images": [
    "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800",
    "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800"
  ],
  "stock": 7,
  "dimensions": {
    "width": 180,
    "height": 45,
    "depth": 40,
    "unit": "cm"
  },
  "material": "MDF",
  "color": "Preto/Branco",
  "brand": "Util Lar",
  "warranty": "90 dias",
  "featured": true
}
```

### Body (Mínimo - Apenas Campos Obrigatórios)

```json
{
  "name": "Cadeira de Escritório",
  "description": "Cadeira giratória confortável",
  "price": 45900,
  "condition": "novo",
  "category": "Cadeira",
  "images": null,
  "stock": 10,
  "featured": false
}
```

### Response 201 Created

```json
{
  "id": 6,
  "name": "Rack para TV até 55\" com LED",
  "slug": "rack-para-tv-ate-55-com-led",
  "description": "Rack moderno com iluminação LED embutida...",
  "price": 79900,
  "costPrice": 52000,
  "condition": "novo",
  "category": "Rack",
  "images": [
    "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800"
  ],
  "stock": 7,
  "dimensions": {
    "width": 180,
    "height": 45,
    "depth": 40,
    "unit": "cm"
  },
  "material": "MDF",
  "color": "Preto/Branco",
  "brand": "Util Lar",
  "warranty": "90 dias",
  "featured": true,
  "soldDate": null,
  "createdAt": "2026-02-28T15:30:00Z",
  "updatedAt": "2026-02-28T15:30:00Z"
}
```

### cURL

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rack para TV até 55\" com LED",
    "description": "Rack moderno com iluminação LED embutida",
    "price": 79900,
    "costPrice": 52000,
    "condition": "novo",
    "category": "Rack",
    "images": ["https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800"],
    "stock": 7,
    "featured": true
  }'
```

---

## 5️⃣ Atualizar Produto (Completo)

### Request

```http
PUT http://localhost:3000/api/products/1
Content-Type: application/json
```

### Body

```json
{
  "name": "Sofá 3 Lugares Retrátil Cinza - PROMOÇÃO",
  "description": "Sofá confortável de 3 lugares com mecanismo retrátil. AGORA EM PROMOÇÃO!",
  "price": 169900,
  "costPrice": 130000,
  "condition": "novo",
  "category": "Sofá",
  "images": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
  ],
  "stock": 3,
  "dimensions": {
    "width": 220,
    "height": 85,
    "depth": 95,
    "unit": "cm"
  },
  "material": "Tecido e Espuma",
  "color": "Cinza",
  "brand": "Util Lar",
  "warranty": "90 dias",
  "featured": true
}
```

### Response 200 OK

```json
{
  "id": 1,
  "name": "Sofá 3 Lugares Retrátil Cinza - PROMOÇÃO",
  "slug": "sofa-3-lugares-retratil-cinza-promocao",
  "description": "Sofá confortável de 3 lugares com mecanismo retrátil. AGORA EM PROMOÇÃO!",
  "price": 169900,
  // ... resto dos campos
  "updatedAt": "2026-02-28T16:00:00Z"
}
```

---

## 6️⃣ Atualizar Produto (Parcial)

### Request

```http
PATCH http://localhost:3000/api/products/1
Content-Type: application/json
```

### Body (Apenas campos a serem alterados)

```json
{
  "price": 159900,
  "stock": 8,
  "featured": true
}
```

### Response 200 OK

```json
{
  "id": 1,
  "name": "Sofá 3 Lugares Retrátil Cinza",
  // ... campos não modificados permanecem iguais
  "price": 159900,
  "stock": 8,
  "featured": true,
  "updatedAt": "2026-02-28T16:15:00Z"
}
```

### cURL

```bash
curl -X PATCH http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 159900,
    "stock": 8
  }'
```

---

## 7️⃣ Marcar Produto como Vendido

### Request

```http
POST http://localhost:3000/api/products/1/sold
Content-Type: application/json
```

### Body (Opcional)

```json
{
  "soldDate": "2026-02-28T17:00:00Z"
}
```

Ou enviar body vazio `{}` para usar data/hora atual.

### Response 200 OK

```json
{
  "id": 1,
  "name": "Sofá 3 Lugares Retrátil Cinza",
  // ... todos os campos
  "stock": 0,
  "soldDate": "2026-02-28T17:00:00Z",
  "updatedAt": "2026-02-28T17:00:00Z"
}
```

### cURL

```bash
# Com data específica
curl -X POST http://localhost:3000/api/products/1/sold \
  -H "Content-Type: application/json" \
  -d '{"soldDate": "2026-02-28T17:00:00Z"}'

# Com data atual (automática)
curl -X POST http://localhost:3000/api/products/1/sold \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 8️⃣ Remover Produto

### Request

```http
DELETE http://localhost:3000/api/products/1
```

### Response 200 OK

```json
{
  "message": "Produto removido com sucesso",
  "id": 1
}
```

### Response 404 Not Found

```json
{
  "error": "Produto não encontrado",
  "statusCode": 404
}
```

### cURL

```bash
curl -X DELETE http://localhost:3000/api/products/1
```

---

## 9️⃣ Obter Estatísticas (Opcional)

### Request

```http
GET http://localhost:3000/api/products/statistics
```

### Response 200 OK

```json
{
  "currentMonth": {
    "profit": 250000,
    "itemsSold": 12,
    "totalRevenue": 450000,
    "averageTicket": 37500,
    "topProduct": "Sofá 3 Lugares"
  },
  "lastMonth": {
    "profit": 180000,
    "itemsSold": 8
  },
  "overall": {
    "totalProfit": 1250000,
    "totalRevenue": 2400000,
    "averageMargin": 35.5
  },
  "stock": {
    "totalItems": 23,
    "totalValue": 980000,
    "potentialValue": 1520000,
    "potentialProfit": 540000,
    "oldStockCount": 3
  },
  "topProducts": [
    {
      "name": "Sofá 3 Lugares",
      "revenue": 380000,
      "timesSold": 2
    },
    {
      "name": "Mesa de Jantar",
      "revenue": 259800,
      "timesSold": 2
    },
    {
      "name": "Guarda-Roupa",
      "revenue": 139800,
      "timesSold": 2
    }
  ],
  "lowMarginProducts": [
    {
      "name": "Mesa de Centro",
      "margin": 12.5,
      "price": 45000,
      "costPrice": 39500
    }
  ]
}
```

---

## 🔟 Upload de Imagens (Opcional)

### Request

```http
POST http://localhost:3000/api/upload/product-images
Content-Type: multipart/form-data
```

### Body (FormData)

```
images: [file1.jpg, file2.jpg, file3.jpg]
```

### Response 200 OK

```json
{
  "urls": [
    "https://api.utillar.com/uploads/products/abc123.jpg",
    "https://api.utillar.com/uploads/products/def456.jpg",
    "https://api.utillar.com/uploads/products/ghi789.jpg"
  ]
}
```

### cURL

```bash
curl -X POST http://localhost:3000/api/upload/product-images \
  -F "images=@imagem1.jpg" \
  -F "images=@imagem2.jpg"
```

---

## 📋 Validações Esperadas

### Campos Obrigatórios

Se não enviados, backend deve retornar erro 400:

```json
{
  "error": "Validação falhou",
  "statusCode": 400,
  "details": [
    "Campo 'name' é obrigatório",
    "Campo 'price' deve ser um número positivo",
    "Campo 'condition' deve ser 'novo' ou 'seminovo'"
  ]
}
```

### Produto Não Encontrado

Para ID inexistente:

```json
{
  "error": "Produto não encontrado",
  "statusCode": 404
}
```

### Slug Duplicado

Se tentar criar produto com nome que gera slug já existente:

```json
{
  "error": "Produto com este nome já existe",
  "statusCode": 409
}
```

---

## 🔄 Formato de Datas

Todas as datas devem seguir **ISO 8601**:

```
2026-02-28T15:30:00Z          // UTC
2026-02-28T12:30:00-03:00     // Com timezone
```

---

## 💰 Formato de Preços

**Sempre em centavos** (inteiro):

```json
{
  "price": 189900,      // R$ 1.899,00
  "costPrice": 130000   // R$ 1.300,00
}
```

**Conversões**:
- R$ 1.899,00 → `189900`
- R$ 459,50 → `45950`
- R$ 10.000,00 → `1000000`

---

## 🧪 Collection do Postman

Importe esta collection no Postman:

```json
{
  "info": {
    "name": "Util Lar API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Listar Produtos",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/products"
      }
    },
    {
      "name": "Buscar Produto por ID",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/products/1"
      }
    },
    {
      "name": "Criar Produto",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/products",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Novo Produto\",\n  \"description\": \"Descrição do produto\",\n  \"price\": 50000,\n  \"condition\": \"novo\",\n  \"category\": \"Mesa\",\n  \"stock\": 5,\n  \"featured\": false\n}"
        }
      }
    },
    {
      "name": "Atualizar Produto",
      "request": {
        "method": "PUT",
        "url": "{{baseUrl}}/products/1",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"price\": 45000,\n  \"stock\": 10\n}"
        }
      }
    },
    {
      "name": "Marcar como Vendido",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/products/1/sold",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{}"
        }
      }
    },
    {
      "name": "Remover Produto",
      "request": {
        "method": "DELETE",
        "url": "{{baseUrl}}/products/1"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    }
  ]
}
```

---

**Última atualização**: 28/02/2026
