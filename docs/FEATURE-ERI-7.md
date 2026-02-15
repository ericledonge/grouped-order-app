# ERI-7 : Ajouter un souhait (Membre + Admin)

## Contexte

Un membre doit pouvoir naviguer vers une commande ouverte, y ajouter un souhait (jeu), et consulter la liste de ses souhaits. Un admin doit aussi pouvoir creer un souhait **au nom d'un autre membre** via un dropdown de selection.

Le backend est partiellement implemente (endpoints wishes). Il manque :
- L'endpoint `GET /api/users` pour le dropdown admin
- La logique admin/userId dans `POST /api/wishes`
- Tout le frontend

## Architecture

Chaque tache suit l'architecture clean du projet :
- **Backend** : Entity > Port > Repository Drizzle > Use-Case > Route > `app.ts`
- **Frontend** : Types/Schema > Adapter > Repository (hooks TanStack Query) > Service > Use-Case (hook) > View (composant)

---

## Tache 1 — Backend : endpoint `GET /api/users` (admin only)

### 1.1 Port

**Fichier** : `backend/src/domain/ports/user.repository.port.ts` (nouveau)

```typescript
import type { User } from "../entities/user.entity.js";

export interface IUserRepository {
  findAll(): Promise<User[]>;
}
```

### 1.2 Repository Drizzle

**Fichier** : `backend/src/infrastructure/repositories/drizzle-user.repository.ts` (nouveau)

```typescript
import type { IUserRepository } from "../../domain/ports/user.repository.port.js";
import type { User } from "../../domain/entities/user.entity.js";
import type { Database } from "../db/index.js";

export function createDrizzleUserRepository(db: Database): IUserRepository {
  return {
    async findAll() {
      return db.query.user.findMany({
        orderBy: (user, { asc }) => [asc(user.name)],
      }) as Promise<User[]>;
    },
  };
}
```

### 1.3 Use-Case

**Fichier** : `backend/src/application/use-cases/user/list-users.use-case.ts` (nouveau)

```typescript
import type { IUserRepository } from "../../../domain/ports/user.repository.port.js";

export function listUsersUseCase(userRepo: IUserRepository) {
  return async () => {
    const users = await userRepo.findAll();
    return users.map((u) => ({ id: u.id, name: u.name, email: u.email }));
  };
}
```

> Note : on projette les champs pour ne retourner que `id`, `name`, `email` (pas de role, ban, etc.).

### 1.4 Route

**Fichier** : `backend/src/infrastructure/http/routes/user.routes.ts` (nouveau)

```typescript
import { Hono } from "hono";
import type { AppEnv } from "../../auth/auth.middleware.js";
import { requireAdmin } from "../../auth/auth.middleware.js";

interface UserUseCases {
  listUsers: () => Promise<{ id: string; name: string; email: string }[]>;
}

export function createUserRoutes(useCases: UserUseCases) {
  const routes = new Hono<AppEnv>();

  routes.get("/", requireAdmin, async (c) => {
    const users = await useCases.listUsers();
    return c.json(users);
  });

  return routes;
}
```

### 1.5 Composition root

**Fichier** : `backend/src/app.ts` (modifier)

Ajouter les imports :

```typescript
import { createDrizzleUserRepository } from "./infrastructure/repositories/drizzle-user.repository.js";
import { listUsersUseCase } from "./application/use-cases/user/list-users.use-case.js";
import { createUserRoutes } from "./infrastructure/http/routes/user.routes.js";
```

Dans `createApp()`, ajouter :

```typescript
// 1. Repositories (ajouter)
const userRepo = createDrizzleUserRepository(db);

// 2. Use Cases (ajouter)
const userUseCases = {
  listUsers: listUsersUseCase(userRepo),
};

// 3. Routes (ajouter)
app.route("/api/users", createUserRoutes(userUseCases));
```

### 1.6 Tests

**Fichier** : `backend/tests/integration/users.test.ts` (nouveau)

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { createTestApp, type TestApp } from "../helpers/test-app.js";
import { createAdminUser, createMemberUser, authHeaders } from "../helpers/auth-helpers.js";

