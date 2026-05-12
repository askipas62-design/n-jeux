-- Schéma pour Appiotti - Univers du Billard & Baby-foot
-- Ce script est conçu pour être exécuté plusieurs fois sans erreur.

-- 1. Table des Produits
create table if not exists products (
  id text primary key,
  name text not null,
  category text not null,
  priceHT numeric not null,
  stock integer not null default 0,
  badge text,
  rating numeric default 5.0,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Table des Commandes
create table if not exists orders (
  id text primary key,
  user_id uuid references auth.users not null,
  items jsonb not null,
  total_ttc numeric not null,
  status text not null default 'En attente de virement',
  proof_url text,
  proof_uploaded boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Table de la Liste de Souhaits
create table if not exists wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- 3. Activation de la sécurité (RLS)
alter table products enable row level security;
alter table orders enable row level security;
alter table wishlist enable row level security;

-- 4. Nettoyage des anciennes politiques (pour éviter les erreurs de doublons)
drop policy if exists "Les produits sont visibles par tous" on products;
drop policy if exists "Les utilisateurs voient leurs propres commandes" on orders;
drop policy if exists "Les utilisateurs créent leurs commandes" on orders;
drop policy if exists "Les utilisateurs gèrent leur liste de souhaits" on wishlist;

-- 5. Création des politiques
-- Tout le monde peut lire les produits
create policy "Les produits sont visibles par tous" 
on products for select using (true);

-- Seul l'utilisateur peut voir ses propres commandes
create policy "Les utilisateurs voient leurs propres commandes" 
on orders for select using (auth.uid() = user_id);

-- Seul l'utilisateur peut créer ses commandes
create policy "Les utilisateurs créent leurs commandes" 
on orders for insert with check (auth.uid() = user_id);

-- Liste de souhaits : gestion totale par le propriétaire
create policy "Les utilisateurs gèrent leur liste de souhaits"
on wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
