# Domaine Métier - Grouped Order

## Contexte

Grouped Orders est une plateforme permettant à un groupe Facebook de joueurs de jeux de société, au québec, de se coordonner dans l'achat de jeux de société à une boutique en France, nommée Philibert, qui à l'avantage de disposer des jeux en version française très en avance par rapport au Québec et à un prix attractif.

## Glossaire

### Acteurs

| Terme | Définition |
|-------|------------|
| **Administrateur** | Utilisateur avec le rôle `admin`. Responsable de la création des commandes, de la gestion des paniers, de la validation des paiements et de la logistique. |
| **Membre** | Utilisateur standard. Peut créer des souhaits, valider ses achats et indiquer ses paiements. |

### Objets métier

| Terme | Définition |
|-------|------------|
| **Commande** | Une période d'achat groupé ouverte par un administrateur. Contient des souhaits et des paniers. |
| **Type de commande** | Catégorie de commande : Mensuelle, Vente privée, ou Spéciale. |
| **Date cible** | Date prévue pour passer la commande sur le site de Philibert. |
| **Souhait** | Demande d'achat d'un jeu de société émise par un membre sur une commande. |
| **Référence Philibert** | Code unique identifiant un jeu sur le site de Philibert (ex: `PHI123456`). |
| **Panier** | Groupement de souhaits à commander ensemble sur Philibert. Limite recommandée : 300$ CAD. |
| **Frais de port** | Coûts d'expédition depuis la France vers le Canada, appliqués au niveau du panier. |
| **Frais de douane** | Taxes douanières canadiennes, appliquées après réception de la facture. |
| **Répartition au prorata** | Méthode de calcul pour distribuer les frais (port/douane) proportionnellement au prix de chaque jeu. |
| **Point de dépôt** | Lieu physique où les membres récupèrent leurs jeux. |
| **Montant dû** | Total à payer par un membre pour un souhait : prix du jeu + part des frais de port + part des frais de douane. |

---

## Règles de gestion

### RG-001 : Création de commande

**Qui** : Administrateur uniquement

**Règles** :
- Une commande doit avoir un type (monthly, private_sale, special)
- La date cible doit être dans le futur
- Le créateur est automatiquement l'utilisateur connecté
- Le statut initial est toujours "open"
- Une description est optionnelle

**Contraintes techniques** :
- Validation Zod côté serveur
- `created_by` = `session.user.id`

---

### RG-002 : Émission d'un souhait

**Qui** : Membre connecté

