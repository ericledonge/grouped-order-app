# BACKLOG - Grouped Order Platform

> Plateforme de coordination d'achats groupés de jeux de société pour un groupe Facebook québécois.

## Légende

| Statut | Description |
|--------|-------------|
| `[ ]` | Non commencé |
| `[~]` | En cours |
| `[x]` | Terminé |
| `[!]` | Bloqué |

---

## Milestone 0 : Infrastructure de base

> **Objectif** : Avoir les fondations techniques pour développer rapidement

### Backend

- [x] **INFRA-001** : Configuration Drizzle ORM + connexion Turso
- [x] **INFRA-002** : Schéma de base de données (tables: users, orders, wishes, baskets, deposit_points)
- [x] **INFRA-003** : Configuration Better Auth avec plugin Admin
- [x] **INFRA-004** : Middleware d'authentification Hono
- [x] **INFRA-005** : Structure Clean Architecture (routes, services, repositories)
- [x] **INFRA-006** : Configuration CORS pour le frontend
- [x] **INFRA-007** : Schemas de validation Zod partagés

### Frontend

- [x] **INFRA-010** : Projet React + TanStack Router + Vite
- [x] **INFRA-011** : Configuration Tailwind CSS 4 + shadcn/ui
- [x] **INFRA-012** : Client API (fetch wrapper avec auth)
- [x] **INFRA-013** : Layout de base avec navigation
- [x] **INFRA-014** : Pages de connexion/inscription

### DevOps

- [x] **INFRA-020** : Configuration Railway (backend)
- [x] **INFRA-021** : Configuration Vercel (frontend)
- [x] **INFRA-022** : Variables d'environnement et secrets

---

## Milestone 1 : MVP - Flux minimal fonctionnel

> **Objectif** : Un membre peut créer un souhait, un admin peut créer un panier et le valider
>
> **Règles de gestion** : RG-001, RG-002, RG-004, RG-005 (partiel), RG-008, RG-009

### US-101 : Créer une commande (Admin)

**En tant qu'** administrateur
**Je veux** créer une nouvelle commande groupée
**Afin de** permettre aux membres de soumettre leurs souhaits

**Critères d'acceptation :**
- [ ] Formulaire avec type (monthly, private_sale, special) et date cible
- [x] Validation : date cible dans le futur
- [x] Statut initial "open"
- [ ] Affichage dans la liste des commandes

**Tâches techniques :**
- [x] Backend : `POST /api/orders` + validation Zod
- [x] Backend : `GET /api/orders` (liste)
- [ ] Frontend : Page `/admin/orders/new`
- [ ] Frontend : Page `/admin/orders` (liste)

---

### US-102 : Voir les commandes ouvertes (Membre)

**En tant que** membre
**Je veux** voir la liste des commandes ouvertes
**Afin de** pouvoir y ajouter mes souhaits

**Critères d'acceptation :**
- [ ] Liste des commandes avec statut "open"
- [ ] Affichage : nom, type, date cible
- [ ] Lien vers le détail de la commande

**Tâches techniques :**
- [x] Backend : `GET /api/orders?status=open`
- [ ] Frontend : Page `/orders`

---

### US-103 : Ajouter un souhait (Membre)

**En tant que** membre
**Je veux** ajouter un souhait à une commande ouverte
**Afin de** participer à l'achat groupé

**Critères d'acceptation :**
- [ ] Formulaire : nom du jeu, référence Philibert, URL (optionnel)
- [ ] Souhait lié automatiquement à l'utilisateur connecté
- [ ] Statut initial "submitted"
- [ ] Affichage dans "Mes souhaits"

**Tâches techniques :**
- [x] Backend : `POST /api/orders/:orderId/wishes`
- [x] Backend : `GET /api/wishes/mine`
- [ ] Frontend : Page `/orders/:orderId` avec formulaire
- [ ] Frontend : Page `/my-wishes`

---

### US-104 : Créer un panier (Admin)

**En tant qu'** administrateur
**Je veux** créer un panier à partir de souhaits soumis
**Afin de** grouper les achats pour l'expédition

**Critères d'acceptation :**
- [ ] Sélection de souhaits avec statut "submitted"
- [~] Souhaits passent en statut "in_basket"
- [x] Panier créé avec statut "draft"
- [ ] Avertissement si total > 300$ CAD

**Tâches techniques :**
- [x] Backend : `POST /api/baskets`
- [x] Backend : `GET /api/orders/:orderId/wishes?status=submitted`
- [ ] Frontend : Page `/admin/orders/:orderId/baskets/new`

---

