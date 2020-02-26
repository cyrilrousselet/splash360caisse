const data = {
    fr: {
        general: {
            checkbox: "Checkbox",
            checkbox2: "L’autre checkbox",
            jours: [
                "dimanche",
                "lundi",
                "mardi",
                "mercredi",
                "jeudi",
                "vendredi",
                "samedi"
            ],
            mois: [
                "janvier",
                "février",
                "mars",
                "avril",
                "mai",
                "juin",
                "juillet",
                "août",
                "septembre",
                "octobre",
                "novembre",
                "décembre"
            ],
            dialog: {
                ok: "Valider",
                cancel: "Annuler",
                clear: "Effacer",
                save: "Enregistrer"
            }
        },
        footer: {
            online: "connecté",
            offline: "non connecté"
        },
        dashboard: {
            nom: 'Accueil',
            points: ' pts',
            ticketsnum: 'Nombre de tickets : ',
            ca: 'Chiffre d’affaires : ',
            logout: {
                titre: 'Déconnexion',
                texte: 'Voulez-vous vous déconnecter ?'
            }
        },
        modules: {
            marketing: { 
                nom: "Marketing",
                submodules: {
                    promotions: { nom: 'Promotions' },
                    newsletter: { nom: 'Newsletter' },
                    sms: { nom: 'Sms' }
                } 
            },
            encaissement: { 
                nom: "Encaissement",
                selecteur: {
                    empty: "Le catalogue ne contient aucun produit."
                },
                panier: {
                    ticket_no: "Ticket N° ",
                    liste: {
                        nom: "Produit",
                        quantite: "Qté",
                        prix: "Prix",
                        total: "Total :"
                    },
                    mode: {
                        surplace: "Sur place",
                        emporter: "Emporter",
                        livraison: "Livraison"
                    },
                    action: {
                        encaissement: "Encaissement",
                        valider: "Valider",
                        tiroir: "Tiroir",
                        attente: "Attente",
                        reprise: "Reprise"
                    },
                    messages: {
                        delete: {
                            titre: "Supprimer tous les produits",
                            texte: "Voulez-vous supprimer tous les produits de la commande ?<br />Cette opération ne peut être annulée."
                        }
                    }
                },
                reglement: {
                    titre: "Encaissement",
                    liste: {
                        titre: "Règlement",
                        ticket: "Ticket Restaurant",
                        especes: "Espece",
                        carte: "Carte Bleue",
                        cheque: "Chèque",
                        rendre: "À rendre :",
                        trop: "Trop perçu :"
                    },
                    moyens: {
                        ticket: "Ticket restau",
                        especes: "Espèces",
                        carte: "Carte Bleue",
                        cheque: "Chèque"
                    },
                    raccourcis: [
                        "5 €",
                        "10 €",
                        "20 €",
                        "50 €"
                    ]
                },
                personnalisation: {
                    titre: 'Personnalisation',
                    aucun: 'Aucun'
                }
            },
            employes: { nom: "Employés" },
            depenses: { nom: "Dépenses" },
            listecommandes: { 
                nom: "Liste Commandes",
                dates: {
                    start: "Liste des commandes du ",
                    end: " au "
                },
                status: {
                    a_encaisser: "À encaisser",
                    standby: "En attente",
                    confirmed: "Terminées"
                },
                recherche: {
                    numero: "N° Commande",
                    client: "Nom Client"
                },
                liste: {
                    date: "Date",
                    heure: "Heure",
                    numero: "Numéro",
                    montant: "Montant",
                    client: "Client",
                    actions: "Actions"
                },
                actions: {
                    encaissement: "Encaissement",
                    annuler: "Annuler",
                    reprise: "Reprise"
                },
                impression: {
                    titre: "Impression Ticket",
                    tous: "tous"
                }
            },
            cloture: { nom: "Clôture" },
            stocks: { nom: "Stocks" },
            statistiques: { nom: "Statistiques" },
            menu: { nom: "Menu" },
            clients: { 
                nom: "Clients",
                liste: {
                    code: 'Id',
                    nom: 'Nom',
                    prenom: 'Prénom',
                    tel1: 'Téléphone 1',
                    email: 'Email',
                    codepostal: 'Code postal',
                    ville: 'Ville',
                    actions: 'Actions',
                    supprimer: 'Supprimer',
                    historique: 'Historique'
                },
                edition: {
                    editer: 'Fiche client',
                    ajouter: 'Nouveau client',
                    code: 'Code client',
                    inscription: 'Date d’inscription',
                    bloquer: 'Bloquer client',
                    total: 'Total achats',
                    points: 'Total points',
                    utilises: 'Total utilisés',
                    nom: 'Nom',
                    prenom: 'Prénom',
                    adresse1: 'Adresse',
                    adresse2: 'Complément d’adresse',
                    batiment: 'Bâtiment',
                    etage: 'Étage',
                    codepostal: 'Code postal',
                    ville: 'Ville',
                    tel1: 'Téléphone 1',
                    tel2: 'Téléphone 2',
                    email: 'Email',
                    remarque: 'Remarque'
                }
            },
            compte_utilisateur: { nom: "Compte utilisateur" },
            parametres: {
                nom: "Paramètres",
                submodules: {
                    entreprise: { 
                        nom: 'Entreprise',
                        general: {
                            titre: 'Général',
                            label: {
                                denomination: 'Dénomination sociale',
                                enseigne: 'Nom d’enseigne',
                                adresse: 'Adresse',
                                code_postal: 'Code Postal',
                                ville: 'Ville',
                                telephone: 'Numéro de téléphone',
                                siret: 'No SIRET',
                                ape: 'Code APE',
                                tva: 'No TVA'
                            },
                            placeholder: {
                                denomination: 'votre dénomination ici',
                                enseigne: 'votre nom ici',
                                adresse: 'Adresse',
                                code_postal: 'Ex. : 75001',
                                ville: 'Ex. : Paris',
                                telephone: 'Ex. : 01 02 03 04 05',
                                siret: '14 caractères',
                                ape: '5 caractères',
                                tva: '13 caractères'
                            }
                        },
                        objectif: {
                            titre: 'Objectif journalier',
                            label: {
                                ca: 'CA TTC',
                                ca_caption: '0 = désactivé'
                            }
                        },
                        options: {
                            titre: 'Options',
                            label: {
                                auto_update: 'MAJ automatique',
                                clavier: 'Clavier virtuel',
                                avoirs: 'Gestion des avoirs',
                                service: 'Gestion par service',
                                heure_fin: 'Heure de fin de service',
                                heure_fin_caption: 'Si la gestion par service est activé, l’heure de fin de service est l’heure indiquée sinon le logiciel considère qu’une journée se termine à minuit et vous devez faire la clôture avant de commencer un nouveau service',
                                message_ticket: 'Message fin de ticket'
                            }
                        }
                    },
                    utilisateurs: { 
                        nom: 'Utilisateurs',
                        liste: {
                            titre: 'Liste des utilisateurs',
                            nom: 'Nom',
                            passe: 'Mot de passe',
                            droits: 'Droits'
                        },
                        edition: {
                            ajouter: 'Ajouter un utilisateur',
                            editer: 'Édition de l’utilisateur',
                            first: 'L’utilisateur doit changer de mot de passe à la prochaine connexion',
                            droits: {
                                clients: "Accès Clients",
                                stocks: "Accès Stocks",
                                statistiques: "Accès Statistiques",
                                parametres: "Accès Paramètres",
                                menu: "Accès Menu",
                                cloture: "Accès Clôture",
                                marketing: "Accès Marketing",
                                depenses: "Accès Dépenses",
                                plannings: "Accès Plannings",
                                remise: "Remise"
                            }
                        }
                    },
                    financier: { 
                        nom: 'Financier',
                        tva: {
                            titre: 'Taux de TVA',
                            identifiant: 'Identifiant',
                            taux: 'Taux'
                        },
                        moyen: {
                            titre: 'Modes de Paiement',
                        },
                        livraison: {
                            titre: 'Vente en livraison',
                            caption: 'Permet la vente à la commande et un encaissement ultérieur'
                        },
                        happyhours: {
                            titre: 'Happy Hours',
                            debut: 'Heure début',
                            fin: 'Heure fin',
                            remise: 'Remise'
                        },
                        fidelite: {
                            titre: 'Fidélité',
                            activation: 'Activer la fidélité',
                            valeur: '1 point = ',
                            seuil: 'Débloquer à partir de;points'
                        }
                    },
                    peripheriques: { nom: 'Périphériques' },
                    commandes: { 
                        nom: 'Commandes',
                        types: {
                            nom:'Types de commande',
                            label: {
                                nom: 'Nom',
                                identifiant: 'Identifiant',
                                frais: 'Frais',
                                remise: 'Remise',
                                activation: 'Activation',
                                ajouter: 'Ajouter un type de commande',
                                editer: 'Édition du type de commande'
                            }
                        },
                        numero: {
                            nom: 'N° de commande',
                            label: {
                                debut: 'Début N° de commande',
                                compteur: 'Compteur',
                                reset: 'Reset',
                                hexa: 'Activer N° hexadécimal'
                            }
                        }
                    },
                    options: { nom: 'Options' },
                }
            }
        }
    }
}
export { data };