**Règles** :
- Le membre peut créer plusieurs souhaits pour le même jeu (pas de contrainte d'unicité)
- Un souhait doit avoir : nom du jeu + référence Philibert
- L'URL Philibert est optionnelle
- Le statut initial est "submitted"
- Le souhait est automatiquement lié à l'utilisateur connecté
- Impossible de créer un souhait sur une commande avec statut "completed"

**Contraintes techniques** :
- `user_id` = `session.user.id`
- `order_id` doit référencer une commande existante avec status != "completed"

---

### RG-003 : Suppression d'un souhait

**Qui** : Membre propriétaire du souhait

**Règles** :
- Impossible de supprimer un souhait si `status != "submitted"`
- Seul le propriétaire peut supprimer son souhait
- Confirmation requise avant suppression

**Contraintes techniques** :
- Vérifier `wish.user_id === session.user.id`
- Vérifier `wish.status === "submitted"`

---

### RG-004 : Création d'un panier

**Qui** : Administrateur uniquement

**Règles** :
- Un panier doit contenir au moins un souhait
- Les souhaits sélectionnés doivent avoir le statut "submitted"
- Un souhait ne peut être que dans un seul panier à la fois
- Le statut initial du panier est "draft"
- Le nom du panier est auto-généré mais modifiable (ex: "Panier 1 - Commande Janvier 2025")
- La limite recommandée est de 300$ CAD (warning, pas de contrainte bloquante)

**Effet** :
- Les souhaits sélectionnés passent en statut "in_basket"
- Leur `basket_id` est défini

**Contraintes techniques** :
- `created_by` = `session.user.id`
- Vérifier que chaque souhait a `status === "submitted"` et `basket_id === null`

---

### RG-005 : Édition d'un panier

**Qui** : Administrateur uniquement

**Règles** :
- Impossible d'éditer un panier si `status != "draft"`
- L'administrateur doit saisir :
  - Le prix unitaire de chaque jeu
  - Les frais de port totaux du panier
- Les frais de port sont automatiquement répartis au prorata du prix des jeux
- L'administrateur peut enregistrer en brouillon ou passer en "awaiting_validation"

**Calculs automatiques** :
- Total des prix des jeux : `sum(unit_price)`
- Part des frais de port par jeu : `(unit_price / total_prices) * shipping_cost`
- Arrondissement à 2 décimales
- Correction des arrondis sur le dernier item

**Contraintes techniques** :
- Tous les prix doivent être > 0 avant passage en validation
- Utiliser `calculateProrataShares()` du service

---

### RG-006 : Retirer un souhait d'un panier

**Qui** : Administrateur uniquement

**Règles** :
- Impossible si `basket.status != "draft"`
- Le souhait repasse en statut "submitted"
- Son `basket_id` est remis à `null`
- Les frais de port sont automatiquement recalculés pour les souhaits restants

**Effet** :
- Recalcul du total du panier
- Recalcul des parts de frais de port pour les souhaits restants

---

### RG-007 : Suppression d'un panier

**Qui** : Administrateur uniquement

**Règles** :
- Impossible si `basket.status != "draft"`
- Confirmation requise (dialog avec avertissement)
- Tous les souhaits du panier repassent en statut "submitted"
- Leurs `basket_id` sont remis à `null`

**Effet** :
- Suppression du panier de la base
- Libération de tous les souhaits

---

### RG-008 : Passage en attente de validation

**Qui** : Administrateur uniquement

**Règles** :
- Tous les prix unitaires doivent être renseignés
- Les frais de port doivent être renseignés
- Le panier passe en statut "awaiting_validation"
- Le panier devient non-éditable
- Les membres propriétaires des souhaits doivent être notifiés

**Effet** :
- `basket.status = "awaiting_validation"`
- Création de notifications pour chaque membre concerné

**Contraintes techniques** :
- Vérifier que tous les `unit_price` et `shipping_share` sont != null

---

### RG-009 : Validation ou refus d'un souhait

**Qui** : Membre propriétaire du souhait

**Règles** :
- Visible uniquement si le panier a le statut "awaiting_validation"
- Le membre peut valider ou refuser chaque souhait individuellement
- **Valider** : le souhait passe en statut "validated"
- **Refuser** : le souhait passe en statut "refused"
- Si un souhait est refusé, notifier l'administrateur

**Effet** :
- Mise à jour du `wish.status`
- Création d'une notification pour l'admin si refus

**Contraintes techniques** :
- Vérifier `wish.user_id === session.user.id`
- Vérifier `basket.status === "awaiting_validation"`

---

### RG-010 : Calcul du montant dû

**Règle** :
- Le montant dû pour un souhait est calculé automatiquement :
  ```
  amount_due = unit_price + shipping_share + customs_share
  ```
- Arrondi à 2 décimales
- Recalculé automatiquement à chaque mise à jour des frais

**Moments de calcul** :
- Après ajout des frais de port
- Après ajout des frais de douane
- Après retrait d'un souhait du panier

---

### RG-011 : Ajout des frais de douane

**Qui** : Administrateur uniquement

**Règles** :
- Possible uniquement si `basket.status === "validated"`
- L'administrateur saisit le montant total des frais de douane
- Les frais sont répartis **uniquement sur les souhaits validés** (status = "validated")
- Répartition au prorata du prix de chaque jeu
- Le statut du panier passe en "awaiting_reception"
- Les membres concernés doivent être notifiés

**Effet** :
- `basket.customs_cost` est défini
- Calcul de `wish.customs_share` pour chaque souhait validé
- Mise à jour de `wish.amount_due`
- `basket.status = "awaiting_reception"`
- Création de notifications pour les membres

**Contraintes techniques** :
- Utiliser `calculateProrataShares()` du service
- Ne pas inclure les souhaits refusés dans le calcul

---

### RG-012 : Indication d'envoi de paiement

**Qui** : Membre propriétaire du souhait

**Règles** :
- Visible uniquement si le souhait a le statut "validated"
- Le membre indique avoir envoyé le paiement
- `payment_status` passe de "pending" à "sent"
- Un timestamp `payment_sent_at` est enregistré
- L'administrateur est notifié

**Effet** :
- `wish.payment_status = "sent"`
- `wish.payment_sent_at = now()`
- Création d'une notification pour l'admin

---

### RG-013 : Confirmation de réception de paiement

**Qui** : Administrateur uniquement

**Règles** :
- L'administrateur peut marquer un paiement comme :
  - **Reçu** : `payment_status = "received"`, `amount_paid = amount_due`
  - **Partiel** : `payment_status = "partial"`, `amount_paid` = montant saisi
- Un timestamp `payment_received_at` est enregistré
- Le membre est notifié

**Effet** :
- Mise à jour de `wish.payment_status` et `wish.amount_paid`
- `wish.payment_received_at = now()`
- Création d'une notification pour le membre

---

### RG-014 : Réception du panier

**Qui** : Administrateur uniquement

**Règles** :
- Possible uniquement si `basket.status === "awaiting_reception"`
- L'administrateur indique que le panier a été réceptionné
- Le statut passe en "awaiting_delivery"
- Un timestamp `received_at` est enregistré
- Les membres concernés sont notifiés

**Effet** :
- `basket.status = "awaiting_delivery"`
- `basket.received_at = now()`
- Création de notifications pour les membres

---

### RG-015 : Assignation des points de dépôt

**Qui** : Administrateur uniquement

**Règles** :
- Par défaut, tous les souhaits sont assignés au point de dépôt par défaut (`is_default = true`)
- L'administrateur peut changer le point de dépôt pour chaque souhait individuellement
- L'assignation peut être faite à tout moment après la création du panier

**Effet** :
- Mise à jour de `wish.deposit_point_id`

**Contraintes techniques** :
- Il doit toujours y avoir un point de dépôt par défaut en base

---

### RG-016 : Mise à disposition au point de dépôt

**Qui** : Administrateur uniquement

**Règles** :
- Possible uniquement si `basket.status === "awaiting_delivery"`
- Tous les points de dépôt doivent être assignés avant de marquer disponible
- Le statut passe en "available_pickup"
- Un timestamp `available_at` est enregistré
- Les membres concernés sont notifiés avec le point de dépôt

**Effet** :
- `basket.status = "available_pickup"`
- `basket.available_at = now()`
- Création de notifications pour les membres avec l'adresse du point de dépôt

**Contraintes techniques** :
- Vérifier que tous les souhaits validés ont un `deposit_point_id != null`

---

### RG-017 : Retrait d'un jeu

**Qui** : Membre propriétaire du souhait

**Règles** :
- Visible uniquement si `basket.status === "available_pickup"`
- Le membre indique avoir récupéré son jeu
- Le souhait passe en statut "picked_up"
- Un timestamp `picked_up_at` est enregistré

**Effet** :
- `wish.status = "picked_up"`
- `wish.picked_up_at = now()`

---

### RG-018 : Fermeture d'une commande

**Qui** : Administrateur uniquement

**Règles** :
- Une commande peut être fermée manuellement
- Le statut passe de "open" à "in_progress" puis "completed"
- Une commande "completed" n'accepte plus de nouveaux souhaits

**Effet** :
- `order.status = "completed"`
- Les souhaits "submitted" sont archivés (visibles mais non modifiables)

---

## Statuts et transitions

### Statuts d'une commande

```
┌──────────┐
│   OPEN   │ ───┐
└──────────┘    │
                │ Administrateur démarre le traitement
                ▼
          ┌─────────────┐
          │ IN_PROGRESS │
          └─────────────┘
                │
                │ Tous les paniers sont disponibles
                ▼
          ┌───────────┐
          │ COMPLETED │
          └───────────┘
```

**Transitions** :
- `open → in_progress` : Dès qu'un panier passe en validation
- `in_progress → completed` : Tous les paniers sont en statut "available_pickup" ou supérieur

---

### Statuts d'un panier

```
┌────────┐
│ DRAFT  │ ───────────────────────────────────────┐
└────────┘                                        │
    │                                             │
    │ Admin finalise les prix                    │ Admin supprime
    ▼                                             ▼
┌───────────────────┐                        ┌─────────┐
│ AWAITING_         │                        │ DELETED │
│ VALIDATION        │                        └─────────┘
└───────────────────┘
    │
    │ Membres valident leurs souhaits
    ▼
┌───────────┐
│ VALIDATED │
└───────────┘
    │
    │ Admin ajoute frais de douane
    ▼
┌──────────────────┐
│ AWAITING_CUSTOMS │ (optionnel si pas de douane)
└──────────────────┘
    │
    │ Admin reçoit la facture de douane
    ▼
┌────────────────────┐
│ AWAITING_RECEPTION │
└────────────────────┘
    │
    │ Admin réceptionne le colis
    ▼
┌───────────────────┐
│ AWAITING_DELIVERY │
└───────────────────┘
    │
    │ Admin dépose au point de retrait
    ▼
┌──────────────────┐
│ AVAILABLE_PICKUP │
└──────────────────┘
```

**Transitions** :
- `draft → awaiting_validation` : Admin soumet le panier aux membres
- `awaiting_validation → validated` : Tous les membres ont validé/refusé
- `validated → awaiting_customs` : Admin ajoute les frais de douane
- `awaiting_customs → awaiting_reception` : Admin attend la livraison
- `awaiting_reception → awaiting_delivery` : Admin réceptionne le colis
- `awaiting_delivery → available_pickup` : Admin dépose au point de retrait

**Retour arrière** :
- Aucun retour arrière automatique
- L'admin peut supprimer un panier en statut "draft" uniquement

---

### Statuts d'un souhait

```
┌───────────┐
│ SUBMITTED │ ───────────────────────────────────┐
└───────────┘                                    │
    │                                            │
    │ Admin ajoute au panier                    │ Membre supprime
    ▼                                            ▼
┌───────────┐                               ┌─────────┐
│ IN_BASKET │                               │ DELETED │
└───────────┘                               └─────────┘
    │
    │ Membre valide
    ▼
┌───────────┐         ┌─────────┐
│ VALIDATED │ ───────▶│ REFUSED │ (Membre refuse)
└───────────┘         └─────────┘
    │
    │ Membre paie
    ▼
┌──────┐
│ PAID │
└──────┘
    │
    │ Membre récupère
    ▼
┌────────────┐
│ PICKED_UP  │
└────────────┘
```

**Transitions** :
- `submitted → in_basket` : Admin ajoute le souhait à un panier
- `in_basket → submitted` : Admin retire le souhait du panier
- `in_basket → validated` : Membre valide le souhait avec les prix
- `in_basket → refused` : Membre refuse le souhait
- `validated → paid` : Admin confirme le paiement reçu
- `paid → picked_up` : Membre indique avoir récupéré le jeu

**États finaux** :
- `picked_up` : Processus terminé avec succès
- `refused` : Processus terminé (souhait non acheté)
- `deleted` : Souhait supprimé avant traitement

---

## Calculs métier

### Calcul des frais de port au prorata

**Formule** :
```
shipping_share[i] = (unit_price[i] / sum(unit_prices)) * total_shipping_cost
```

**Exemple** :

| Jeu | Prix | Part des frais de port (20$) |
|-----|------|------------------------------|
| Jeu A | 40$ | (40 / 100) * 20 = 8.00$ |
| Jeu B | 30$ | (30 / 100) * 20 = 6.00$ |
| Jeu C | 30$ | (30 / 100) * 20 = 6.00$ |
| **Total** | **100$** | **20.00$** |

**Gestion des arrondis** :
- Chaque part est arrondie à 2 décimales
- Si `sum(shipping_shares) != total_shipping_cost`, ajuster le dernier item

**Code** :
```typescript
export function calculateProrataShares(
  items: Array<{ id: string; unitPrice: number }>,
  totalCost: number
): ProrataCalculation[] {
  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice, 0);

  const shares = items.map((item) => ({
    id: item.id,
    share: Number(((item.unitPrice / totalPrice) * totalCost).toFixed(2)),
  }));

  // Correction des arrondis
  const totalShares = shares.reduce((sum, s) => sum + s.share, 0);
  const diff = Number((totalCost - totalShares).toFixed(2));
  if (diff !== 0 && shares.length > 0) {
    shares[shares.length - 1].share += diff;
  }

  return shares;
}
```

---

### Calcul des frais de douane au prorata

**Formule** : Identique aux frais de port
```
customs_share[i] = (unit_price[i] / sum(unit_prices_validated)) * total_customs_cost
```

**Important** : Les frais de douane sont répartis **uniquement sur les souhaits validés**.

**Exemple** :

| Jeu | Prix | Statut | Part des frais de douane (15$) |
|-----|------|--------|--------------------------------|
| Jeu A | 40$ | validated | (40 / 70) * 15 = 8.57$ |
| Jeu B | 30$ | validated | (30 / 70) * 15 = 6.43$ |
| Jeu C | 30$ | **refused** | 0.00$ (non inclus) |
| **Total** | **100$** | | **15.00$** |

---

### Calcul du montant dû total

**Formule** :
```
amount_due = unit_price + shipping_share + customs_share
```

**Exemple** :
- Prix du jeu : 40.00$
- Frais de port : 8.00$
- Frais de douane : 8.57$
- **Total dû** : 56.57$

**Moments de mise à jour** :
- Après ajout des frais de port
- Après ajout des frais de douane
- Après retrait d'un souhait du panier (recalcul pour les autres)

---

## Événements métier et notifications

### Types de notifications

| Type | Déclencheur | Destinataires | Message |
|------|-------------|---------------|---------|
| `wish_submitted` | Membre crée un souhait | Administrateurs | "Nouveau souhait : {game_name} sur {order.name}" |
| `basket_validation` | Admin passe un panier en validation | Membres du panier | "Votre panier est prêt pour validation : {basket.name}" |
| `basket_customs` | Admin ajoute frais de douane | Membres du panier | "Frais de douane ajoutés : {customs_cost}$" |
| `payment_sent` | Membre indique avoir payé | Administrateurs | "{user.name} a envoyé un paiement de {amount_due}$" |
| `payment_received` | Admin confirme paiement | Membre concerné | "Votre paiement de {amount_paid}$ a été confirmé" |
| `basket_received` | Admin réceptionne panier | Membres du panier | "Votre panier a été réceptionné" |
| `basket_available` | Admin dépose au point de retrait | Membres du panier | "Vos jeux sont disponibles au {deposit_point.name}" |
| `wish_refused` | Membre refuse un souhait | Administrateurs | "{user.name} a refusé {game_name}" |

---

### Workflow complet - Exemple

**Scénario** : Commande mensuelle de janvier 2025

1. **Admin** crée la commande "Janvier 2025" (type: monthly, date cible: 2025-01-15)
   - `order.status = "open"`

2. **Membre A** crée un souhait "Wingspan" (50$)
   - `wish.status = "submitted"`
   - Notification → Admin

3. **Membre B** crée un souhait "Azul" (30$)
   - `wish.status = "submitted"`
   - Notification → Admin

4. **Membre C** crée un souhait "7 Wonders" (40$)
   - `wish.status = "submitted"`
   - Notification → Admin

5. **Admin** crée un panier "Panier 1 - Janvier 2025"
   - Sélectionne les 3 souhaits
   - `basket.status = "draft"`
   - `wish[*].status = "in_basket"`

6. **Admin** édite le panier
   - Prix unitaires : Wingspan 50$, Azul 30$, 7 Wonders 40$
   - Frais de port : 20$
   - Calcul automatique des parts :
     - Wingspan : 50 + 8.33$ = 58.33$
     - Azul : 30 + 5.00$ = 35.00$
     - 7 Wonders : 40 + 6.67$ = 46.67$

7. **Admin** soumet pour validation
   - `basket.status = "awaiting_validation"`
   - Notifications → Membres A, B, C

8. **Membre A** valide son souhait
   - `wish[A].status = "validated"`

9. **Membre B** valide son souhait
   - `wish[B].status = "validated"`

10. **Membre C** refuse son souhait
    - `wish[C].status = "refused"`
    - Notification → Admin

11. **Admin** passe commande sur Philibert (hors-scope)

12. **Admin** ajoute frais de douane : 15$
    - Répartition uniquement sur souhaits validés (A et B) :
      - Wingspan : 50 / 80 * 15 = 9.38$
      - Azul : 30 / 80 * 15 = 5.62$
    - Montants dus mis à jour :
      - Wingspan : 50 + 8.33 + 9.38 = 67.71$
      - Azul : 30 + 5.00 + 5.62 = 40.62$
    - `basket.status = "awaiting_reception"`
    - Notifications → Membres A, B

13. **Membre A** indique avoir payé
    - `wish[A].payment_status = "sent"`
    - Notification → Admin

14. **Membre B** indique avoir payé
    - `wish[B].payment_status = "sent"`
    - Notification → Admin

15. **Admin** confirme réception paiements
    - `wish[A].payment_status = "received"`
    - `wish[B].payment_status = "received"`
    - Notifications → Membres A, B

16. **Admin** réceptionne le colis
    - `basket.status = "awaiting_delivery"`
    - Notifications → Membres A, B

17. **Admin** dépose au point de retrait
    - `basket.status = "available_pickup"`
    - Notifications → Membres A, B avec adresse

18. **Membre A** récupère son jeu
    - `wish[A].status = "picked_up"`

19. **Membre B** récupère son jeu
    - `wish[B].status = "picked_up"`

20. **Admin** clôture la commande
    - `order.status = "completed"`

---

## Contraintes et validations

### Contraintes de base de données

| Contrainte | Description |
|------------|-------------|
| `order.target_date >= today` | La date cible doit être dans le futur |
| `basket.order_id` → `order.id` | Relation obligatoire |
| `wish.basket_id` → `basket.id` | Relation optionnelle |
| `wish.user_id` → `user.id` | Relation obligatoire |
| `wish.deposit_point_id` → `deposit_point.id` | Relation optionnelle |
| Unique `deposit_point.is_default = true` | Un seul point par défaut |

### Validations Zod

```typescript
// Création de commande
export const createOrderSchema = z.object({
  type: z.enum(["monthly", "private_sale", "special"]),
  targetDate: z.coerce.date().min(new Date(), {
    message: "La date cible doit être dans le futur",
  }),
  description: z.string().optional(),
});

// Création de souhait
export const createWishSchema = z.object({
  orderId: z.string().uuid(),
  gameName: z.string().min(1, "Le nom du jeu est requis"),
  philbertReference: z.string().min(1, "La référence Philibert est requise"),
  philbertUrl: z.string().url().optional().or(z.literal("")),
});

// Édition de panier
export const editBasketSchema = z.object({
  shippingCost: z.coerce.number().positive("Les frais de port doivent être positifs"),
  wishes: z.array(
    z.object({
      id: z.string().uuid(),
      unitPrice: z.coerce.number().positive("Le prix doit être positif"),
    })
  ),
});
```

---

## Points de vigilance

### Performance
- Éviter les N+1 queries : utiliser `with` de Drizzle pour charger les relations
- Paginer les listes de commandes/souhaits/paniers

### Sécurité
- Toujours vérifier le rôle de l'utilisateur dans les Server Actions
- Vérifier la propriété des objets (un membre ne peut modifier que ses souhaits)
- Valider tous les inputs avec Zod

### UX
- Afficher des spinners lors des actions async
- Toasts de confirmation/erreur systématiques
- Confirmations avant suppressions

### Données
- Ne jamais hard-delete : préférer un soft-delete ou un archivage
- Logger les erreurs pour debugging
- Garder un historique des changements de statut (optionnel)

---

## Prochaines étapes

Consulter les autres fichiers de documentation :
- [BACKLOG.md](./BACKLOG.md) - User stories et planning
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture technique
- [TESTING.md](./TESTING.md) - Stratégie de tests
- [UI-COMPONENTS.md](./UI-COMPONENTS.md) - Design system