### US-105 : Éditer un panier et passer en validation (Admin)

**En tant qu'** administrateur
**Je veux** saisir les prix et frais de port puis soumettre pour validation
**Afin que** les membres puissent valider leurs achats

**Critères d'acceptation :**
- [ ] Saisie prix unitaire de chaque jeu
- [ ] Saisie frais de port totaux
- [ ] Calcul automatique du prorata
- [ ] Passage en statut "awaiting_validation"

**Tâches techniques :**
- [ ] Backend : `PATCH /api/baskets/:basketId`
- [ ] Backend : `POST /api/baskets/:basketId/submit`
- [x] Backend : Service `calculateProrataShares()`
- [ ] Frontend : Page `/admin/baskets/:basketId/edit`

---

### US-106 : Valider ou refuser un souhait (Membre)

**En tant que** membre
**Je veux** valider ou refuser mes souhaits dans un panier en attente
**Afin de** confirmer mon achat au prix final

**Critères d'acceptation :**
- [ ] Voir mes souhaits avec prix unitaire + part frais de port
- [ ] Boutons "Valider" et "Refuser"
- [ ] Statut mis à jour (validated/refused)

**Tâches techniques :**
- [ ] Backend : `POST /api/wishes/:wishId/validate`
- [ ] Backend : `POST /api/wishes/:wishId/refuse`
- [ ] Frontend : Page `/my-wishes` avec actions

---

## Milestone 2 : Flux de paiement et livraison

> **Objectif** : Gérer les frais de douane, paiements et livraison
>
> **Règles de gestion** : RG-010, RG-011, RG-012, RG-013, RG-014

### US-201 : Ajouter les frais de douane (Admin)

**En tant qu'** administrateur
**Je veux** saisir les frais de douane après réception de la facture
**Afin de** calculer le montant final dû par chaque membre

**Critères d'acceptation :**
- [ ] Saisie montant total des frais de douane
- [ ] Répartition au prorata (souhaits validés uniquement)
- [ ] Panier passe en statut "awaiting_reception"
- [ ] Affichage du montant dû mis à jour

**Tâches techniques :**
- [ ] Backend : `POST /api/baskets/:basketId/customs`
- [ ] Frontend : Page `/admin/baskets/:basketId` avec formulaire douane

---

### US-202 : Indiquer l'envoi du paiement (Membre)

**En tant que** membre
**Je veux** indiquer que j'ai envoyé mon paiement
**Afin d'** informer l'administrateur

**Critères d'acceptation :**
- [ ] Bouton "J'ai payé" sur mes souhaits validés
- [ ] `payment_status` passe à "sent"
- [ ] Timestamp enregistré

**Tâches techniques :**
- [ ] Backend : `POST /api/wishes/:wishId/payment-sent`
- [ ] Frontend : Bouton dans `/my-wishes`

---

### US-203 : Confirmer la réception du paiement (Admin)

**En tant qu'** administrateur
**Je veux** confirmer la réception des paiements
**Afin de** suivre les paiements reçus

**Critères d'acceptation :**
- [ ] Liste des paiements en attente (status "sent")
- [ ] Marquer comme reçu (complet ou partiel)
- [ ] Saisie du montant reçu

**Tâches techniques :**
- [ ] Backend : `POST /api/wishes/:wishId/payment-received`
- [ ] Frontend : Page `/admin/payments`

---

### US-204 : Indiquer la réception du colis (Admin)

**En tant qu'** administrateur
**Je veux** indiquer que le colis a été réceptionné
**Afin de** mettre à jour le statut du panier

**Critères d'acceptation :**
- [ ] Bouton "Colis reçu" sur le panier
- [ ] Panier passe en statut "awaiting_delivery"

**Tâches techniques :**
- [ ] Backend : `POST /api/baskets/:basketId/received`
- [ ] Frontend : Bouton dans `/admin/baskets/:basketId`

---

## Milestone 3 : Points de dépôt et retrait

> **Objectif** : Gérer la logistique de distribution
>
> **Règles de gestion** : RG-015, RG-016, RG-017

### US-301 : Gérer les points de dépôt (Admin)

**En tant qu'** administrateur
**Je veux** créer et gérer les points de dépôt
**Afin de** définir les lieux de retrait

**Critères d'acceptation :**
- [ ] CRUD points de dépôt
- [ ] Un point par défaut obligatoire
- [ ] Adresse complète

**Tâches techniques :**
- [ ] Backend : CRUD `/api/deposit-points`
- [ ] Frontend : Page `/admin/deposit-points`

---

### US-302 : Assigner les points de dépôt aux souhaits (Admin)

