# 🔐 Autenticação JWT - Backend Implementado

## ⚠️ IMPORTANTE

O backend possui autenticação JWT obrigatória. Todos os endpoints de produtos requerem token de autenticação.

---

## 🔑 Sistema de Autenticação

### Credenciais Admin

```
Username: admin
Password: 123456
```

---

## 📡 Endpoint de Login

### Request

```http
POST http://localhost:3000/auth/login
Content-Type: application/json
```

### Body

```json
{
  "username": "admin",
  "password": "123456"
}
```

### Response 200 OK

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "expiresIn": 3600
}
```

### cURL

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456"
  }'
```

---

## 🔒 Usando o Token

Após fazer login, use o `accessToken` em todas as requisições aos endpoints de produtos:

### Header Obrigatório

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 Endpoints com Autenticação

Todos os endpoints de produtos requerem o header `Authorization`:

```http
# 1. Listar produtos
GET http://localhost:3000/api/products
Authorization: Bearer {{token}}

# 2. Buscar por ID
GET http://localhost:3000/api/products/1
Authorization: Bearer {{token}}

# 3. Criar produto
POST http://localhost:3000/api/products
Authorization: Bearer {{token}}
Content-Type: application/json

# 4. Atualizar produto
PUT http://localhost:3000/api/products/1
Authorization: Bearer {{token}}
Content-Type: application/json

# 5. Remover produto
DELETE http://localhost:3000/api/products/1
Authorization: Bearer {{token}}

# 6. Marcar como vendido
POST http://localhost:3000/api/products/1/sold
Authorization: Bearer {{token}}
Content-Type: application/json
```

---

## 🔄 Fluxo de Autenticação

```mermaid
sequenceDiagram
    Frontend->>Backend: POST /auth/login {username, password}
    Backend->>Frontend: {accessToken: "jwt..."}
    Frontend->>Frontend: Armazenar token (localStorage)
    Frontend->>Backend: GET /api/products (Authorization: Bearer jwt...)
    Backend->>Backend: Validar token
    Backend->>Frontend: [produtos...]
```

---

## 💾 Armazenamento do Token

### Frontend (TypeScript)

```typescript
// Após login bem-sucedido
const response = await this.http.post('/auth/login', {
  username: 'admin',
  password: '123456'
}).toPromise();

// Armazenar token
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('username', response.username);
```

---

## 🔧 Implementação no Frontend

### 1. Criar AuthService

**Arquivo**: `src/app/core/services/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  username: string;
  expiresIn?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl = environment.authUrl || 'http://localhost:3000';
  private readonly tokenKey = 'accessToken';
  private readonly usernameKey = 'authUsername';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  /**
   * Faz login no backend e armazena o token
   */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/auth/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        this.setUsername(response.username);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Faz logout (remove token)
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Retorna o token armazenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Retorna username armazenado
   */
  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  // Private methods
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUsername(username: string): void {
    localStorage.setItem(this.usernameKey, username);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}
```

---

### 2. Criar AuthInterceptor

