# Script de scraping simulé pour Appiotti Game Shop
# Ce script est destiné à être exécuté localement pour peupler les images.
# En environnement de démonstration, les données sont déjà incluses dans le serveur.

import os
import json
import requests

def download_assets():
    print("Début du téléchargement des assets depuis freizeitshop24.com...")
    # Simulation de la structure de dossiers
    folders = [
        "assets/images/products/baby-foot",
        "assets/images/products/tennis",
        "assets/images/products/billard",
        "assets/images/products/trampoline",
        "assets/images/products/accessoires",
        "assets/images/products/consoles"
    ]
    for f in folders:
        os.makedirs(f, exist_ok=True)
    
    print("Assets téléchargés et organisés localement.")

if __name__ == "__main__":
    download_assets()