**En tant qu'** administrateur
**Je veux** assigner un point de dépôt à chaque souhait
**Afin de** préparer la distribution

**Critères d'acceptation :**
- [ ] Point de dépôt par défaut automatique
- [ ] Modification possible par l'admin
- [ ] Affichage dans le détail du panier

**Tâches techniques :**
- [ ] Backend : `PATCH /api/wishes/:wishId/deposit-point`
- [ ] Frontend : Sélection dans `/admin/baskets/:basketId`

---

### US-303 : Mettre le panier à disposition (Admin)

**En tant qu'** administrateur
**Je veux** indiquer que les jeux sont disponibles au retrait
**Afin que** les membres puissent venir les chercher

**Critères d'acceptation :**
- [ ] Tous les points de dépôt doivent être assignés
- [ ] Panier passe en statut "available_pickup"

**Tâches techniques :**
- [ ] Backend : `POST /api/baskets/:basketId/available`
- [ ] Frontend : Bouton dans `/admin/baskets/:basketId`

---

### US-304 : Indiquer le retrait d'un jeu (Membre)

**En tant que** membre
**Je veux** indiquer que j'ai récupéré mon jeu
**Afin de** clôturer mon souhait

**Critères d'acceptation :**
- [ ] Bouton "J'ai récupéré" visible quand basket en "available_pickup"
- [ ] Souhait passe en statut "picked_up"

**Tâches techniques :**
- [ ] Backend : `POST /api/wishes/:wishId/picked-up`
- [ ] Frontend : Bouton dans `/my-wishes`

---

## Milestone 4 : Notifications et améliorations UX

> **Objectif** : Système de notifications et amélioration de l'expérience utilisateur

### US-401 : Système de notifications en base

**En tant qu'** utilisateur
**Je veux** recevoir des notifications dans l'application
**Afin d'** être informé des changements de statut

**Critères d'acceptation :**
- [ ] Table notifications en base
- [ ] Badge avec compteur de notifications non lues
- [ ] Page de consultation des notifications
- [ ] Marquer comme lu

**Tâches techniques :**
- [ ] Backend : Schéma notifications + CRUD
- [ ] Backend : Service de création de notifications
- [ ] Frontend : Composant NotificationBell
- [ ] Frontend : Page `/notifications`

---

### US-402 : Notifications par email (optionnel)

**En tant qu'** utilisateur
**Je veux** recevoir des emails pour les événements importants
**Afin d'** être informé même hors de l'application

**Critères d'acceptation :**
- [ ] Intégration service email (Resend, SendGrid...)
- [ ] Templates email
- [ ] Préférence utilisateur

**Tâches techniques :**
- [ ] Backend : Service email
- [ ] Backend : Templates email
- [ ] Backend : Table préférences utilisateur

---

### US-403 : Suppression d'un souhait (Membre)

**En tant que** membre
**Je veux** pouvoir supprimer mes souhaits soumis
**Afin de** me rétracter avant mise en panier

**Critères d'acceptation :**
- [ ] Bouton "Supprimer" si statut "submitted"
- [ ] Confirmation avant suppression

**Règle de gestion** : RG-003

**Tâches techniques :**
- [ ] Backend : `DELETE /api/wishes/:wishId`
- [ ] Frontend : Bouton avec confirmation

---

### US-404 : Tableau de bord Admin

**En tant qu'** administrateur
**Je veux** avoir un tableau de bord avec les métriques
**Afin d'** avoir une vue d'ensemble

**Critères d'acceptation :**
- [ ] Nombre de commandes ouvertes
- [ ] Souhaits en attente de traitement
- [ ] Paiements en attente
- [ ] Paniers à traiter

**Tâches techniques :**
- [ ] Backend : `GET /api/admin/dashboard`
- [ ] Frontend : Page `/admin`

---

## Milestone 5 : Fonctionnalités avancées

> **Objectif** : Améliorations et fonctionnalités complémentaires
>
> **Règles de gestion** : RG-006, RG-007, RG-018

### US-501 : Fermeture de commande (Admin)

**En tant qu'** administrateur
**Je veux** fermer une commande
**Afin de** ne plus accepter de nouveaux souhaits

**Critères d'acceptation :**
- [ ] Transition open → in_progress → completed
- [ ] Souhaits orphelins archivés

**Règle de gestion** : RG-018

**Tâches techniques :**
- [ ] Backend : `POST /api/orders/:orderId/close`
- [ ] Frontend : Bouton dans `/admin/orders/:orderId`

---

### US-502 : Retirer un souhait d'un panier (Admin)

