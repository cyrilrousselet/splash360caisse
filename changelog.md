# Changelog
Tous les changements notables du projet "Splash360 Caisse (NF525)" seront documentés dans ce fichier.

Le format de ce journal des modifications est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
et ce projet adhère au [Semantic Versionning](https://semver.org/lang/fr/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0+2] - 2022-06-17
### Added
- Prise en charge des frais dans l'impression du ticket client
- Ajout d'un point d'entrée "/testcmd" dans le serveur Express de la caisse
- Prise en charge des commandes provenant de Deliveroo
- DateRangePicker pour la liste des commandes et les statistiques
- Processus de réinstallation de caisse

### Changed
- Paramètres de connexion au serveur MongoDB en local
- Mise à jour de la version de l'extension Redux DevTools
- Filtrage des clôtures au chargement, pour ne garder que les clôtures bien structurées (avec 'ventilation')
- Modification du calcul des prix des produits et des ingrédients à partir des commandes UberEats
- Correction du comptage TR en prenant en compte le trop perçu
- Correction d'une erreur provoquée par l'absence d'array de Modificateurs dans le payload des commandes créées par les bornes
- Correction de la fonction de l'impression de ticket commande depuis la liste des commandes (et tickets UberEats, Deliveroo)
- Paramètres : liste des Tickets : filtrage des tickets obligatoires "UberEats" et "Deliveroo"

### Removed