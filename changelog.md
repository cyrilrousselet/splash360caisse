# Changelog
Tous les changements notables du projet "Splash360 Caisse (NF525)" seront documentés dans ce fichier.

Le format de ce journal des modifications est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
et ce projet adhère au [Semantic Versionning](https://semver.org/lang/fr/spec/v2.0.0.html).

## [Unreleased]
- Sauvegarde des préférences de la caisse au niveau du backend pour permettre une réinstallation sans perdre les paramètres.
- Sauvegarde des z de caisse au niveau du backend



## [1.1.2+14] - 2023-04-03
### Changed
- Correction du passage de paramètres à l'imprimante d'étiquettes (nom du template)
- Correction de la monnaie (dynamique) pour les outils de comptage (Espèces et Tickets Restaurant) du module de clôture.


## [1.1.2+13] - 2023-03-31
### Changed
- Connexion à l'API de production de Luckylikes


## [1.1.2+12] - 2023-03-30
### Changed
- Prise en charge des promotions Luckylikes


## [1.1.2+11] - 2023-03-20
### Changed
- Affichage du type de document pour l'impression des Notes
- Correction du nombre de lignes des Notes et Tickets en base de données
- Correction du calcul et de la ventilation de la TVA des commandes avec promotions
- Ecriture dans la piste d'audit d'une détection d'un défaut d'intégrité dans l'archive fiscale

## Added
- Prise en charge et impression d'un nom alternatif pour les produits et les ingrédients, destiné au ticket bilingue.
- Exportation du Journal des Événements Techniques et de la Piste d'Audit en csv dans l'Archive Fiscale.
- Exportation de la signature des Archives Fiscales depuis les paramètres.


## [1.1.1+10] - 2023-02-14
### Changed
- Correction de la récupération du prix unitaire TTC d'un article d'une commande Ubereats.


## [1.1.1+9] - 2023-02-14
### Changed
- Correction de l'application des remises articles, remises panier et de la combinaison des remises articles et panier, ainsi que le calcul de la tva, des prix HT et TTC après remises.


## [1.1.0+7] - 2023-02-14
### Changed
- Correction de la prise en charge d'un uniqid pour la caisse et l'opérateur pour les commandes provenant d'Ubereats, de Deliveroo et de la borne
- Correction de la prise en charge du message et QRcode de promo (quand il n'est pas défini dans les préférences)
- Correction de l'enregistrement du token Ubereats dans le localStorage
- Ajout d'un bouton de purge des token Ubereats dans les Paramètres > Commandes > Canaux


## [1.1.0+6] - 2023-02-09
### Added
- Prise en charge du bipper dans les commandes télétransmises (bornes, clic&collect, etc.)


## [1.1.0+5] - 2023-02-07
### Added
- Ajout du mode de commande (abrégé) et du numéro de bipper sur les étiquettes (print label)
- Version arabe de l'impression bilingue

### Changed
- Correction de l'impression des étiquettes, filtrage des frais de service
- Impression bilingue


## [1.1.0+4] - 2023-02-01

### Changed
- Correction de la sélection des dates d'affichage de la liste des commandes
- Possibilité de changer le CodeTable de l'imprimante ESC/POS
- Correction de l'impression des étiquettes, filtrage des frais de service

### Disabled
- Impression bilingue


## [1.1.0+3] - 2023-01-05
### Added
- Impression optionnelle sur le ticket commande d'un message promotionnel et d'un QR-code.
- Impression bilingue des infos commandes (articles, totaux, taxes, infos legales) possibles sur le ticket commande.

### Changed
- Le DateRangePicker attend une date de début et une date de fin pour pouvoir valider
- Déblocage de la caisse après l'annulation de commandes (si aucune autre commande doit être clôturée)


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
- Le module de communication interprocess "eiphop" n'écrit des logs qu'en mode de développement []

<!-- ### Removed -->