**En tant qu'** administrateur
**Je veux** retirer un souhait d'un panier draft
**Afin de** réorganiser les paniers

**Critères d'acceptation :**
- [ ] Possible seulement si panier en "draft"
- [ ] Souhait repasse en "submitted"
- [ ] Recalcul des frais de port

**Règle de gestion** : RG-006

**Tâches techniques :**
- [ ] Backend : `DELETE /api/baskets/:basketId/wishes/:wishId`
- [ ] Frontend : Bouton dans `/admin/baskets/:basketId/edit`

---

### US-503 : Supprimer un panier (Admin)

**En tant qu'** administrateur
**Je veux** supprimer un panier draft
**Afin de** repartir de zéro

**Critères d'acceptation :**
- [ ] Possible seulement si panier en "draft"
- [ ] Tous les souhaits libérés
- [ ] Confirmation requise

**Règle de gestion** : RG-007

**Tâches techniques :**
- [ ] Backend : `DELETE /api/baskets/:basketId`
- [ ] Frontend : Bouton avec confirmation

---

### US-504 : Historique et recherche

**En tant qu'** utilisateur
**Je veux** consulter l'historique de mes commandes/souhaits
**Afin de** retrouver des informations passées

**Critères d'acceptation :**
- [ ] Filtres par statut, date
- [ ] Pagination
- [ ] Recherche par nom de jeu

**Tâches techniques :**
- [ ] Backend : Filtres et pagination sur les endpoints
- [ ] Frontend : Composants de filtrage

---

## Milestone 6 : Tests et qualité

> **Objectif** : Assurer la qualité et la fiabilité de l'application

### US-601 : Tests E2E Playwright

**En tant que** développeur
**Je veux** avoir des tests E2E sur les parcours critiques
**Afin de** prévenir les régressions

**Critères d'acceptation :**
- [ ] Test : Inscription → Connexion
- [ ] Test : Création commande → Souhait → Panier
- [ ] Test : Flux de validation complet
- [ ] Test : Flux de paiement

**Tâches techniques :**
- [ ] Configuration Playwright
- [ ] Tests sur parcours critiques

---

### US-602 : Tests unitaires services métier

**En tant que** développeur
**Je veux** des tests unitaires sur les calculs métier
**Afin de** garantir la précision des calculs

**Critères d'acceptation :**
- [x] Tests `calculateProrataShares()`
- [ ] Tests transitions de statut
- [x] Tests validations Zod

**Tâches techniques :**
- [x] Configuration Vitest (50 tests : 26 unit + 24 intégration)
- [~] Tests unitaires services

---

## Récapitulatif des règles de gestion

| Règle | Description | Milestone |
|-------|-------------|-----------|
| RG-001 | Création de commande | M1 (US-101) |
| RG-002 | Émission d'un souhait | M1 (US-103) |
| RG-003 | Suppression d'un souhait | M4 (US-403) |
| RG-004 | Création d'un panier | M1 (US-104) |
| RG-005 | Édition d'un panier | M1 (US-105) |
| RG-006 | Retirer un souhait d'un panier | M5 (US-502) |
| RG-007 | Suppression d'un panier | M5 (US-503) |
| RG-008 | Passage en attente de validation | M1 (US-105) |
| RG-009 | Validation ou refus d'un souhait | M1 (US-106) |
| RG-010 | Calcul du montant dû | M2 (US-201) |
| RG-011 | Ajout des frais de douane | M2 (US-201) |
| RG-012 | Indication d'envoi de paiement | M2 (US-202) |
| RG-013 | Confirmation de réception de paiement | M2 (US-203) |
| RG-014 | Réception du panier | M2 (US-204) |
| RG-015 | Assignation des points de dépôt | M3 (US-302) |
| RG-016 | Mise à disposition au point de dépôt | M3 (US-303) |
| RG-017 | Retrait d'un jeu | M3 (US-304) |
| RG-018 | Fermeture d'une commande | M5 (US-501) |

---

## Priorités

1. **Critique** : M0 + M1 (fonctionnement de base)
2. **Important** : M2 + M3 (flux complet)
3. **Nice to have** : M4 + M5 (améliorations)
4. **Qualité** : M6 (tests)

## Dépendances

```
M0 (Infrastructure)
 └── M1 (MVP)
      └── M2 (Paiement)
           └── M3 (Dépôt/Retrait)
                ├── M4 (Notifications) - peut démarrer en parallèle
                ├── M5 (Avancé) - peut démarrer en parallèle
                └── M6 (Tests) - peut démarrer en parallèle
```
