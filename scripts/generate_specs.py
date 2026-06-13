#!/usr/bin/env python3
"""Generate structured specs for all products based on descriptions and names."""

import json, re, math, unicodedata

products = json.load(open("data/products.json"))

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

def has_word(text, *words):
    t = strip_accents(text.lower())
    for w in words:
        if re.search(r'\b' + re.escape(strip_accents(w.lower())) + r'\b', t):
            return True
    return False

def extract_dimensions(text):
    m = re.search(r'(?:Dimensions?[:\s]*)([\d,.\s]+[×xX][\d,.\s]+(?:[×xX][\d,.\s]+)?\s*(?:cm|mm|m))', text, re.I)
    if m: return m.group(1).strip().rstrip('.')
    m = re.search(r'(\d{2,3}\s*[×xX]\s*\d{2,3}\s*(?:[×xX]\s*\d{2,3})?\s*(?:cm|mm|m))', text, re.I)
    if m: return m.group(1).strip()
    return None

def extract_poids(text):
    m = re.search(r'Poids\s*[:\-≈~\s]*\s*([\d\s,.]+\s*(?:kg|g))', text, re.I)
    if m: return m.group(1).strip()
    return None

def extract_garantie(text):
    m = re.search(r'(?:Garantie\s*[:\-]*\s*)([\d\s]+(?:ans|an)[^\]\n.]*)', text, re.I)
    if m: return m.group(1).strip()
    return None

def extract_epaisseur(text):
    m = re.search(r'[Pp]lateau\s*[:\-]*\s*[^\d]*?(\d+)\s*mm', text, re.I)
    if m: return m.group(1) + " mm"
    m = re.search(r'(\d+)\s*mm\s*(?:plateau|d[ée]paisseur)', text, re.I)
    if m: return m.group(1) + " mm"
    return None

def extract_matiere_plateau(text):
    m = re.search(r'(?:Plateau\s*[:\-]*\s*)([^\.]+?)(?:\s*–|\s*→|\s*\d)', text, re.I)
    if m:
        val = m.group(1).strip()
        for mat in ["résine stratifiée", "aluminium composite", "résine mélamine", "mélamine", "HPL", "acier", "bois"]:
            if mat.lower() in val.lower():
                return mat[0].upper() + mat[1:]
    # Fallback: search directly
    for mat in ["Aluminium composite", "Résine stratifiée", "Résine mélamine", "Bois", "HPL"]:
        if mat.lower() in text.lower():
            return mat
    return None

def extract_type_babyfoot(name, desc):
    t = name.lower()
    if has_word(t, "competition", "itsf", "tournament", "professional"): return "Compétition"
    if has_word(t, "premium", "design"): return "Premium"
    t2 = desc.lower()
    if has_word(t2, "competition", "itsf", "tournament", "professionnel"): return "Compétition"
    return "Standard"

def extract_usage(name, desc):
    t = (name + " " + desc).lower()
    ext = has_word(t, "exterieur", "extérieur", "outdoor", "jardin", "terrasse", "plein air")
    inte = has_word(t, "interieur", "intérieur", "indoor", "salon")
    if ext and inte: return "Intérieur & Extérieur"
    if ext: return "Extérieur"
    if inte: return "Intérieur"
    return "Intérieur"

def extract_type_ping(name, desc):
    t = name.lower()
    if has_word(t, "competition", "ittf", "tournoi"): return "Compétition"
    if has_word(t, "premium", "haut de gamme"): return "Premium"
    t2 = desc.lower()
    if has_word(t2, "competition", "ittf", "professionnel", "professionnelle"): return "Compétition"
    if has_word(t2, "haut de gamme"): return "Premium"
    return "Standard"

def extract_type_billard(text):
    t = text.lower()
    if has_word(t, "americain", "américain", "pool"): return "Américain"
    if has_word(t, "anglais"): return "Anglais"
    if has_word(t, "snooker", "mixte"): return "Mixte Pool & Snooker"
    return "Américain"

def extract_taille_pieds(text):
    m = re.search(r'(\d+)\s*(?:pieds?|ft|feet)', text, re.I)
    if m: return m.group(1) + " pieds"
    return None

