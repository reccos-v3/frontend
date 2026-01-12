# Guards de Autenticação

## Guards Disponíveis

### authGuard
Protege rotas exigindo autenticação. Verifica se o usuário está autenticado e se o token é válido.

**Uso:**
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]
}
```

### roleGuard
Protege rotas baseado em roles. Verifica se o usuário tem o role necessário para acessar a rota.

**Uso:**
```typescript
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] }
}

// Múltiplos roles (usuário precisa ter pelo menos um)
{
  path: 'management',
  component: ManagementComponent,
  canActivate: [roleGuard],
  data: { roles: ['ADMIN', 'MODERATOR'] }
}
```

## Exemplo Completo de Rotas

```typescript
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/auth-login/auth-login').then((m) => m.AuthLogin),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard], // Requer autenticação
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    canActivate: [roleGuard], // Requer autenticação + role específico
    data: { roles: ['ADMIN'] }
  },
];
```

