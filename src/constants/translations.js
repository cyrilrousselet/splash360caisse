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
                save: "Enregistrer",
                back: "Retour",
                delete: "Supprimer",
                accept: "Accepter",
                deny: "Refuser",
                select: "Sélectionner",
                browse: "Parcourir",
                print: "Imprimer"
            },
            check: {
                tous: 'Tout sélectionner',
                aucun: 'Tout désélectionner'
            }
        },
        footer: {
            online: "connecté",
            offline: "non connecté"
        },
        login: {
            premiere: {
                titre: 'Première connexion',
                active: 'Entrez le mot de passe par défaut pour activer la caisse',
                texte: 'Vous devez personnaliser l’identifiant administrateur afin d’utiliser la caisse.'
            },
            erreur: {
                titre: 'Erreur !',
                texte: 'Veuillez vérifier votre identifiant'
            },
            denied: {
                titre: 'Utilisateur désactivé !',
                texte: 'Cet utilisateur est désactivé'
            }
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
                nom: "Promotions",
                submodules: {
                    promotions: { nom: 'Promotions' },
                    newsletter: { nom: 'Newsletter' },
                    sms: { nom: 'Sms' },
                    avoirs: {
                        nom: 'Avoirs',
                        liste: {
                            code: 'Code',
                            valeur: 'Valeur',
                            limite: 'Validité',
                            status: {
                            nom: 'Status',
                            burnt: 'Burnt',
                            perime: 'Périmé',
                            valide: 'Valide'
                            }
                        }
                    }
                },
                avoir: {
                    impression: {
                        nom: 'AVOIR',
                        montant: 'Montant',
                        validite: 'Validité',
                        client: 'Numero client'
                    }
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
                commentaires: {
                    titre_cmd: "Commentaire de ticket",
                    titre_itm: "Commentaire de produit",
                    titre_ing: "Commentaire d’ingrédient",
                    texte: "Saisissez votre commentaire :",
                    caption: "Texte libre, max 126 car.",
                    predefini: "Commentaire prédéfini :",
                    suppression: {
                        bouton: "Supprimer commentaire",
                        titre: "Suppression du commentaire",
                        texte: "Êtes-vous sûr de supprimer le commentaire ?<br />Cette opération est définitive"
                    }
                },
                discount: {
                    titre_cmd: "Réduction sur le panier",
                    titre_itm: "Réduction sur le produit",
                    titre_ing: "Réduction sur l’ingrédient",
                    // texte: "Saisissez votre réduction :",
                    // caption: "Texte libre, max 126 car.",
                    predefini: "Réduction prédéfinie :",
                    suppression: {
                        bouton: "Supprimer réduction",
                        titre: "Suppression de la réduction",
                        texte: "Êtes-vous sûr de supprimer la réduction ?<br />Cette opération est définitive"
                    }
                },
                bipper: {
                    titre: "Sélection de Bipper",
                    identifiant: "ID du bipper",
                    suppression: {
                        bouton: "Aucun bipper"
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
                        avoir: "Avoir",
                        rendre: "À rendre :",
                        trop: "Trop perçu :",
                        create_avoir: "Faire un avoir"
                    },
                    moyens: {
                        ticket: "Ticket restau",
                        especes: "Espèces",
                        carte: "Carte Bleue",
                        cheque: "Chèque",
                        avoir: "Avoir",
                        uber: "Uber"
                    },
                    scan_avoir: "Scan Avoir",
                    raccourcis: [
                        "5 €",
                        "10 €",
                        "20 €",
                        "50 €"
                    ],
                    erreur: {
                        ticket: {
                            yet: {
                                titre: 'Erreur Ticket Restaurant',
                                texte: 'Le Ticket Restaurant a déjà été utilisé.'
                            },
                            deprecated: {
                                titre: 'Erreur Ticket Restaurant',
                                texte: 'Le Ticket Restaurant est périmé.'
                            }
                        },
                        avoir: {
                            burnt: {
                                titre: 'Erreur Avoir',
                                texte: 'L’Avoir a déjà été utilisé.'
                            },
                            deprecated: {
                                titre: 'Erreur Avoir',
                                texte: 'L’Avoir est périmé.'
                            },
                            inconnu: {
                                titre: 'Erreur Avoir',
                                texte: 'L’Avoir n’est pas reconnu.'
                            },
                            client: {
                                titre: 'Erreur Avoir',
                                texte: 'L’Avoir est réservé à un autre client'
                            }
                        },
                        modif: {
                            depassement: {
                                titre: 'Erreur de montant',
                                texte: 'Lors d’une modification, il est impossible de dépasser le montant déjà réglé'
                            }
                        }
                    }
                },
                personnalisation: {
                    titre: 'Personnalisation',
                    aucun: 'Aucun',
                    precedent: 'Précédent',
                    suivant: 'Suivant',
                    valider: 'Valider'
                }
            },
            employes: { 
                nom: "Employés",
                pointeuse: {
                    titre: 'Pointeuse',
                    btn_arrivee: 'Arrivée',
                    btn_depart: 'Départ',
                    validation: {
                        titre_arrivee: 'Arrivée le ',
                        titre_depart: 'Départ le ',
                        identification: 'Identification :'
                    },
                    erreur: {
                        inconnu: {
                            titre: 'Employé inconnu',
                            texte: 'Veuillez vérifier votre indentifiant'
                        },
                        aucun: {
                            titre: 'Pas de pointage en cours',
                            texte: 'Vous n’avez pas pointé lors de votre arrivée'
                        },
                        deja: {
                            titre: 'Pointage déjà en cours',
                            texte: 'Vous n’avez pas pointé lors de votre précédent départ'
                        }
                    }
                },
                paies: {
                    nom: "Temps de travail",
                    pickers: {
                        du: "Temps de travail du",
                        au: "au"
                    },
                    titre: {
                        jour: 'Volume horaire journalier',
                        semaine: 'Volume horaire hebdomadaire',
                        mois: 'Volume horaire mensuel'
                    },
                    view: {
                        today: "Aujourd’hui",
                        jour: "Jour",
                        semaine: "Semaine",
                        mois: "Mois"
                    },
                    liste: {
                        nom: 'Nom',
                        reel: 'Réel',
                        prevu: 'Prévu',
                        ecart: 'Écart',
                        taux: 'Tx hor.',
                        correction: 'Ajust.',
                        travail: 'Tps travail',
                        salaire: 'Salaire',
                        semaine: 'Semaine du '
                    },
                    timeadjust: {
                        titre: 'Ajustement de temps',
                        employe: 'Employé :',
                        reel: 'Tps réel :',
                        prevu: 'Tps prévu :',
                        periode: {
                            jour: 'Pour le ',
                            semaine: 'Pour la semaine du ',
                            mois: 'Pour le mois de '
                        },
                        heures: 'h',
                        minutes: 'min',
                        valeur: 'Nouvel écart :'
                    },
                    employe: {
                        reel: 'Volume horaire réel',
                        prevu: 'Volume horaire planning',
                        ecart: 'Écart',
                        travail: 'Temps de travail'
                    }
                },
                planning: {
                    grille: {
                        employes: 'Employés',
                        total: 'Total',
                        heures: 'Heures travaillées'
                    },
                    edit: {
                        titre_new: 'Nouveau shift',
                        titre_edit: 'Édition du shift',
                        date: 'Début du shift',
                        poste: 'Poste',
                        start: 'Heure de début',
                        end: 'Heure de fin',
                        employe: 'Employé',
                        recurrence: {
                            nom: 'Récurrence',
                            choix: {
                                none: 'Aucune',
                                semaine: 'Semaine',
                                mois: 'Mois'
                            },
                            rythme: {
                                semaine: ['toutes les','semaine(s)'],
                                mois: ['tous les','mois']
                            },
                            jours: {
                                semaine: 'le :',
                                mois: 'tous les :',
                                mois_choix: {
                                    mch0: 'le premier jour',
                                    'mch-1': 'le dernier jour' 
                                }
                            },
                            limite: 'fin récurrence :'
                        },
                        suppression: {
                            bouton: 'Supprimer le shift',
                            alerte: {
                                titre: 'Suppression du shift',
                                texte: 'Êtes-vous sûr de vouloir supprimer le shift et toutes les données liées ?<br />Cette action est irréversible.'
                            }
                        },
                        error: {
                            titre: 'Heure invalide',
                            texte: {
                                start: 'L’heure de début doit être avant l’heure de fin !',
                                end: 'L’heure de fin doit être après l’heure de début !'
                            }
                        }
                    }
                }
            },
            depenses: { nom: "Dépenses" },
            listecommandes: { 
                nom: "Liste Commandes",
                dates: {
                    start: "Liste des commandes du ",
                    end: " au "
                },
                status: {
                    standby: "En attente",
                    a_encaisser: "À Encaisser",
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
                    caisse: "Caisse",
                    client: "Client",
                    actions: "Actions",
                    mode: "Mode",
                    modes: {
                        livraison: 'À livrer',
                        surplace: 'Sur place',
                        emporter: 'À emporter'
                    }
                },
                actions: {
                    encaissement: "Encaisst",
                    annuler: "Annuler",
                    reprise: "Reprise"
                },
                alerte: {
                    annuler: {
                        titre: "Annulation de commande",
                        texte: "Voulez-vous annuler la commande ? Cette action est irréversible."
                    }
                },
                impression: {
                    titre: "Impression Ticket",
                    tous: "tous"
                },
                livreurs: {
                    titre: "Sélection d'un livreur",
                    aucun: "aucun"
                }
            },
            cloture: { 
                nom: "Clôture",
                x: 'X',
                z: 'Z',
                impression: {
                    titre: {
                        x: '< Ticket X Caisse >',
                        z: '< Ticket Z Caisse >'
                    },
                    periode: {
                        titre: 'Période',
                        du: 'du ',
                        au: ' au '
                    },
                    editeur: 'Éditeur : ',
                    vendeurs: ['Vendeur : ', 'Vendeurs : '],
                    vendeurs_all: 'Tous les vendeurs',
                    caisses: ['Caisse : ', 'Caisses : '],
                    caisses_all: 'Toutes les caisses',
                    depenses: 'Montant dépenses : ',
                    remboursements: 'Montant remboursements : ',
                    encaissements: 'Montant encaissements : ',
                    mtcaisse: 'Montant caisse : ',
                    ca: 'CA',
                    tickets: 'Nbre tickets',
                    ticket_moyen: 'Ticket moyen',
                    ventilation: {
                        vendeur: 'Ventilation par vendeur',
                        tva: 'Ventilation par TVA',
                        moyen: 'Ventilation par moyen de paiement'
                    },
                    caption: {
                        ventes: '<VENTES>',
                        remboursements: '<REMBOURSEMENTS>',
                        ca: '<CA>',
                        numtickets: 'NBRE DE TICKETS',
                        ticket_moyen: 'TICKET MOYEN',
                        type: 'TAUX',
                        ht: 'HT',
                        tva: 'TVA',
                        ttc: 'TTC',
                        vente_short: 'VENTES',
                        remboursements_short: 'REMB.',
                        ca_short: 'CA',
                        moyens: {
                            especes: 'ESPECES',
                            carte: 'CARTE BLEUE',
                            ticket: 'TICKET RESTAURANT',
                            cheque: 'CHÈQUE',
                            avoir: 'AVOIR'
                        },
                        total: 'Total'
                    },
                    prelevement: 'PRELEVEMENT EN CLOTURE'
                },
                selection: {
                    vendeur: "Vendeur",
                    vendeur_all: "Tous les vendeurs",
                    caisse: "Caisse",
                    caisse_all: "Toutes les caisses",
                    comptagebtn: "Comptage",
                    comptagebtn_partiel: "Comptage sélection",
                    titre: "Clôture des commandes",
                    debut: "du",
                    fin: "au"
                },
                comptage: {
                    titre: "Comptage",
                    moyens: {
                        carte: "Carte Bleue\u00A0:",
                        ticket: 'Tickets restau\u00A0:',
                        cheque: "Chèques\u00A0:",
                        especes: "Espèces\u00A0:",
                        avoir: "Avoirs reçus\u00A0:",
                        avoir_emis: "Avoirs émis\u00A0:"
                    },
                    captions: {
                        balance: "Balance des transactions",
                        ecarts: "Écarts",
                        motif: "Justification"
                    },
                    especes: {
                        titre: ["Balance des transactions","en espèces"],
                        total_fdcaisse: "Total Fond de Caisse :",
                        total_especes: "Total Espèces :",
                        total_depenses: "Total Dépenses :",
                        total_rembourse: "Total Remboursé :",
                        total_montant: "Total Montant :"
                    },
                    motif: {
                        titre: "Choix d’un motif",
                        delete: "supprimer"
                    },
                    toutes: {
                        titre: ["Balance des transactions","Autres"],
                        total: "Total :",
                        total_recu: "Total reçu :"
                    },
                    saisie: {
                        titre: "Entrez vos montants comptés",
                        caption: "Montant compté :"
                    },
                    actions: {
                        validation: "Vérification",
                        outilcomptage: "Comptage espèces",
                        outilcomptagetr: "Comptage Tickets restau"
                    },
                    counttool: {
                        titre: "Comptage Caisse",
                        total: "Total :",
                        bouton: "Valider"
                    },
                    counttrtool: {
                        titre: "Comptage Tickets Restaurant",
                        id: "ID",
                        montant: "Montant",
                        total: "Total :",
                        bouton: "Valider",
                        erreur: {
                            yet: {
                                titre: 'Erreur Ticket restaurant',
                                texte: 'Ce ticket restaurant n’est pas valide'
                            },
                            deprecated: {
                                titre: 'Ticket restaurant périmé',
                                texte: 'Ce ticket restaurant n’est plus valable.'
                            }
                        }
                    }
                },
                print_x: "Imprime X Caisse",
                print_partiel: "Imprime X partiel",
                total_fdcaisse: "Total fond de caisse",
                total_caisse_theo: "Total montant",
                total_caisse_cmpt: "Total en caisse compté",
                fondcaisse_default: "Fond de caisse par défaut",
                prelevement: "Prélèvement espèces en clôture",
                fond_de_caisse: "Nouveau fond de caisse",
                cloture_z: "Clôture Z",
                cloture_partielle: "Clôture partielle Z",
                alerte: {
                    partielle: {
                        titre: "Clôture partielle",
                        texte: "Les commandes comptabilisées dans cette clôture partielle seront archivées et ne figureront pas dans les clôtures suivantes"
                    },
                    different: {
                        titre: "Comptage différent",
                        texte: "Votre comptage diffère du calcul théorique des recettes pour les valeurs marquées en rouge. Vous devez corriger pour pouvoir clôturer."
                    },
                    standby: {
                        titre: "Commandes non terminées",
                        texte: "Vous ne pouvez pas clôturer tant qu'il reste des commandes en attente ou non encaissées."
                    },
                    cmdnoncloturees: {
                        titre: "Commandes non clôturées",
                        texte: "Vous devez clôturer les commandes des jours précédents avant de commencer un nouveau service."
                    }
                }
            },
            tresor: {
                nom: 'Trésorerie',
                dates: {
                    start: "Mouvements du ",
                    end: " au "
                },
                liste: {
                    id: "Id",
                    date: "Date",
                    origine: "Origine",
                    destination: "Dest.",
                    debit: "Débit",
                    credit: "Crédit",
                    montant: "Solde",
                    type: "Type"
                },
                types: {
                    entree: "Entrée",
                    sortie: "Prélèvement",
                    ouverture: "Ouv. Caisse",
                    cloture: "Prélèv. Clôture"
                },
                actions: {
                    entree: "Entrée",
                    sortie: "Prélèvement",
                    ouverture: "Ouverture de caisse",
                    cloture: "Prélèvement en clôture",
                },
                popin: {
                    view: {
                        titre: "Mouvement",
                        origine: "Origine",
                        destination: "Destination",
                        debit: "Débit",
                        credit: "Crédit",
                        montant: "Nouveau montant"
                    },
                    entree: {
                        titre: "Nouvelle Entrée",
                        caisse: "Destination :",
                        external: "Origine :",
                        montant: "Crédit :"
                    },
                    sortie: {
                        titre: "Nouveau Prélèvement",
                        caisse: "Origine :",
                        external: "Destination :",
                        montant: "Débit :",
                    },
                    cloture: {
                        titre: "Prélèvement en clôture",
                        caisse: "Origine",
                        external: "Destination",
                        montant: "Débit :",
                    },
                    ouverture: {
                        titre: "Ouverture de caisse",
                        montant: "Montant en caisse",
                        caisse: "Destination :",
                        external: "Origine :",
                        precedent: "Fond de caisse après le dernier mouvement :",
                        none: "Aucune clôture enregistrée",
                        alerte: {
                            titre: "Écart de solde",
                            texte: "Vous vous apprêtez à enregistrer<br />UN FOND DE CAISSE DIFFÉRENT<br />sans saisir de motif.<br /><br />VOULEZ-VOUS ENREGISTRER MALGRÉ TOUT ?"
                        }
                    },
                    motif: "Motif :"
                }
            },
            listeclotures: {
                nom: "Liste Clotures",
                dates: {
                    start: "Liste des clôtures du ",
                    end: " au "
                },
                liste: {
                    id: "Id",
                    date: "Date",
                    debut: "Première cmd",
                    fin: "Dernière cmd",
                    ht: "Total HT",
                    ventes: "Ventes",
                    nombre: 'Nombre cmd',
                    actions: "Actions"
                },
                view: {
                    titre: "Ticket X"
                },
                actions: {
                    view: "Visualiser",
                    print: "Imprimer",
                    synthese: "Synthèse",
                    print_recap: "Imprimer Récap."
                }
            },
            stocks: { nom: "Stocks" },
            statistiques: { 
                nom: "Statistiques",
                pickers: {
                    du: "Statistiques du",
                    au: "au"
                },
                shortcut: {
                    jour: "Jour",
                    semaine: "Semaine",
                    mois: "Mois"
                },
                totaux: {
                    ca: "Chiffre d’affaire",
                    tickets: "Nbre de commandes",
                    moyen: "Panier moyen",
                    chrono: "Prise commande"
                },
                charts: {
                    canal: "Ventes par canal",
                    moyen: "Règlements",
                    mode: "Ventes",
                    vendeur: "CA par Employé"
                }
            },
            menu: { 
                nom: "Menu",
                catalogue: "Catalogue",
                produits: "Produits",
                ingredients: "Ingrédients",
                edit: {
                    ingredient: {
                        titre: 'Édition d’ingrédient',
                        nom: 'Nom :',
                        valeur: 'Supplement :',
                        couleur: 'Couleur :',
                        asproduct: 'Afficher comme un produit'
                    },
                    produit: {
                        titre: 'Édition de produit',
                        nom: 'Nom :',
                        valeur: 'Prix :',
                        couleur: 'Couleur :'
                    },
                    couleurs: {
                        blanc: '#ffffff',
                        bleuclair: '#5AC8FA',
                        bleufonce: '#0065E5',
                        gris: '#8F8E94',
                        jaune: '#FFE700',
                        jauneorange: '#FDC54F',
                        marron: '#7F592A',
                        noir: '#4A4A4A',
                        orange: '#FF9500',
                        rose: '#FF9DFF',
                        rouge: '#FF2D55',
                        vertclair: '#9CD04E',
                        vertfonce: '#628133',
                        violet: '#9867B6'
                    }
                }
            },
            clients: { 
                nom: "Clients",
                liste: {
                    code: 'Id',
                    nom: 'Nom',
                    prenom: 'Prénom',
                    tel1: 'Téléphone',
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
                    remarque: 'Remarque',
                    save_select: 'Enregistrer et Sélectionner',
                    unselect: 'Désélectionner',
                    rechercher: 'CLIENT',
                    input: 'Nom ou téléphone'
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
                                tva: 'No TVA',
                                restaurant_id: 'ID Restaurant'
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
                                message_ticket: 'Message fin de ticket',
                                logo_ticket: 'Imprimer un logo sur le ticket',
                                logo_ticket_caption: 'Sélectionnez une image PNG ou GIF en noir et blanc de 500px de large.',
                                logo_ticket_replace: 'Remplacer'
                            }
                        }
                    },
                    utilisateurs: { 
                        nom: 'Utilisateurs',
                        liste: {
                            titre: 'Liste des utilisateurs',
                            nom: 'Nom',
                            passe: 'Identifiant',
                            passe_placeholder: 'code à 6 chiffres',
                            droits: 'Droits',
                            droits_liste: {
                                clients: "Accès Clients",
                                stocks: "Accès Stocks",
                                statistiques: "Accès Statistiques",
                                parametres: "Accès Paramètres",
                                menu: "Accès Menu",
                                menu_prix: "Menu Modif Prix",
                                cloture: "Accès Clôture",
                                tresor: "Mouvements Trésorerie",
                                marketing: "Accès Marketing",
                                depenses: "Accès Dépenses",
                                employes: "Accès Employés",
                                remise: "Remise",
                                cartes: "Encaissement CB",
                                listecommandes: "Accès Liste Commandes",
                                encaissement: "Accès Encaissement",

                            }
                        },
                        edition: {
                            ajouter: 'Ajouter un utilisateur',
                            editer: 'Édition de l’utilisateur',
                            first: 'L’utilisateur doit changer de mot de passe à la prochaine connexion',
                            status: 'Actif',
                            livreur: 'Livreur',
                            coordonnees: 'Coordonnées',
                            taux_horaire: 'Taux horaire',
                            droits: {
                                clients: "Accès Clients",
                                stocks: "Accès Stocks",
                                statistiques: "Accès Statistiques",
                                parametres: "Accès Paramètres",
                                menu: "Accès Menu",
                                menu_prix: "Menu Modif Prix",
                                cloture: "Accès Clôture",
                                tresor: "Mouvements Tréso.",
                                marketing: "Accès Marketing",
                                depenses: "Accès Dépenses",
                                employes: "Accès Employés",
                                remise: "Remise"
                            },
                            suppression: {
                                bouton: 'Supprimer l’Utilisateur',
                                confirm: {
                                    titre: 'Confirmation de suppression',
                                    texte: '%NOM% sera supprimé de la liste et il ne pourra plus se connecter à la caisse'
                                }
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
                            titre: 'Vente à la commande',
                            caption: 'Permet de vendre avec un encaissement ultérieur'
                        },
                        happyhours: {
                            titre: 'Happy Hours',
                            debut: 'Heure début',
                            fin: 'Heure fin',
                            remise: 'Remise'
                        },
                        fonddecaisse: {
                            titre: 'Fonds de caisse',
                            activation: 'Actif',
                            montant: 'Montant',
                            par_vendeur: 'Par vendeur',
                            par_caisse: 'Par caisse'
                        },
                        fidelite: {
                            titre: 'Fidélité',
                            activation: 'Activer la fidélité',
                            valeur: '1 point = ',
                            seuil: 'Débloquer à partir de;points'
                        }
                    },
                    peripheriques: { 
                        nom: 'Périphériques',
                        impression: {
                            titre: 'Impression',
                            imprimantes: {
                                titre: 'Imprimantes',
                                liste: {
                                    id: 'Id',
                                    nom: 'Nom',
                                    type: 'Connexion',
                                    parametre: 'Paramètre'
                                },
                                edition: {
                                    new: 'Nouvelle Imprimante',
                                    edit: 'Édition de l’Imprimante',
                                    nom: 'Nom',
                                    connexion: 'Connexion',
                                    connexion_liste: {
                                        usb: 'USB',
                                        network: 'Réseau',
                                        serial: 'Série'/*,
                                        bluetooth: 'Bluetooth'*/
                                    },
                                    parametre: 'Paramètre',
                                    encodage: 'Encodage',
                                    encodage_liste: {
                                        Cp850: 'CP850',
                                        'ISO-8859-1': 'ISO-8859-1'
                                    },
                                    default: 'Imprimante par défaut',
                                    fallback: 'Remplaçante',
                                    no_fallback: 'Aucune'
                                }
                            },
                            tickets: {
                                titre: 'Tickets',
                                liste: {
                                    id: 'Id',
                                    nom: 'Nom',
                                    type: 'Template',
                                    parametre: 'Imprimé par',
                                    kds: 'KitchenDisplay'
                                },
                                edition: {
                                    new: 'Nouveau ticket',
                                    edit: 'Édition du ticket',
                                    nom: 'Nom',
                                    template: 'Template',
                                    template_liste: {
                                        //  commande: 'Commande',
                                        principal: 'Principal',
                                        partiel: 'Partiel',
                                        etiquette: 'Etiquette'//,
                                        //  cloture_x: 'X de caisse',
                                        //  cloture_z: 'Ticket de clôture'
                                    },
                                    imprimantes: 'Imprimé par...',
                                    kds: 'KitchenDisplay',
                                    kds_active: 'Activé'
                                }
                            }
                        },
                        paiement: {
                            titre: 'Paiement'
                        },
                        affichage: {
                            titre: 'Affichage'
                        }
                    },
                    commandes: { 
                        nom: 'Commandes',
                        general: {
                            titre: 'Général',
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
                                    max: 'Valeur max.',
                                    compteur: 'Compteur',
                                    reset: 'Reset',
                                    hexa: 'Activer N° hexadécimal'
                                }
                            },
                            bippers: {
                                nom: 'Bippers',
                                label: {
                                    activation: 'Activation'
                                }
                            }
                        },
                        commentaires: {
                            titre: 'Commentaires',
                            popin: {
                                new: 'Nouveau commentaire',
                                edit: 'Éditer le commentaire'
                            },
                            suppression: {
                                titre: 'Supprimer le commentaire',
                                texte: 'Voulez-vous supprimer ce commentaire ?'
                            }
                        },
                        discount: {
                            titre: 'Réductions',
                            popin: {
                                new: 'Nouvelle réduction',
                                edit: 'Éditer la réduction'
                            },
                            suppression: {
                                titre: 'Supprimer la réduction',
                                texte: 'Voulez-vous supprimer cette réduction ?'
                            }
                        },
                        canaux: {
                            titre: 'Canaux',
                            uber: {
                                titre: 'UberEats',
                                store_id: 'Identifiant (UUID) :',
                                pos_integration_enabled: 'POS activé',
                                restaurant_online: 'Restaurant online',
                                auto_accept_order: 'Acceptation auto. des commandes',
                                alerte: {
                                    enable_noid: {
                                        titre: 'Activation impossible',
                                        texte: 'Vous ne pouvez pas activer le point de vente sans UUID'
                                    },
                                    noid_enable: {
                                        titre: 'UUID invalide',
                                        texte: 'Vous ne pouvez pas activer le point de vente sans UUID',
                                        force: 'Effacer et désactiver'
                                    },
                                }
                            }
                        }
                    },
                    tables: {
                        nom: 'Gestion Tables',
                        activation: 'Activation',
                        salles: {
                            liste: {
                                titre: 'Salles',
                                nom: 'Nom',
                                ajouter: 'Ajouter une salle'
                            },
                            edition: {
                                new: 'Nouvelle salle',
                                edit: 'Édition de la salle',
                                nom: 'Nom',
                                couleur: 'Couleur',
                                couleurs: {
                                    blanc: '#ffffff',
                                    bleuclair: '#5AC8FA',
                                    bleufonce: '#0065E5',
                                    gris: '#8F8E94',
                                    jaune: '#FFE700',
                                    jauneorange: '#FDC54F',
                                    marron: '#7F592A',
                                    noir: '#4A4A4A',
                                    orange: '#FF9500',
                                    rose: '#FF9DFF',
                                    rouge: '#FF2D55',
                                    vertclair: '#9CD04E',
                                    vertfonce: '#628133',
                                    violet: '#9867B6'
                                }
                            },
                            suppression: {
                                alerte: {
                                    titre: 'Supprimer une salle',
                                    texte: 'Vous allez supprimer une salle. Cette opération est irréversible.'
                                },
                                erreur: {
                                    titre: 'Erreur de suppression',
                                    texte: 'Pour pouvoir être supprimée, une salle ne doit contenir aucune table.'
                                }
                            }
                        },
                        tables: {
                            liste: {
                                titre: 'Tables',
                                nom: 'Nom',
                                ajouter: 'Ajouter une table'
                            },
                            edition: {
                                new: 'Nouvelle table',
                                edit: 'Édition de la table',
                                nom: 'Nom'
                            },
                            suppression: {
                                alerte: {
                                    titre: 'Supprimer une table',
                                    texte: 'Vous allez supprimer une table. Cette opération est irréversible.'
                                },
                                erreur: {
                                    titre: 'Erreur de suppression',
                                    texte: 'Pour pouvoir être supprimée, une table ne doit pas être occupée.'
                                }
                            }
                        }
                    },
                    options: { nom: 'Options' },
                }
            }
        },
        notification: {
            accept: {
                uber: {
                    titre: "Nouvelle commande UBER EATS",
                    texte: "Acceptez-vous cette nouvelle commande ?",
                    detail: "Commande #%NUMERO% pour le %DATEHEURE%"
                }
            }
        },
        tickets: {
            commande: {
                titre: 'COMMANDE',
                numero: 'Cmd no ',
                bipper: 'BIPPER #',
                detail: {
                    quantite: 'QTE',
                    articles: 'ARTICLES',
                    prix_unitaire: 'P.U.',
                    total: 'TOTAL',
                    code_tva: 'T',
                    sous_total: 'SOUS-TOTAL',
                    total_ttc: 'TOTAL TTC',
                    nbr_lignes: 'Nombre de lignes :',
                },
                modificateur: {
                    charge: 'CHARGE',
                    discount_panier: 'REDUCTION PANIER',
                    discount_item: 'Reduction article',
                    monnaie: 'EUR'
                },
                tva: {
                    code: 'CODE',
                    taux: 'TAUX',
                    tva: 'TVA',
                    ht: 'H.T.',
                    ttc: 'TTC'
                },
                reglements: {
                    titre: 'REGLEMENT :',
                    monnaie: 'EUR',
                    a_regler: 'A REGLER :'
                },
                rendu: {
                    titre: 'RENDU :',
                    monnaie: 'EUR'
                },
                mode: {
                    livraison: 'LIVRAISON',
                    surplace: 'SUR PLACE',
                    emporter: 'A EMPORTER'
                },
                client: {
                    titre: 'Client :',
                    tel: 'Tel :',
                    batiment: 'Bat. ',
                    etage: 'Etage ',
                    email: 'Email :',
                    commentaire: 'Cmt. :'
                }
            },
            uber: {
                titre: 'Commande UberEats',
                texte: 'LIVRAISON a ',
                client: 'Client :',
                couverts: 'AVEC COUVERTS, PAILLE...'
            },
            production: {
                titre: 'CUISINE',
                numero: 'Cmd no ',
                creation: 'Creee le ',
                bipper: 'BIPPER #',
                mode: {
                    livraison: 'LIVRAISON',
                    surplace: 'SUR PLACE',
                    emporter: 'A EMPORTER'
                },
                caption: {
                    quantite: 'QTE',
                    articles: 'ARTICLES',
                    num_articles: 'NOMBRE D\'ARTICLES : '
                },
                client: {
                    titre: 'Client :'
                }
            }
        }
    }
}
export { data };