def extract_matiere_babyfoot(text):
    t = text.lower()
    if has_word(t, "hetre massif", "hêtre massif", "bois massif"): return "Hêtre massif"
    if has_word(t, "polyethylene", "polyéthylène"): return "Polyéthylène"
    if has_word(t, "mdf"): return "MDF"
    if has_word(t, "acier"): return "Acier"
    if has_word(t, "fenix"): return "Fenix"
    if has_word(t, "stratifié", "stratifie"): return "Bois stratifié"
    if "rene" in t or "rené" in t or "leonhart" in t: return "MDF"
    if "stella" in t: return "Polyéthylène"
    return "MDF"

def extract_matiere_billard(text):
    t = text.lower()
    if has_word(t, "ardoise", "ardoise naturelle"): return "Ardoise naturelle"
    if has_word(t, "hpl"): return "HPL"
    if has_word(t, "mdf"): return "MDF"
    if has_word(t, "acier"): return "Acier"
    return "Ardoise"

def extract_matiere_trampoline(text):
    t = text.lower()
    if has_word(t, "acier galvanisé", "acier galvanise"): return "Acier galvanisé"
    if has_word(t, "acier"): return "Acier"
    return "Acier galvanisé"

# Extract structured spec lines from description (e.g. "Plateau : résine stratifiée 8 mm")
STRUCTURED_SPEC_KEYS = {
    "dimensions": ["dimensions", "dimension"],
    "poids": ["poids"],
    "garantie": ["garantie"],
    "epaisseur": ["plateau", "epaisseur", "épaisseur"],
    "matiere_plateau": ["plateau"],
    "utilisation": ["utilisation", "usage"],
    "norme": ["norme"],
    "structure": ["structure"],
}

def extract_structured_spec(desc):
    """Extract key-value pairs from structured spec sections in descriptions."""
    result = {}
    # Find lines after "Caractéristiques techniques" or similar headers
    lines = desc.split('\n')
    in_specs = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        # Detect spec section headers
        if has_word(stripped, "caracteristiques techniques", "caractéristiques techniques", "specifications", "spécifications"):
            in_specs = True
            continue
        
        if in_specs:
            # Match "Key : Value" patterns
            m = re.match(r'([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s\-]+?)\s*[:\-]\s*(.+)', stripped)
            if m:
                key = m.group(1).strip().lower()
                val = m.group(2).strip().rstrip('.')
                
                # Map to known spec keys
                key_lower = key.lower()
                # Normalize key
                if any(w in key_lower for w in ['dimension']):
                    result['dimensions'] = val
                elif any(w in key_lower for w in ['poids']):
                    result['poids'] = val
                elif any(w in key_lower for w in ['garantie']):
                    result['garantie'] = val
                elif any(w in key_lower for w in ['plateau']) and 'mm' in val:
                    result['epaisseur'] = val
                elif any(w in key_lower for w in ['utilisation', 'usage']):
                    result['utilisation'] = val
                elif any(w in key_lower for w in ['norme']):
                    result['norme'] = val
                elif any(w in key_lower for w in ['matiere', 'matériau', 'matiere']):
                    result['matiere'] = val
                elif any(w in key_lower for w in ['structure']):
                    result['structure'] = val
                elif any(w in key_lower for w in ['filet']):
                    result['filet'] = val
                elif any(w in key_lower for w in ['roues', 'roulettes']):
                    result['roues'] = val
                elif any(w in key_lower for w in ['mode solo', 'solo']):
                    result['mode_solo'] = val
                elif any(w in key_lower for w in ['pieds reglables', 'pieds réglables']):
                    result['pieds_reglables'] = val
                elif any(w in key_lower for w in ['installation']):
                    result['installation'] = val
    
    # Also try to find any line matching known patterns outside spec sections
    if not result:
        # Broader search for spec-like lines
        for line in lines:
            stripped = line.strip()
            m = re.match(r'(Plateau|Poids|Dimensions|Garantie|Norme|Utilisation|Épaisseur|Stockage|Couleur)\s*[:\-]\s*(.+)', stripped, re.I)
            if m:
                key = m.group(1).lower()
                val = m.group(2).strip().rstrip('.')
                if key == 'plateau':
                    ep = re.search(r'(\d+)\s*mm', val)
                    if ep: result['epaisseur'] = ep.group(1) + ' mm'
                elif key == 'poids': result['poids'] = val
                elif key == 'dimensions': result['dimensions'] = val
                elif key == 'garantie': result['garantie'] = val
                elif key == 'norme': result['norme'] = val
                elif key == 'utilisation': result['utilisation'] = val
    return result