**Arquivo**: `src/app/core/interceptors/auth.interceptor.ts`

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Adicionar token apenas se existir e não for requisição de login
  if (token && !req.url.includes('/auth/login')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

---

### 3. Registrar Interceptor

**Arquivo**: `src/app/app.config.ts`

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    // ... outros providers
  ]
};
```

---

### 4. Atualizar AdminModeService

**Arquivo**: `src/app/core/services/admin-mode.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminModeService {
  private readonly adminModeKey = 'adminMode';
  private readonly isAdminSubject: BehaviorSubject<boolean>;
  public readonly isAdmin$: Observable<boolean>;

  constructor(private readonly authService: AuthService) {
    const savedMode = localStorage.getItem(this.adminModeKey) === 'true';
    this.isAdminSubject = new BehaviorSubject<boolean>(savedMode);
    this.isAdmin$ = this.isAdminSubject.asObservable();
  }

  /**
   * Ativa modo admin com login real no backend
   */
  enableAdminMode(password: string = '123456'): Observable<any> {
    return new Observable(observer => {
      this.authService.login('admin', password).subscribe({
        next: (response) => {
          localStorage.setItem(this.adminModeKey, 'true');
          this.isAdminSubject.next(true);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Desativa modo admin e faz logout
   */
  disableAdminMode(): void {
    localStorage.removeItem(this.adminModeKey);
    this.isAdminSubject.next(false);
    this.authService.logout();
  }

  /**
   * Verifica se está em modo admin
   */
  isAdmin(): boolean {
    return this.isAdminSubject.value;
  }

  /**
   * Toggle modo admin (não recomendado, use enableAdminMode)
   */
  toggleAdminMode(): void {
    if (this.isAdmin()) {
      this.disableAdminMode();
    } else {
      // Precisa chamar enableAdminMode com senha
      console.warn('Use enableAdminMode() com senha');
    }
  }
}
```

---

### 5. Atualizar Environments

**Arquivo**: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  authUrl: 'http://localhost:3000'  // ⬅️ NOVO
};
```

**Arquivo**: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.utillar.com.br/api',
  authUrl: 'https://api.utillar.com.br'  // ⬅️ NOVO
};
```

---

## 🧪 Testando Autenticação

### 1. Fazer Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzA5MTI4MDAwfQ.abc123..."
}
```

### 2. Usar Token nas Requisições

```bash
# Copiar token da resposta
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Listar produtos com autenticação
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN"
```

---

## ⚠️ Erros Comuns

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causa**: Token ausente, inválido ou expirado  
**Solução**: Fazer login novamente e obter novo token

---

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

**Causa**: Token válido mas sem permissões  
**Solução**: Verificar se está usando credenciais de admin

---

## 🔄 Renovação de Token

Se o backend implementar refresh token:

```typescript
refreshToken(): Observable<LoginResponse> {
  const refreshToken = localStorage.getItem('refreshToken');
  return this.http.post<LoginResponse>(`${this.authUrl}/auth/refresh`, {
    refreshToken
  }).pipe(
    tap(response => {
      this.setToken(response.accessToken);
    })
  );
}
```

---

## 📱 Fluxo no Frontend

### Ao Abrir Aplicação

```typescript
ngOnInit() {
  // Verificar se tem token armazenado
  if (this.authService.isAuthenticated()) {
    // Token existe, tentar usar
    this.loadProducts();
  } else {
    // Sem token, fazer login automaticamente (modo admin)
    if (localStorage.getItem('adminMode') === 'true') {
      this.adminModeService.enableAdminMode().subscribe();
    }
  }
}
```

### Triple-Click no Logo

```typescript
onLogoClick(): void {
  this.logoClickCount++;
  
  if (this.logoClickCount === 3) {
    // Fazer login real no backend
    this.adminModeService.enableAdminMode('123456').subscribe({
      next: () => {
        alert('Modo admin ativado!');
      },
      error: (error) => {
        alert('Erro ao ativar modo admin: ' + error.message);
      }
    });
    this.logoClickCount = 0;
  }
}
```

---

## 🔒 Segurança

### ✅ Boas Práticas

1. **Nunca expor credenciais no código**
   - Usar variáveis de ambiente
   - Não commitar senhas no Git

2. **Armazenar token com segurança**
   - localStorage é aceitável para SPAs
   - Considerar httpOnly cookies para mais segurança

3. **Implementar timeout de sessão**
   ```typescript
   // Fazer logout após 1 hora de inatividade
   setTimeout(() => {
     this.authService.logout();
   }, 3600000);
   ```

4. **Limpar dados ao fazer logout**
   ```typescript
   logout(): void {
     localStorage.clear();
     sessionStorage.clear();
     this.router.navigate(['/login']);
   }
   ```

---

## 📊 Postman Collection

Variáveis da collection:

```json
{
  "baseUrl": "http://localhost:3000/api",
  "authBaseUrl": "http://localhost:3000",
  "accessToken": ""
}
```

### Automatizar Token no Postman

**Em "Tests" do endpoint de login**:

```javascript
// Extrair token da resposta
const response = pm.response.json();
pm.environment.set("accessToken", response.accessToken);
```

Agora todas as requisições subsequentes vão usar o token automaticamente.

---

## 🚀 Próximos Passos

1. Implementar `AuthService` no frontend
2. Criar `AuthInterceptor` para adicionar token automaticamente
3. Atualizar `AdminModeService` para usar login real
4. Testar fluxo completo de login → listar produtos
5. Implementar tratamento de erro 401 (auto-logout)

---

**Última atualização**: 28/02/2026  
**Versão**: 2.0.0 (com autenticação JWT)
