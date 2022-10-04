# Changelog
Tous les changements notables du projet "Splash360 Caisse (NF525)" seront documentés dans ce fichier.

Le format de ce journal des modifications est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
et ce projet adhère au [Semantic Versionning](https://semver.org/lang/fr/spec/v2.0.0.html).

## [Unreleased]
- Sauvegarde des préférences de la caisse au niveau du backend pour permettre une réinstallation sans perdre les paramètres.
- Sauvegarde des z de caisse au niveau du backend

## [1.1.0+2] - 2022-06-17
### Added
- Prise en charge des frais dans l'impression du ticket client [9d63649]
- Ajout d'un point d'entrée "/testcmd" dans le serveur Express de la caisse [9d63649]
- Prise en charge des commandes provenant de Deliveroo [9d63649]
- DateRangePicker pour la liste des commandes et les statistiques [9d63649]
- Processus de réinstallation de caisse [2b5efbc]
- Logo NF 525 dans le footer
- Sauvegarde des tickets au niveau du backend
- Stockage des token d'UberEats dans le LocalStorage pour pouvoir les réutiliser pendant leur durée de vie (30 jours) [f4e30e1]
- Reset et mise à jour de la liste des imprimantes et des tickets lors d'une opération de réinstallation [f4e30e1]

### Changed
- Paramètres de connexion au serveur MongoDB en local [9d63649]
- Mise à jour de la version de l'extension Redux DevTools [9d63649]
- Filtrage des clôtures au chargement, pour ne garder que les clôtures bien structurées (avec 'ventilation') [9d63649]
- Modification du calcul des prix des produits et des ingrédients à partir des commandes UberEats [9d63649]
- Correction du comptage TR en prenant en compte le trop perçu [9d63649]
- Correction d'une erreur provoquée par l'absence d'array de Modificateurs dans le payload des commandes créées par les bornes [9d63649]
- Correction de la fonction de l'impression de ticket commande depuis la liste des commandes (et tickets UberEats, Deliveroo) [9d63649]
- Paramètres : liste des Tickets : filtrage des tickets obligatoires "UberEats" et "Deliveroo" [9d63649]
- Numéro de certificat NF sur les tickets client
- Correction des checkbox d'impression des produits et ingrédients dans le module "Menu" [f4e30e1]

<!-- ### Removed -->