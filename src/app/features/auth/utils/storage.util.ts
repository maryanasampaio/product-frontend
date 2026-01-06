/**
 * ============================================================================
 * STORAGE UTILITIES - FUNÇÕES UTILITÁRIAS PARA ARMAZENAMENTO
 * ============================================================================
 *
 * RESPONSABILIDADE: Gerenciar armazenamento local de dados de autenticação
 *
 * Por que separar em utils?
 * ✅ REUTILIZAÇÃO: Pode ser usado em qualquer lugar da aplicação
 * ✅ MANUTENIBILIDADE: Se mudar a estratégia de storage, muda apenas aqui
 * ✅ TESTABILIDADE: Fácil de testar funções isoladas
 * ✅ CENTRALIZAÇÃO: Um único lugar controla como dados são armazenados
 *
 * localStorage vs sessionStorage vs cookies:
 * - localStorage: Persiste mesmo fechando navegador (usado aqui)
 * - sessionStorage: Limpa ao fechar aba
 * - cookies: Enviados automaticamente em requisições
 *
 * SEGURANÇA: Nunca armazenar senhas! Apenas token JWT.
 * ============================================================================
 */

/**
 * ========================================================================
 * TOKEN MANAGEMENT - Gerenciamento de Token JWT
 * ========================================================================
 */

/**
 * Armazena o token JWT no localStorage
 *
 * O token é usado para autenticar todas as próximas requisições ao backend.
 *
 * @param token - String JWT recebida do backend após login
 *
 * Como funciona:
 * 1. Recebe token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 2. Armazena no localStorage com chave 'auth_token'
 * 3. Token fica disponível até ser removido manualmente ou browser ser limpo
 *
 * Exemplo:
 * ```typescript
 * saveToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * // Agora o token está salvo e pode ser recuperado com getToken()
 * ```
 */
export function saveToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem('auth_token', token);
}

/**
 * Recupera o token JWT do localStorage
 *
 * @returns Token JWT ou null se não existir
 *
 * Retorna null quando:
 * - Usuário nunca fez login
 * - Token foi removido (logout)
 * - localStorage foi limpo
 *
 * Exemplo:
 * ```typescript
 * const token = getToken();
 * if (token) {
 *   console.log('Usuário está autenticado');
 * } else {
 *   console.log('Usuário não está autenticado');
 * }
 * ```
 */
export function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem('auth_token');
}

/**
 * Remove o token JWT do localStorage
 *
 * Usado no logout para "desautenticar" o usuário.
 * Após remover, getToken() retornará null.
 *
 * Exemplo:
 * ```typescript
 * removeToken();
 * console.log(getToken()); // null
 * ```
 */
export function removeToken(): void {
  if (!isBrowser()) return;
  localStorage.removeItem('auth_token');
}

/**
 * Verifica se o usuário está autenticado
 *
 * @returns true se existe token, false se não existe
 *
 * Lógica:
 * 1. Pega o token com getToken()
 * 2. Usa !! (double negation) para converter em boolean
 *    - !!null = false
 *    - !!"string" = true
 *
 * Exemplo:
 * ```typescript
 * if (isAuthenticated()) {
 *   // Mostrar dashboard
 * } else {
 *   // Redirecionar para login
 * }
 * ```
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * ========================================================================
 * USER DATA MANAGEMENT - Gerenciamento de Dados do Usuário
 * ========================================================================
 */

/**
 * Armazena dados do usuário no localStorage
 *
 * Salva informações não-sensíveis do usuário para uso na UI.
 *
 * @param username - Nome de usuário (ex: 'admin')
 * @param nome - Nome completo (ex: 'Administrador')
 *
 * Por que salvar?
 * - Exibir nome do usuário no header sem fazer nova requisição
 * - Usar username em logs
 * - Personalizar interface
 *
 * IMPORTANTE: NÃO salvar dados sensíveis (senha, CPF, etc.)
 *
 * Como funciona:
 * 1. Cria objeto { username: '...', nome: '...' }
 * 2. Converte para JSON string com JSON.stringify()
 * 3. Armazena no localStorage
 *
 * Exemplo:
 * ```typescript
 * saveUser('admin', 'Administrador');
 * // localStorage agora tem: user_data = '{"username":"admin","nome":"Administrador"}'
 * ```
 */
export function saveUser(username: string, nome: string): void {
  if (!isBrowser()) return;
  const userData = { username, nome };
  localStorage.setItem('user_data', JSON.stringify(userData));
}

/**
 * Recupera dados do usuário do localStorage
 *
 * @returns Objeto com username e nome, ou null se não existir
 *
 * Como funciona:
 * 1. Pega string JSON do localStorage
 * 2. Se não existe, retorna null
 * 3. Se existe, converte JSON string para objeto com JSON.parse()
 * 4. Retorna objeto
 *
 * Exemplo:
 * ```typescript
 * const user = getUser();
 * if (user) {
 *   console.log(`Bem-vindo, ${user.nome}!`);
 * }
 * ```
 */
export function getUser(): { username: string; nome: string } | null {
  if (!isBrowser()) return null;
  const data = localStorage.getItem('user_data');
  return data ? JSON.parse(data) : null;

  // Operador ternário equivale a:
  // if (data) {
  //   return JSON.parse(data);
  // } else {
  //   return null;
  // }
}

/**
 * Remove dados do usuário do localStorage
 *
 * Usado no logout para limpar todas as informações do usuário.
 * Após remover, getUser() retornará null.
 *
 * Exemplo:
 * ```typescript
 * removeUser();
 * console.log(getUser()); // null
 * ```
 */
export function removeUser(): void {
  if (!isBrowser()) return;
  localStorage.removeItem('user_data');
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}