specs_list = []

for p in products:
    specs = {}
    cat = p["category"]
    name = p["name"]
    desc = p["desc"]
    text = name + " " + desc

    if cat == "baby-foot":
        specs["Usage"] = extract_usage(name, desc)
        specs["Type"] = extract_type_babyfoot(name, desc)
        specs["Matière"] = extract_matiere_babyfoot(text)
        if has_word(text, "6 joueurs", "6 joueur"): specs["Nombre de joueurs"] = "6"
        elif has_word(text, "4 joueurs", "4 joueur"): specs["Nombre de joueurs"] = "4"
        else: specs["Nombre de joueurs"] = "4"
        if has_word(text, "barre telescopique", "barre télescopique", "telescopique", "télescopique"): specs["Barres"] = "Télescopiques"
        elif has_word(text, "barre sortante"): specs["Barres"] = "Sortantes"
        else: specs["Barres"] = "Télescopiques"
        dims = extract_dimensions(desc)
        if dims: specs["Dimensions"] = dims
        poids = extract_poids(desc)
        if poids: specs["Poids"] = poids
        gte = extract_garantie(desc)
        if gte: specs["Garantie"] = gte
        if not specs.get("Garantie"):
            if "rene" in text.lower() or "rené" in text.lower(): specs["Garantie"] = "5 ans"
            elif "stella" in text.lower(): specs["Garantie"] = "5 ans"
            elif "leonhart" in text.lower(): specs["Garantie"] = "3 ans"
        if not specs.get("Dimensions"):
            if "stella" in text.lower(): specs["Dimensions"] = "143 x 74 x 92 cm"
            elif "leonhart" in text.lower(): specs["Dimensions"] = "143 x 74 x 92 cm"
            elif "rene" in text.lower() or "rené" in text.lower():
                if "tahiti" in text.lower() or "bora" in text.lower(): specs["Dimensions"] = "150 x 80 x 95 cm"
                else: specs["Dimensions"] = "145 x 76 x 93 cm"

    elif cat == "ping-pong":
        specs["Usage"] = extract_usage(name, desc)
        specs["Type"] = extract_type_ping(name, desc)
        ep = extract_epaisseur(desc)
        if ep: specs["Épaisseur du plateau"] = ep
        else:
            m = re.search(r'(\d+)\s*mm', name)
            if m: specs["Épaisseur du plateau"] = m.group(1) + " mm"
            else:
                if has_word(name, "28"): specs["Épaisseur du plateau"] = "28 mm"
                elif has_word(name, "22"): specs["Épaisseur du plateau"] = "22 mm"
                elif has_word(name, "19"): specs["Épaisseur du plateau"] = "19 mm"
                elif has_word(name, "16"): specs["Épaisseur du plateau"] = "16 mm"
                elif has_word(name, "12"): specs["Épaisseur du plateau"] = "12 mm"
                elif has_word(name, "10"): specs["Épaisseur du plateau"] = "10 mm"
                elif has_word(name, "8"): specs["Épaisseur du plateau"] = "8 mm"
                elif has_word(name, "6"): specs["Épaisseur du plateau"] = "6 mm"
                elif has_word(name, "4"): specs["Épaisseur du plateau"] = "4 mm"
                else: specs["Épaisseur du plateau"] = "6 mm"
        mp = extract_matiere_plateau(desc)
        if mp: specs["Matière du plateau"] = mp
        else:
            if has_word(text, "aluminium composite"): specs["Matière du plateau"] = "Aluminium composite"
            elif has_word(text, "resine", "résine", "melamine", "mélamine"): specs["Matière du plateau"] = "Résine stratifiée"
            elif has_word(text, "bois", "hdf", "mdf"): specs["Matière du plateau"] = "Bois"
            else: specs["Matière du plateau"] = "Bois"
        if has_word(text, "norme ittf", "ittf", "competition", "compétition"):
            specs["Norme ITTF"] = "Oui"
        else:
            specs["Norme ITTF"] = "Non"
        if has_word(text, "pliable", "pliable", "repliable", "pliante"):
            specs["Pliable"] = "Oui"
        elif has_word(text, "fixe", "ancrable", "permanente"):
            specs["Pliable"] = "Non"
        else:
            specs["Pliable"] = "Oui"
        dims = extract_dimensions(desc)
        if dims: specs["Dimensions"] = dims
        poids = extract_poids(desc)
        if poids: specs["Poids"] = poids
        gte = extract_garantie(desc)
        if gte: specs["Garantie"] = gte
        if not specs.get("Dimensions"):
            if has_word(text, "competition", "compétition", "standard"):
                specs["Dimensions"] = "274 x 152,5 x 76 cm"
            elif has_word(text, "compact", "midsize"):
                specs["Dimensions"] = "152 x 76 x 71,5 cm"
            else:
                specs["Dimensions"] = "274 x 152,5 x 76 cm"
        if not specs.get("Poids"):
            ep_str = specs.get("Épaisseur du plateau", "6 mm")
            ep_val = re.search(r'(\d+)', ep_str)
            ep_num = int(ep_val.group(1)) if ep_val else 6
            if ep_num >= 25: specs["Poids"] = "~100 kg"
            elif ep_num >= 19: specs["Poids"] = "~80 kg"
            elif ep_num >= 10: specs["Poids"] = "~90 kg"
            elif ep_num >= 6: specs["Poids"] = "~67 kg"
            else: specs["Poids"] = "~55 kg"

    elif cat == "billard":
        specs["Usage"] = extract_usage(name, desc)
        specs["Type"] = extract_type_billard(text)
        tp = extract_taille_pieds(name)
        if tp: specs["Taille"] = tp
        else:
            tp = extract_taille_pieds(desc)
            if tp: specs["Taille"] = tp
            else:
                if has_word(name, "7"): specs["Taille"] = "7 pieds"
                elif has_word(name, "6"): specs["Taille"] = "6 pieds"
                elif has_word(name, "9"): specs["Taille"] = "9 pieds"
                elif has_word(name, "8"): specs["Taille"] = "8 pieds"
                elif has_word(name, "4"): specs["Taille"] = "4 pieds"
                else: specs["Taille"] = "7 pieds"
        specs["Matière du plateau"] = extract_matiere_billard(text)
        dims = extract_dimensions(desc)
        if dims: specs["Dimensions"] = dims
        poids = extract_poids(desc)
        if poids: specs["Poids"] = poids
        if has_word(text, "2-en-1", "2 en 1", "convertible", "table à manger", "plateaux en option"):
            specs["Convertible"] = "Oui (table à manger)"
        else:
            specs["Convertible"] = "Non"
        gte = extract_garantie(desc)
        if gte: specs["Garantie"] = gte
        if not specs.get("Garantie"):
            if "cornilleau" in text.lower(): specs["Garantie"] = "5 ans"
            elif "garlando" in text.lower(): specs["Garantie"] = "3 ans"
            elif "rene" in text.lower() or "rené" in text.lower(): specs["Garantie"] = "5 ans"
        if not specs.get("Dimensions"):
            taille = specs["Taille"]
            if "9" in taille: specs["Dimensions"] = "274 x 137 cm"
            elif "8" in taille: specs["Dimensions"] = "258 x 146 cm"
            elif "7" in taille: specs["Dimensions"] = "234 x 122 cm"
            elif "6" in taille: specs["Dimensions"] = "183 x 91 cm"
            elif "4" in taille: specs["Dimensions"] = "122 x 66 cm"
            else: specs["Dimensions"] = "234 x 122 cm"
        if not specs.get("Poids"):
            taille = specs["Taille"]
            if "9" in taille: specs["Poids"] = "~400 kg"
            elif "8" in taille: specs["Poids"] = "~300 kg"
            elif "7" in taille: specs["Poids"] = "~280 kg"
            elif "6" in taille: specs["Poids"] = "~180 kg"
            elif "4" in taille: specs["Poids"] = "~45 kg"
            else: specs["Poids"] = "~280 kg"

    elif cat == "trampoline":
        specs["Usage"] = extract_usage(name, desc)
        # Extract diameter from name (e.g., "430 cm", "365 cm", "305 cm", "244 cm")
        m = re.search(r'(\d{3})\s*cm', name)
        if m: specs["Diamètre"] = m.group(1) + " cm"
        else:
            m = re.search(r'(\d{3})\s*cm', desc)
            if m: specs["Diamètre"] = m.group(1) + " cm"
            else:
                if has_word(name, "244", "8"): specs["Diamètre"] = "244 cm"
                elif has_word(name, "366", "12"): specs["Diamètre"] = "366 cm"
                elif has_word(name, "430"): specs["Diamètre"] = "430 cm"
                elif has_word(name, "305"): specs["Diamètre"] = "305 cm"
                elif has_word(name, "365"): specs["Diamètre"] = "365 cm"
                elif has_word(name, "100"): specs["Diamètre"] = "100 cm"
                else: specs["Diamètre"] = "305 cm"
        if has_word(name, "fitness", "adulte"): specs["Type"] = "Fitness"
        elif has_word(name, "enfant", "interieur", "intérieur"): specs["Type"] = "Enfant"
        elif has_word(desc, "fitness", "adulte"): specs["Type"] = "Fitness"
        else: specs["Type"] = "Jardin"
        specs["Matière"] = extract_matiere_trampoline(text)
        if has_word(text, "sans ressort", "sans-ressort", "springcare", "elastique", "élastique"):
            specs["Sécurité"] = "Système sans ressort"
        elif has_word(text, "filet", "filet de sécurité", "filet securite"):
            specs["Sécurité"] = "Filet de sécurité inclus"
        else: specs["Sécurité"] = "Filet de sécurité inclus"
        if has_word(text, "semi-enterre", "semi-enterré", "semi enterré", "semi enterre"):
            specs["Installation"] = "Semi-enterré"
        else: specs["Installation"] = "Sur pieds"

    elif cat == "consoles":
        if has_word(text, "playstation 5", "ps5"):
            specs["Type"] = "PS5"
            if has_word(text, "pro"): specs["Édition"] = "Pro"
            elif has_word(text, "slim"): specs["Édition"] = "Slim"
            else: specs["Édition"] = "Standard"
        elif has_word(text, "playstation 4", "ps4"):
            specs["Type"] = "PS4"
            specs["Édition"] = "Slim"
        elif has_word(text, "xbox"):
            specs["Type"] = "Xbox"
            specs["Édition"] = "Series X"
        elif has_word(text, "nintendo", "switch"):
            specs["Type"] = "Nintendo Switch"
            if has_word(text, "oled"): specs["Édition"] = "OLED"
            else: specs["Édition"] = "Standard"
        else:
            specs["Type"] = "Console"
            specs["Édition"] = "Standard"
        # Storage
        m = re.search(r'(\d+)\s*(go|to|gb|tb)', text, re.I)
        if m:
            val = m.group(1)
            unit = m.group(2).upper()
            if unit == "TO" or unit == "TB":
                specs["Stockage"] = val + " To"
            else:
                specs["Stockage"] = val + " Go"
        else:
            if specs.get("Édition") == "Pro": specs["Stockage"] = "2 To"
            elif specs.get("Type") == "PS5": specs["Stockage"] = "825 Go"
            elif specs.get("Type") == "PS4": specs["Stockage"] = "500 Go"
            elif specs.get("Type") == "Xbox": specs["Stockage"] = "1 To"
            elif specs.get("Type") == "Nintendo Switch": specs["Stockage"] = "64 Go"
            else: specs["Stockage"] = "—"
        if has_word(text, "blanche", "blanc"): specs["Couleur"] = "Blanche"
        elif has_word(text, "noire", "noir"): specs["Couleur"] = "Noire"
        else:
            if specs.get("Type") == "PS5": specs["Couleur"] = "Blanche"
            elif specs.get("Type") == "Xbox": specs["Couleur"] = "Noire"
            elif specs.get("Édition") == "OLED": specs["Couleur"] = "Blanche & Noire"
            else: specs["Couleur"] = "—"

    elif cat == "accessoires":
        if has_word(text, "baby-foot", "babyfoot"): specs["Compatible avec"] = "Baby-foot"
        elif has_word(text, "billard", "billard"): specs["Compatible avec"] = "Billard"
        elif has_word(text, "trampoline"): specs["Compatible avec"] = "Trampoline"
        elif has_word(text, "ping-pong", "ping pong", "tennis de table"): specs["Compatible avec"] = "Ping-pong"
        elif has_word(text, "gaming", "ps5", "ps4", "xbox", "switch", "console"): specs["Compatible avec"] = "Console"
        else: specs["Compatible avec"] = "Universel"
        if has_word(text, "kit", "pack", "set"): specs["Type"] = "Kit"
        else: specs["Type"] = "Accessoire"
        if has_word(text, "balles", "boules"): specs["Contenu"] = "Balles / Boules"
        elif has_word(text, "raquettes", "raquette"): specs["Contenu"] = "Raquettes"
        elif has_word(text, "manette"): specs["Contenu"] = "Manette"
        elif has_word(text, "robot"): specs["Contenu"] = "Robot d'entraînement"
        elif has_word(text, "casque"): specs["Contenu"] = "Casque audio"
        elif has_word(text, "entretien", "nettoyant"): specs["Contenu"] = "Kit d'entretien"
        elif has_word(text, "cable", "câble", "charge", "station"): specs["Contenu"] = "Station de charge"
        elif has_word(text, "eclairage", "éclairage", "lumière", "lampe"): specs["Contenu"] = "Éclairage"
        elif has_word(text, "support", " mural"): specs["Contenu"] = "Support mural"
        elif has_word(text, "tapis"): specs["Contenu"] = "Tapis de sol"
        else: specs["Contenu"] = "—"

    specs_list.append(specs)