describe("Users API", () => {
  let testApp: TestApp;
  let adminCookie: string;
  let memberCookie: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    const admin = await createAdminUser(testApp);
    adminCookie = admin.cookie;
    const member = await createMemberUser(testApp);
    memberCookie = member.cookie;
  });

  it("GET /api/users - un admin peut lister les utilisateurs", async () => {
    const res = await testApp.app.request("/api/users", {
      headers: authHeaders(adminCookie),
    });
    expect(res.status).toBe(200);
    const users = await res.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(users[0]).toHaveProperty("id");
    expect(users[0]).toHaveProperty("name");
    expect(users[0]).toHaveProperty("email");
    expect(users[0]).not.toHaveProperty("role");
  });

  it("GET /api/users - un membre recoit 403", async () => {
    const res = await testApp.app.request("/api/users", {
      headers: authHeaders(memberCookie),
    });
    expect(res.status).toBe(403);
  });
});
```

### Verification tache 1

```bash
cd backend && npm run validate:fix && npm test
```

---

## Tache 2 — Backend : admin peut creer un souhait pour un autre membre

Le `userId` est **toujours obligatoire en base** (un wish appartient a un user). Ce qui change : le payload API accepte un `userId` optionnel. Si present et que l'appelant est admin, on l'utilise. Sinon, on utilise l'id de la session. Un non-admin qui envoie un `userId` recoit une 403.

### 2.1 Schema Zod

**Fichier** : `backend/src/application/schemas/wish.schema.ts` (modifier)

```typescript
import { z } from "zod";

export const createWishSchema = z.object({
  orderId: z.string().min(1),
  gameName: z.string().min(1, "Le nom du jeu est requis"),
  philibertReference: z.string().min(1, "La reference Philibert est requise"),
  philibertUrl: z.string().url().optional().or(z.literal("")),
  userId: z.string().min(1).optional(),
});

