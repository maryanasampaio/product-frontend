/**
 * ============================================================================
 * MODELS (MODELOS DE DADOS)
 * ============================================================================
 *
 * Este arquivo define a ESTRUTURA DOS DADOS usados na feature de autenticação.
 *
 * Por que usar interfaces?
 * - Type Safety: TypeScript verifica se você está usando os dados corretamente
 * - Autocomplete: IDE sugere propriedades disponíveis
 * - Documentação: Deixa claro qual é a estrutura esperada
 * - Refatoração: Se mudar a estrutura, TypeScript avisa todos os lugares que precisam mudar
 *
 * Analogia: É como um "contrato" que define o formato dos dados
 * ============================================================================
 */

/**
 * LoginRequest - Dados que ENVIAMOS para o backend no login
 *
 * Representa o corpo da requisição POST /auth/login
 *
 * Exemplo de uso:
 * ```typescript
 * const request: LoginRequest = {
 *   username: 'admin',
 *   password: '123456'
 * };
 * ```
 */
export interface LoginRequest {
  /** Nome de usuário (ex: 'admin') */
  username: string;

  /** Senha do usuário (ex: '123456') */
  password: string;
}

/**
 * LoginResponse - Dados que RECEBEMOS do backend após login bem-sucedido
 *
 * Representa a resposta do backend quando o login é bem-sucedido.
 * O backend retorna exatamente esta estrutura:
 *
 * Exemplo de resposta do backend:
 * ```json
 * {
 *   "username": "admin",
 *   "nome": "Administrador",
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * ```
 */
export interface LoginResponse {
  /** Nome de usuário (mesmo que foi enviado no request) */
  username: string;

  /** Nome completo ou nome de exibição do usuário */
  nome: string;

  /** Token JWT usado para autenticar próximas requisições */
  token: string;
}

/**
 * User - Dados do usuário armazenados localmente na aplicação
 *
 * Estrutura usada para representar o usuário logado no sistema.
 * Geralmente armazenado no localStorage e usado em toda aplicação.
 *
 * IMPORTANTE: Esta interface tem a mesma estrutura que LoginResponse,
 * mas semanticamente representa o usuário já autenticado no sistema.
 *
 * Uso comum:
 * ```typescript
 * const currentUser: User = authService.getCurrentUser();
 * console.log(`Bem-vindo, ${currentUser.nome}!`);
 * ```
 */
export interface User {
  /** Identificador único do usuário */
  username: string;

  /** Nome de exibição do usuário */
  nome: string;

  /** Token JWT para autenticação nas requisições */
  token: string;
}
