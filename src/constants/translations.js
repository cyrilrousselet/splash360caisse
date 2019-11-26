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
            ]
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
                }
            },
            plannings: { nom: "Plannings" },
            depenses: { nom: "Dépenses" },
            cloture: { nom: "Clôture" },
            stocks: { nom: "Stocks" },
            statistiques: { nom: "Statistiques" },
            menu: { nom: "Menu" },
            clients: { nom: "Clients" },
            compte_utilisateur: { nom: "Compte utilisateur" },
            parametres: {
                nom: "Paramètres",
                submodules: {
                    entreprise: { nom: 'Entreprise' },
                    utilisateurs: { nom: 'Utilisateurs' },
                    financier: { nom: 'Financier' },
                    peripheriques: { nom: 'Périphériques' },
                    commandes: { nom: 'Commandes' },
                    options: { nom: 'Options' },
                }
            }
        }
    }
}
export { data };