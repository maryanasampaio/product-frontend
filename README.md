# 🏡 Util Lar - Sistema de Gestão de Produtos

Sistema web para gestão de móveis e eletrodomésticos novos e seminovos, com dashboard financeiro e área administrativa.

![Angular](https://img.shields.io/badge/Angular-21.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38bdf8)

---

## 📚 Documentação

Este projeto possui documentação completa para desenvolvedores backend e frontend:

- **[📚 DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - **Comece aqui!** Índice completo de toda documentação
- **[⚡ BACKEND_QUICKSTART.md](./BACKEND_QUICKSTART.md)** - Guia rápido de 30min para criar a API
- **[📋 BACKEND_API_SPECIFICATION.md](./BACKEND_API_SPECIFICATION.md)** - Especificação técnica completa
- **[📮 API_EXAMPLES.md](./API_EXAMPLES.md)** - Exemplos de requisições HTTP (Postman/cURL)
- **[🔌 INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Guia de integração frontend-backend

---

## 🎯 Funcionalidades

### Para Clientes
- ✅ Visualização de produtos com filtros por categoria
- ✅ Detalhes completos dos produtos (preço, dimensões, material, etc.)
- ✅ Contato direto via WhatsApp
- ✅ Interface responsiva e moderna
- ✅ Categorização: Sofás, Mesas, Armários, Cadeiras, Racks, Eletros

### Para Administradores
- ✅ Dashboard financeiro com métricas em tempo real
- ✅ Gestão completa de produtos (CRUD)
- ✅ Controle de estoque
- ✅ Marcação de produtos vendidos
- ✅ Análise de lucro e margem
- ✅ Identificação de produtos com baixa margem
- ✅ Alertas de estoque antigo

### Modo Admin
- Triple-click no logo → Senha: `utillar2026`
- Acesso a todas as funcionalidades administrativas

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20.x ou superior
- Angular CLI 21.x

### Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/product-frontend.git

# Instalar dependências
cd product-frontend
npm install

# Iniciar servidor de desenvolvimento
ng serve
```

Acesse: `http://localhost:4200`

---

## 🔌 Integração com Backend

**⚠️ IMPORTANTE**: O sistema atualmente usa dados mockados (simulados). Para conectar a um backend real:

### Documentação Disponível

1. **[📋 BACKEND_API_SPECIFICATION.md](./BACKEND_API_SPECIFICATION.md)**
   - Especificação completa da API REST
   - Modelos de dados (JSON)
   - Endpoints necessários
   - Validações e regras de negócio
   - Schema do banco de dados
   
2. **[🔌 INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)**
   - Guia passo a passo de integração
   - Configuração do environment
   - Criação do repository real
   - Troubleshooting
   - Checklist de testes

### Resumo da Integração

```typescript
// 1. Atualizar environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/api'
};

// 2. Criar ProductRepository conectado ao backend
// 3. Substituir mock pelo repository real no ProductService
// 4. Testar todas as funcionalidades
```

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── core/                      # Serviços globais e guards
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   └── services/
│   │       ├── admin-mode.service.ts
│   │       └── sidebar.service.ts
│   │
│   ├── features/                  # Módulos de funcionalidades
│   │   ├── auth/                  # Autenticação (planejado)
│   │   │   └── models/
│   │   │
│   │   ├── management/            # Área administrativa
│   │   │   └── pages/
│   │   │       └── financial-dashboard/
│   │   │           └── financial-dashboard.component.ts
│   │   │
│   │   └── products/              # Gestão de produtos
│   │       ├── components/
│   │       │   └── product-form-modal/
│   │       ├── models/
│   │       │   └── product.model.ts
│   │       ├── pages/
│   │       │   ├── dashboard/
│   │       │   └── product-detail/
│   │       ├── repositories/      # (Criar aqui ao integrar)
│   │       └── services/
│   │           ├── product.service.ts
│   │           └── product-mock.service.ts
│   │
│   ├── shared/                    # Componentes compartilhados
│   │   ├── components/
│   │   │   ├── admin-login-modal/
│   │   │   ├── sidebar/
│   │   │   └── welcome-modal/
│   │   └── layouts/
│   │       ├── app-layout/
│   │       └── auth-layout/
│   │
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.ts
│
└── environments/
    ├── environment.ts             # Configuração dev
    └── environment.prod.ts        # Configuração produção
```

---

## 🎨 Tecnologias

- **Framework**: Angular 21
- **Linguagem**: TypeScript 5.x
- **Estilização**: TailwindCSS 3.x
- **Gerenciamento de Estado**: RxJS (BehaviorSubject, Observables)
- **Roteamento**: Angular Router
- **HTTP Client**: Angular HttpClient
- **Build**: Angular CLI + esbuild

---

## 💰 Modelo de Dados

### Produto (Product)

```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;              // ⚠️ Em centavos (50000 = R$ 500,00)
  costPrice?: number;         // ⚠️ Em centavos
  condition: 'novo' | 'seminovo';
  category: string;           // 'Sofá', 'Mesa', 'Cadeira', etc.
  images: string[] | null;
  stock: number;
  dimensions?: { width, height, depth, unit };
  material?: string;
  color?: string;
  brand?: string;
  warranty?: string;
  featured: boolean;
  soldDate?: string;          // ISO 8601
  createdAt: string;
  updatedAt: string;
}
```

### ⚠️ Formato de Preços

Todos os valores monetários são armazenados em **centavos**:
- R$ 1.899,00 = `189900`
- R$ 459,50 = `45950`

---

## 🧪 Como Testar

### 1. Modo Cliente (Padrão)

```bash
ng serve
# Acessar http://localhost:4200
```

- Navegar pelos produtos
- Filtrar por categoria (Sofás, Mesas, Armários, etc.)
- Ver detalhes dos produtos
- Clicar no botão WhatsApp

### 2. Modo Admin

1. Triple-click no logo "Util Lar"
2. Digite a senha: `utillar2026`
3. Agora você tem acesso a:
   - Botão "Adicionar Novo Produto"
   - Botões de editar (✏️), marcar como vendido (✓), remover (🗑️)
   - Sidebar → Gerenciamento (Dashboard Financeiro)

### 3. Dashboard Financeiro

- Sidebar → Gerenciamento
- Visualize métricas:
  - 💰 Lucro do Mês (com variação %)
  - 📦 Vendas do Mês (ticket médio)
  - 📊 Margem Geral
  - 🧊 Estoque Atual
- Gráficos de evolução
- Top 3 produtos mais vendidos
- Produtos com baixa margem

---

## 🏗️ Build para Produção

```bash
# Build otimizado
ng build --configuration=production

# Arquivos gerados em: dist/product-frontend/browser/
```

### Deploy

Os arquivos gerados podem ser hospedados em:
- **Vercel** (recomendado para Angular)
- **Netlify**
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**
- **Firebase Hosting**

**Importante**: Atualizar `environment.prod.ts` com URL de produção do backend.

---

## 🔐 Segurança

### Dados Sensíveis

- **Preço de Custo** (`costPrice`): Visível apenas no modo admin
- **Modo Admin**: Gerenciado por localStorage (frontend only)
- **Senha Admin**: `utillar2026` (hardcoded por enquanto)

### Para Produção

⚠️ **Recomendações de segurança**:
1. Implementar autenticação JWT real no backend
2. Substituir senha hardcoded por autenticação via API
3. Usar variáveis de ambiente para segredos
4. Implementar rate limiting no backend
5. Adicionar HTTPS obrigatório

---

## 📱 Responsividade

O sistema é totalmente responsivo:
- **Mobile**: 1 produto por linha
- **Tablet**: 2 produtos por linha
- **Desktop**: 3 produtos por linha
- **Sidebar**: Colapsa automaticamente em mobile

---

## 🎨 Customização

### Cores do Tema

**Arquivo**: `tailwind.config.js`

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#fb923c',    // Laranja
        secondary: '#f97316', // Laranja escuro
        // Adicionar suas cores aqui
      }
    }
  }
}
```

### Logo

Substituir arquivo: `public/logo-utilar.jpg`

---

## 🐛 Problemas Comuns

### Erro: "Cannot find module '@angular/...'"

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: Produtos não aparecem

- Verificar console do navegador (F12)
- Mock service está configurado em `ProductService`
- Dados mockados em `product-mock.service.ts`

### Dashboard financeiro zerado

- Adicionar produtos com `costPrice` preenchido
- Marcar alguns produtos como vendidos (define `soldDate`)

---

## 📚 Scripts Disponíveis

```bash
# Desenvolvimento
npm start            # Inicia servidor dev (porta 4200)
ng serve            # Mesma coisa que npm start

# Build
npm run build       # Build de produção
ng build            # Build de desenvolvimento

# Testes
npm test            # Executa testes unitários
ng test             # Mesma coisa

# Lint
ng lint             # Verifica código com ESLint

# Gerar componentes
ng g c nome         # Gera component
ng g s nome         # Gera service
ng g m nome         # Gera module
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é privado e proprietário.

---

## 📞 Contato

**Util Lar - Móveis e Eletros**

- WhatsApp: +55 82 99657-2843
- Sistema desenvolvido para gestão interna

---

## 🗺️ Roadmap

### ✅ Implementado
- [x] Listagem de produtos com filtros
- [x] Dashboard financeiro completo
- [x] CRUD de produtos (admin)
- [x] Sistema de categorias
- [x] Sidebar responsiva
- [x] Modo admin local
- [x] Mock de dados

### 🚧 Em Desenvolvimento
- [ ] Integração com backend real
- [ ] Upload de imagens
- [ ] Sistema de notificações
- [ ] Histórico de vendas detalhado

### 📋 Planejado
- [ ] Autenticação JWT
- [ ] Painel de relatórios avançado
- [ ] Exportação de dados (PDF/Excel)
- [ ] Sistema de mensagens internas
- [ ] Integração com gateway de pagamento
- [ ] App mobile (React Native)

---

**Desenvolvido com ❤️ para Util Lar**

**Versão**: 1.0.0  
**Última atualização**: 28/02/2026