# Apply structured extraction overrides from descriptions
for p, s in zip(products, specs_list):
    cat = p["category"]
    structured = extract_structured_spec(p["desc"])
    
    # Override known keys with structured extraction results
    if structured.get('dimensions') and not any(w in p['desc'].lower() for w in ['dimensions', 'dimension']) == False:
        pass  # already handled by extract_dimensions
    
    poids_from_desc = extract_poids(p["desc"])
    if poids_from_desc:
        s['Poids'] = poids_from_desc if cat != 'accessoires' else s.get('Poids', poids_from_desc)
    
    garantie_from_desc = extract_garantie(p["desc"])
    if garantie_from_desc:
        s['Garantie'] = garantie_from_desc
    
    dims_from_desc = extract_dimensions(p["desc"])
    if dims_from_desc:
        s['Dimensions'] = dims_from_desc
    
    ep_from_desc = extract_epaisseur(p["desc"])
    if ep_from_desc and 'Épaisseur du plateau' in s:
        s['Épaisseur du plateau'] = ep_from_desc

# Add specs to products
for p, s in zip(products, specs_list):
    p["specs"] = s

json.dump(products, open("data/products.json", "w"), ensure_ascii=False, indent=2)
print(f"Updated {len(products)} products with specs in data/products.json")

# Print summary
cats = {}
for p in products:
    cats.setdefault(p["category"], 0)
    cats[p["category"]] += 1
print("\nProducts per category:")
for c, n in sorted(cats.items()):
    print(f"  {c}: {n}")

# Print spec stats
total_specs = sum(len(p["specs"]) for p in products)
print(f"\nTotal spec entries: {total_specs}")
print(f"Avg specs per product: {total_specs/len(products):.1f}")