export type CreateWishInput = z.infer<typeof createWishSchema>;
```

### 2.2 Route

**Fichier** : `backend/src/infrastructure/http/routes/wish.routes.ts` (modifier)

Remplacer le handler `POST /` :

```typescript
routes.post("/", requireAuth, async (c) => {
  const body = await c.req.json();
  const parsed = createWishSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const user = c.get("user");

  // Si userId fourni, verifier que l'appelant est admin
  let targetUserId = user.id;
  if (parsed.data.userId) {
    if (user.role !== "admin") {
      return c.json({ error: "Seul un admin peut creer un souhait pour un autre membre" }, 403);
    }
    targetUserId = parsed.data.userId;
  }

  try {
    const wish = await useCases.createWish(parsed.data, targetUserId);
    return c.json(wish, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return c.json({ error: message }, 400);
  }
});
```

### 2.3 Tests

**Fichier** : `backend/tests/integration/wishes.test.ts` (modifier)

Ajouter a la fin du `describe`, avant la fermeture :

```typescript
it("POST /api/wishes - un admin peut creer un souhait pour un autre membre", async () => {
  // Recuperer l'id du membre
  const usersRes = await testApp.app.request("/api/users", {
    headers: authHeaders(adminCookie),
  });
  const users = await usersRes.json();
  const member = users.find((u: { email: string }) => u.email === "member@test.com");

  const res = await testApp.app.request("/api/wishes", {
    method: "POST",
    headers: authHeaders(adminCookie),
    body: JSON.stringify({
      orderId,
      gameName: "Everdell",
      philibertReference: "PHI-77777",
      userId: member.id,
    }),
  });
  expect(res.status).toBe(201);
  const wish = await res.json();
  expect(wish.gameName).toBe("Everdell");
  expect(wish.userId).toBe(member.id);
});

it("POST /api/wishes - un membre ne peut pas creer un souhait pour un autre", async () => {
  const res = await testApp.app.request("/api/wishes", {
    method: "POST",
    headers: authHeaders(memberCookie),
    body: JSON.stringify({
      orderId,
      gameName: "Root",
      philibertReference: "PHI-88888",
      userId: "some-other-user-id",
    }),
  });
  expect(res.status).toBe(403);
});
```

### Verification tache 2

```bash
cd backend && npm run validate:fix && npm test
```

---

## Tache 3 — Frontend : domain layers (wishes + users + orders extension)

### 3.1 Wish types

**Fichier** : `frontend/src/features/wishes/domain/wish.types.ts` (nouveau)

```typescript
import { z } from 'zod'

export type WishStatus = 'submitted' | 'in_basket' | 'validated' | 'refused' | 'paid' | 'picked_up'

export const wishSchema = z.object({
  id: z.string(),
  gameName: z.string(),
  philibertReference: z.string(),
  philibertUrl: z.string().nullable(),
  status: z.enum(['submitted', 'in_basket', 'validated', 'refused', 'paid', 'picked_up']),
  unitPrice: z.number().nullable(),
  shippingShare: z.number().nullable(),
  customsShare: z.number().nullable(),
  amountDue: z.number().nullable(),
  userId: z.string(),
  orderId: z.string(),
  basketId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Wish = z.infer<typeof wishSchema>

export const WISH_STATUS_LABELS: Record<WishStatus, string> = {
  submitted: 'Soumis',
  in_basket: 'Dans le panier',
  validated: 'Valide',
  refused: 'Refuse',
  paid: 'Paye',
  picked_up: 'Recupere',
}
```

### 3.2 Wish adapter

**Fichier** : `frontend/src/features/wishes/domain/wish.adapter.ts` (nouveau)

```typescript
import { z } from 'zod'
import { apiFetch } from '@/lib/api-client'
import { wishSchema } from './wish.types'
import type { Wish } from './wish.types'

export interface CreateWishPayload {
  orderId: string
  gameName: string
  philibertReference: string
  philibertUrl?: string
  userId?: string
}

export const wishAdapter = {
  fetchMyWishes: async (): Promise<Wish[]> => {
    const data = await apiFetch<unknown>('/api/wishes/mine')
    return z.array(wishSchema).parse(data)
  },

  fetchOrderWishes: async (orderId: string): Promise<Wish[]> => {
    const data = await apiFetch<unknown>(`/api/wishes/order/${orderId}`)
    return z.array(wishSchema).parse(data)
  },

  createWish: async (payload: CreateWishPayload): Promise<Wish> => {
    const data = await apiFetch<unknown>('/api/wishes', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return wishSchema.parse(data)
  },
}
```

### 3.3 Wish repository

**Fichier** : `frontend/src/features/wishes/domain/wish.repository.ts` (nouveau)

```typescript
import { useMutation, useQuery } from '@tanstack/react-query'
import { wishAdapter } from './wish.adapter'
import type { CreateWishPayload } from './wish.adapter'

export function useMyWishes() {
  return useQuery({
    queryKey: ['wishes', 'mine'],
    queryFn: () => wishAdapter.fetchMyWishes(),
  })
}

export function useOrderWishes(orderId: string) {
  return useQuery({
    queryKey: ['wishes', 'order', orderId],
    queryFn: () => wishAdapter.fetchOrderWishes(orderId),
  })
}

export function useCreateWishMutation() {
  return useMutation({
    mutationFn: (payload: CreateWishPayload) => wishAdapter.createWish(payload),
  })
}
```

### 3.4 User types

**Fichier** : `frontend/src/features/users/domain/user.types.ts` (nouveau)

```typescript
import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
})

export type User = z.infer<typeof userSchema>
```

### 3.5 User adapter

**Fichier** : `frontend/src/features/users/domain/user.adapter.ts` (nouveau)

```typescript
import { z } from 'zod'
import { apiFetch } from '@/lib/api-client'
import { userSchema } from './user.types'
import type { User } from './user.types'

export const userAdapter = {
  fetchUsers: async (): Promise<User[]> => {
    const data = await apiFetch<unknown>('/api/users')
    return z.array(userSchema).parse(data)
  },
}
```

### 3.6 User repository

**Fichier** : `frontend/src/features/users/domain/user.repository.ts` (nouveau)

```typescript
import { useQuery } from '@tanstack/react-query'
import { userAdapter } from './user.adapter'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userAdapter.fetchUsers(),
  })
}
```

### 3.7 Etendre le domain orders

**Fichier** : `frontend/src/features/orders/domain/order.adapter.ts` (modifier)

Ajouter dans `orderAdapter` :

```typescript
fetchOrder: async (id: string): Promise<Order> => {
  const data = await apiFetch<unknown>(`/api/orders/${id}`)
  return orderSchema.parse(data)
},
```

**Fichier** : `frontend/src/features/orders/domain/order.repository.ts` (modifier)

Ajouter :

```typescript
export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderAdapter.fetchOrder(id),
  })
}
```

Et ajouter l'import de `orderAdapter` si pas deja present.

### Verification tache 3

```bash
cd frontend && npm run build
```

Pas de tests specifiques a ce stade — le build TypeScript valide les types.

---

## Tache 4 — Frontend : create-wish use-case + form

### 4.1 Service de validation

**Fichier** : `frontend/src/features/wishes/use-cases/create-wish/create-wish.service.ts` (nouveau)

```typescript
import { z } from 'zod'

export const createWishSchema = z.object({
  gameName: z.string().min(1, 'Le nom du jeu est requis'),
  philibertReference: z.string().min(1, 'La reference Philibert est requise'),
  philibertUrl: z.string().url('URL invalide').optional().or(z.literal('')),
})

export type CreateWishInput = z.infer<typeof createWishSchema>

export function validateCreateWishInput(input: unknown) {
  return createWishSchema.safeParse(input)
}
```

### 4.2 Tests du service

**Fichier** : `frontend/src/features/wishes/use-cases/create-wish/create-wish.service.test.ts` (nouveau)

```typescript
import { describe, it, expect } from 'vitest'
import { validateCreateWishInput } from './create-wish.service'

describe('validateCreateWishInput', () => {
  it('accepte un input valide', () => {
    const result = validateCreateWishInput({
      gameName: 'Terraforming Mars',
      philibertReference: 'PHI-12345',
    })
    expect(result.success).toBe(true)
  })

  it('accepte un input avec URL', () => {
    const result = validateCreateWishInput({
      gameName: 'Terraforming Mars',
      philibertReference: 'PHI-12345',
      philibertUrl: 'https://www.philibert.com/terraforming-mars',
    })
    expect(result.success).toBe(true)
  })

  it('accepte une URL vide', () => {
    const result = validateCreateWishInput({
      gameName: 'Terraforming Mars',
      philibertReference: 'PHI-12345',
      philibertUrl: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejette un nom de jeu vide', () => {
    const result = validateCreateWishInput({
      gameName: '',
      philibertReference: 'PHI-12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un nom de jeu manquant', () => {
    const result = validateCreateWishInput({
      philibertReference: 'PHI-12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejette une reference vide', () => {
    const result = validateCreateWishInput({
      gameName: 'Terraforming Mars',
      philibertReference: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejette une URL invalide', () => {
    const result = validateCreateWishInput({
      gameName: 'Terraforming Mars',
      philibertReference: 'PHI-12345',
      philibertUrl: 'pas-une-url',
    })
    expect(result.success).toBe(false)
  })
})
```

### 4.3 Use-case hook

**Fichier** : `frontend/src/features/wishes/use-cases/create-wish/use-create-wish.use-case.ts` (nouveau)

```typescript
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useCreateWishMutation } from '@/features/wishes/domain/wish.repository'
import { validateCreateWishInput } from './create-wish.service'

export function useCreateWish(orderId: string) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [validationError, setValidationError] = useState<string | null>(null)

  const mutation = useCreateWishMutation()

  const handleCreateWish = (
    gameName: string,
    philibertReference: string,
    philibertUrl?: string,
    userId?: string,
  ) => {
    setValidationError(null)

    const validation = validateCreateWishInput({ gameName, philibertReference, philibertUrl })
    if (!validation.success) {
      setValidationError(validation.error.issues[0].message)
      return
    }

    mutation.mutate(
      { orderId, ...validation.data, userId },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ['wishes'] })
          await router.navigate({ to: '/orders/$orderId', params: { orderId } })
        },
      },
    )
  }

  return {
    handleCreateWish,
    error: validationError ?? mutation.error?.message ?? null,
    isPending: mutation.isPending,
  }
}
```

### 4.4 Composant formulaire

**Fichier** : `frontend/src/features/wishes/use-cases/create-wish/create-wish-form.tsx` (nouveau)

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAuthSession } from '@/features/auth/domain/auth.repository'
import { useUsers } from '@/features/users/domain/user.repository'
import { useCreateWish } from './use-create-wish.use-case'

export function CreateWishForm({ orderId }: { orderId: string }) {
  const { isAdmin } = useAuthSession()
  const { handleCreateWish, error, isPending } = useCreateWish(orderId)
  const { data: users } = useUsers()
  const [selectedUserId, setSelectedUserId] = useState('')

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    handleCreateWish(
      formData.get('gameName') as string,
      formData.get('philibertReference') as string,
      (formData.get('philibertUrl') as string) || undefined,
      isAdmin && selectedUserId ? selectedUserId : undefined,
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un souhait</CardTitle>
        <CardDescription>Ajoutez un jeu a cette commande</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {isAdmin && users && (
            <div className="space-y-2">
              <Label htmlFor="userId">Membre (admin : creer pour un autre membre)</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Moi-meme (par defaut)" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="gameName">Nom du jeu</Label>
            <Input id="gameName" name="gameName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="philibertReference">Reference Philibert</Label>
            <Input id="philibertReference" name="philibertReference" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="philibertUrl">URL Philibert (optionnel)</Label>
            <Input
              id="philibertUrl"
              name="philibertUrl"
              type="url"
              placeholder="https://www.philibert.com/..."
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Ajout en cours...' : 'Ajouter le souhait'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### Verification tache 4

```bash
cd frontend && npm test && npm run build
```

---

## Tache 5 — Frontend : pages

### 5.1 Order detail use-case

**Fichier** : `frontend/src/features/orders/use-cases/order-detail/use-order-detail.use-case.ts` (nouveau)

```typescript
import { useOrder } from '@/features/orders/domain/order.repository'
import { useOrderWishes } from '@/features/wishes/domain/wish.repository'

export function useOrderDetail(orderId: string) {
  const { data: order, isPending: orderPending, error: orderError } = useOrder(orderId)
  const { data: wishes, isPending: wishesPending } = useOrderWishes(orderId)

  return {
    order: order ?? null,
    wishes: wishes ?? [],
    isPending: orderPending || wishesPending,
    error: orderError?.message ?? null,
  }
}
```

### 5.2 Order detail page

**Fichier** : `frontend/src/features/orders/use-cases/order-detail/order-detail-page.tsx` (nouveau)

```tsx
import { Link } from '@tanstack/react-router'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ORDER_TYPE_LABELS, ORDER_STATUS_LABELS,
} from '@/features/orders/domain/order.types'
import { WISH_STATUS_LABELS } from '@/features/wishes/domain/wish.types'
import { formatDate } from '@/lib/date.utils'
import { CreateWishForm } from '@/features/wishes/use-cases/create-wish/create-wish-form'
import { useOrderDetail } from './use-order-detail.use-case'

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const { order, wishes, isPending, error } = useOrderDetail(orderId)

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
    )
  }

  if (isPending || !order) {
    return (
      <div className="flex justify-center py-12">
        <LoaderCircle className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux commandes
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{ORDER_TYPE_LABELS[order.type]}</span>
            <Badge>{ORDER_STATUS_LABELS[order.status]}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Date cible : {formatDate(order.targetDate)}</p>
          {order.description && <p className="text-muted-foreground">{order.description}</p>}
        </CardContent>
      </Card>

      {wishes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Souhaits ({wishes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {wishes.map((w) => (
                <li key={w.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{w.gameName}</p>
                    <p className="text-sm text-muted-foreground">{w.philibertReference}</p>
                  </div>
                  <Badge variant="secondary">{WISH_STATUS_LABELS[w.status]}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {order.status === 'open' && <CreateWishForm orderId={orderId} />}
    </div>
  )
}
```

### 5.3 List open orders use-case

**Fichier** : `frontend/src/features/orders/use-cases/list-open-orders/use-list-open-orders.use-case.ts` (nouveau)

```typescript
import { useOrders } from '@/features/orders/domain/order.repository'

export function useListOpenOrders() {
  const { data: orders, isPending, error } = useOrders('open')

  return {
    orders: orders ?? [],
    isPending,
    error: error?.message ?? null,
  }
}
```

### 5.4 List open orders page

**Fichier** : `frontend/src/features/orders/use-cases/list-open-orders/list-open-orders-page.tsx` (nouveau)

```tsx
import { Link } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ORDER_TYPE_LABELS } from '@/features/orders/domain/order.types'
import { formatDate } from '@/lib/date.utils'
import { useListOpenOrders } from './use-list-open-orders.use-case'

export function ListOpenOrdersPage() {
  const { orders, isPending, error } = useListOpenOrders()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Commandes ouvertes</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      {isPending && (
        <div className="flex justify-center py-12">
          <LoaderCircle className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      )}

      {!isPending && orders.length === 0 && (
        <p className="text-muted-foreground">Aucune commande ouverte pour le moment.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {orders.map((order) => (
          <Link key={order.id} to="/orders/$orderId" params={{ orderId: order.id }}>
            <Card className="hover:border-primary transition-colors cursor-pointer py-4 gap-3">
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">{ORDER_TYPE_LABELS[order.type]}</CardTitle>
                <Badge>Ouverte</Badge>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>Date cible : {formatDate(order.targetDate)}</p>
                {order.description && (
                  <p className="text-muted-foreground">{order.description}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

### 5.5 List my wishes helpers

**Fichier** : `frontend/src/features/wishes/use-cases/list-my-wishes/list-my-wishes.helpers.ts` (nouveau)

```typescript
import type { WishStatus } from '@/features/wishes/domain/wish.types'

export const WISH_STATUS_VARIANT: Record<
  WishStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  submitted: 'default',
  in_basket: 'secondary',
  validated: 'default',
  refused: 'destructive',
  paid: 'outline',
  picked_up: 'outline',
}
```

### 5.6 List my wishes use-case

**Fichier** : `frontend/src/features/wishes/use-cases/list-my-wishes/use-list-my-wishes.use-case.ts` (nouveau)

```typescript
import { useMyWishes } from '@/features/wishes/domain/wish.repository'

export function useListMyWishes() {
  const { data: wishes, isPending, error } = useMyWishes()

  return {
    wishes: wishes ?? [],
    isPending,
    error: error?.message ?? null,
  }
}
```

### 5.7 Wish table (desktop)

**Fichier** : `frontend/src/features/wishes/use-cases/list-my-wishes/wish-table.tsx` (nouveau)

```tsx
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { WISH_STATUS_LABELS } from '@/features/wishes/domain/wish.types'
import type { Wish } from '@/features/wishes/domain/wish.types'
import { formatDate } from '@/lib/date.utils'
import { WISH_STATUS_VARIANT } from './list-my-wishes.helpers'

export function WishTable({ wishes }: { wishes: Wish[] }) {
  return (
    <Table className="hidden md:table">
      <TableHeader>
        <TableRow>
          <TableHead>Jeu</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Ajoute le</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {wishes.map((wish) => (
          <TableRow key={wish.id}>
            <TableCell className="font-medium">{wish.gameName}</TableCell>
            <TableCell>{wish.philibertReference}</TableCell>
            <TableCell>
              <Badge variant={WISH_STATUS_VARIANT[wish.status]}>
                {WISH_STATUS_LABELS[wish.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(wish.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### 5.8 Wish card list (mobile)

**Fichier** : `frontend/src/features/wishes/use-cases/list-my-wishes/wish-card-list.tsx` (nouveau)

```tsx
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WISH_STATUS_LABELS } from '@/features/wishes/domain/wish.types'
import type { Wish } from '@/features/wishes/domain/wish.types'
import { formatDate } from '@/lib/date.utils'
import { WISH_STATUS_VARIANT } from './list-my-wishes.helpers'

export function WishCardList({ wishes }: { wishes: Wish[] }) {
  return (
    <div className="space-y-3 md:hidden">
      {wishes.map((wish) => (
        <Card key={wish.id} className="py-4 gap-3">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">{wish.gameName}</CardTitle>
            <Badge variant={WISH_STATUS_VARIANT[wish.status]}>
              {WISH_STATUS_LABELS[wish.status]}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{wish.philibertReference}</p>
            <p className="text-muted-foreground text-xs">
              Ajoute le {formatDate(wish.createdAt)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### 5.9 Wish list content

**Fichier** : `frontend/src/features/wishes/use-cases/list-my-wishes/wish-list-content.tsx` (nouveau)

```tsx
import { LoaderCircle } from 'lucide-react'
import type { Wish } from '@/features/wishes/domain/wish.types'
import { WishCardList } from './wish-card-list'
import { WishTable } from './wish-table'

export function WishListContent({
  wishes, isPending, error,
}: {
  wishes: Wish[]
  isPending: boolean
  error: string | null
}) {
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
    )
  }
  if (isPending) {
    return (
      <div className="flex justify-center py-12">
        <LoaderCircle className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    )
  }
  if (wishes.length === 0) {
    return <p className="text-muted-foreground">Aucun souhait pour le moment.</p>
  }
  return (
    <>
      <WishCardList wishes={wishes} />
      <WishTable wishes={wishes} />
    </>
  )
}
```

### 5.10 List my wishes page

**Fichier** : `frontend/src/features/wishes/use-cases/list-my-wishes/list-my-wishes-page.tsx` (nouveau)

```tsx
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useListMyWishes } from './use-list-my-wishes.use-case'
import { WishListContent } from './wish-list-content'

export function ListMyWishesPage() {
  const { wishes, isPending, error } = useListMyWishes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes souhaits</h1>
        <Button asChild>
          <Link to="/orders">Voir les commandes ouvertes</Link>
        </Button>
      </div>
      <WishListContent wishes={wishes} isPending={isPending} error={error} />
    </div>
  )
}
```

### Verification tache 5

```bash
cd frontend && npm run build
```

---

## Tache 6 — Frontend : routes et navigation

### 6.1 Route wishes (modifier le stub)

**Fichier** : `frontend/src/routes/_auth/wishes.tsx` (modifier)

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { ListMyWishesPage } from '@/features/wishes/use-cases/list-my-wishes/list-my-wishes-page'

export const Route = createFileRoute('/_auth/wishes')({
  component: ListMyWishesPage,
})
```

### 6.2 Route orders (membre)

**Fichier** : `frontend/src/routes/_auth/orders.tsx` (nouveau)

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { ListOpenOrdersPage } from '@/features/orders/use-cases/list-open-orders/list-open-orders-page'

export const Route = createFileRoute('/_auth/orders')({
  component: ListOpenOrdersPage,
})
```

### 6.3 Route order detail

**Fichier** : `frontend/src/routes/_auth/orders_.$orderId.tsx` (nouveau)

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { OrderDetailPage } from '@/features/orders/use-cases/order-detail/order-detail-page'

export const Route = createFileRoute('/_auth/orders_/$orderId')({
  component: OrderDetailRouteComponent,
})

function OrderDetailRouteComponent() {
  const { orderId } = Route.useParams()
  return <OrderDetailPage orderId={orderId} />
}
```

### 6.4 Navigation

**Fichier** : `frontend/src/components/layout/nav.tsx` (modifier)

Ajouter entre le lien "Mes souhaits" et le lien admin "Commandes" :

```tsx
{isAuthenticated && (
  <Link
    to="/orders"
    onClick={onLinkClick}
    className={linkClass}
    activeProps={{ className: activeLinkClass }}
  >
    Commandes ouvertes
  </Link>
)}
```

### 6.5 Regenerer le route tree

```bash
cd frontend && npx tsr generate
```

### Verification tache 6

```bash
cd frontend && npm run build
cd frontend && npm test
```

---

## Resume des fichiers

| # | Action | Fichier |
|---|--------|---------|
| 1 | Nouveau | `backend/src/domain/ports/user.repository.port.ts` |
| 2 | Nouveau | `backend/src/infrastructure/repositories/drizzle-user.repository.ts` |
| 3 | Nouveau | `backend/src/application/use-cases/user/list-users.use-case.ts` |
| 4 | Nouveau | `backend/src/infrastructure/http/routes/user.routes.ts` |
| 5 | Modifier | `backend/src/app.ts` |
| 6 | Modifier | `backend/src/application/schemas/wish.schema.ts` |
| 7 | Modifier | `backend/src/infrastructure/http/routes/wish.routes.ts` |
| 8 | Nouveau | `backend/tests/integration/users.test.ts` |
| 9 | Modifier | `backend/tests/integration/wishes.test.ts` |
| 10 | Nouveau | `frontend/src/features/wishes/domain/wish.types.ts` |
| 11 | Nouveau | `frontend/src/features/wishes/domain/wish.adapter.ts` |
| 12 | Nouveau | `frontend/src/features/wishes/domain/wish.repository.ts` |
| 13 | Nouveau | `frontend/src/features/users/domain/user.types.ts` |
| 14 | Nouveau | `frontend/src/features/users/domain/user.adapter.ts` |
| 15 | Nouveau | `frontend/src/features/users/domain/user.repository.ts` |
| 16 | Modifier | `frontend/src/features/orders/domain/order.adapter.ts` |
| 17 | Modifier | `frontend/src/features/orders/domain/order.repository.ts` |
| 18 | Nouveau | `frontend/src/features/wishes/use-cases/create-wish/create-wish.service.ts` |
| 19 | Nouveau | `frontend/src/features/wishes/use-cases/create-wish/create-wish.service.test.ts` |
| 20 | Nouveau | `frontend/src/features/wishes/use-cases/create-wish/use-create-wish.use-case.ts` |
| 21 | Nouveau | `frontend/src/features/wishes/use-cases/create-wish/create-wish-form.tsx` |
| 22 | Nouveau | `frontend/src/features/orders/use-cases/order-detail/use-order-detail.use-case.ts` |
| 23 | Nouveau | `frontend/src/features/orders/use-cases/order-detail/order-detail-page.tsx` |
| 24 | Nouveau | `frontend/src/features/orders/use-cases/list-open-orders/use-list-open-orders.use-case.ts` |
| 25 | Nouveau | `frontend/src/features/orders/use-cases/list-open-orders/list-open-orders-page.tsx` |
| 26 | Nouveau | `frontend/src/features/wishes/use-cases/list-my-wishes/list-my-wishes.helpers.ts` |
| 27 | Nouveau | `frontend/src/features/wishes/use-cases/list-my-wishes/use-list-my-wishes.use-case.ts` |
| 28 | Nouveau | `frontend/src/features/wishes/use-cases/list-my-wishes/wish-table.tsx` |
| 29 | Nouveau | `frontend/src/features/wishes/use-cases/list-my-wishes/wish-card-list.tsx` |
| 30 | Nouveau | `frontend/src/features/wishes/use-cases/list-my-wishes/wish-list-content.tsx` |
| 31 | Nouveau | `frontend/src/features/wishes/use-cases/list-my-wishes/list-my-wishes-page.tsx` |
| 32 | Modifier | `frontend/src/routes/_auth/wishes.tsx` |
| 33 | Nouveau | `frontend/src/routes/_auth/orders.tsx` |
| 34 | Nouveau | `frontend/src/routes/_auth/orders_.$orderId.tsx` |
| 35 | Modifier | `frontend/src/components/layout/nav.tsx` |
| 36 | Auto-gen | `frontend/src/routeTree.gen.ts` |

## Verification finale

```bash
cd backend && npm run validate:fix && npm test
cd frontend && npm test && npm run build
```
