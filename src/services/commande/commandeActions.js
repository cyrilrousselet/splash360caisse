import { differenceInMilliseconds, formatISO, parseISO, format } from "date-fns";
// import Logger from "../../helpers/Logger";
import logger from "../../helpers/Logger";
import { clotureActions } from "../cloture/clotureActions";
import { notificationActions } from "../notification/notificationActions";
import { peripheralActions } from "../peripheral/peripheralActions";
import { commandeActionTypes } from "./commandeActionTypes";
import { commandeServices } from "./commandeServices";
import { numeroActions } from "./numeroActions";
import { numeroActionTypes } from "./numeroActionTypes";
import frLocale from "date-fns/locale/fr";
import { dateBounds, asyncForEach } from "../../helpers/toolbox";
import { clientsServices } from "../clients/clientsServices";
import LodashId from "lodash-id";
import { clientsActionTypes } from "../clients/clientsActionTypes";
import { add } from 'date-fns';
import { signatureActions } from "../signature/signatureActions";
import { signatureServices } from "../signature/signatureServices";
// import { clotureServices } from "../cloture/clotureServices";
import { numeroServices } from "./numeroServices";
import { notificationServices } from "../notification/notificationServices";
import { journalActions } from "../journal/journalActions";
import packageJson from '../../../package.json';
import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
// import { createObjectCsvWriter } from "csv-writer";
const strings = new LocalizedStrings(data);

// const logger = new Logger();

function getCommandesList(params = {}) {
  logger.info("CmdA.getCommandesList()");

  return (dispatch) => {
    dispatch({ type: commandeActionTypes.GET_COMMANDESLIST_REQUEST, params:params });

    // logger.time('getCommandesList');
    commandeServices
      .getCommandesList(params)
      .then((data) => {
        // logger.timeEnd('getCommandesList');
        dispatch({
          type: commandeActionTypes.GET_COMMANDESLIST_SUCCESS,
          ...data,
        });
        dispatch(clotureActions.getTodayCa());
      })
      .catch((error) => {
        // logger.timeEnd('getCommandesList');
        logger.error(error);
        dispatch({
          type: commandeActionTypes.GET_COMMANDESLIST_FAILURE,
          error: error.toString(),
        });
      });
  };
}

function getTodayCommandesList() {
  return (dispatch, getState) => {
    logger.info("CmdA.getTodayCommandesList()");
    const { heure_fin } = getState().parametresReducer.parametres.entreprise;

    // *** définition de la fin de la période précédente
    const __periode_bounds = dateBounds(new Date(), heure_fin);
    const lastperiode_end = __periode_bounds.debut;

    dispatch(getCommandesList({createdAt: { $gt: lastperiode_end } }));

  }
}

function getAllTicketsRestaurant() {
  return (dispatch) => {
    dispatch({ type: commandeActionTypes.GETALL_TICKETSRESTAU_REQUEST });
    commandeServices.getAllTicketsRestaurant().then(
      (data) =>
        dispatch({
          type: commandeActionTypes.GETALL_TICKETSRESTAU_SUCCESS,
          ...data,
        }),
      (error) =>
        dispatch({
          type: commandeActionTypes.GET_TICKETRESTAU_FAILURE,
          error: error,
        })
    );
  };
}

function persistTicketsRestaurants(liste) {
  return (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.PERSIST_TICKETRESTAU_REQUEST });


    const { caisse } = getState().parametresReducer.parametres.options;

    commandeServices.persistTicketsRestaurants(liste, caisse.uniqid).then(
      (data) => {
        logger.info('tr persisted', data)
        dispatch({ type: commandeActionTypes.PERSIST_TICKETRESTAU_SUCCESS, ticketsrestau: data });
      //  dispatch(getAllTicketsRestaurant());
        dispatch(notificationActions.syncDispatch("ticketrestaurant", data));
      },
      (error) =>
        dispatch({
          type: commandeActionTypes.PERSIST_TICKETRESTAU_FAILURE,
          error: error,
        })
    );
  };
}

/**
 * Recupere la commande à partir de son ID
 * ou crée une nouvelle commande si aucun ID n'est passé en paramètre
 * @param {*} commandeId
 */
function getCommande(commandeId = null) {
  return (dispatch, getState) => {
    dispatch({
      type: commandeActionTypes.GET_COMMANDE_REQUEST,
      id: commandeId,
    });

    logger.info("CmdA.getCommande()", commandeId);
    // sans id de commande, on crée une nouvelle commande
    if (null === commandeId) {

      // logger.time('getCommande (new)');
      logger.info("on demande une nouvelle commande");
      const state = getState();
      const { user } = state.authentication;
      const { caisse } = state.parametresReducer.parametres.options;
      const commande = commandeServices.getNewCommande({
        operator: {nom: user.nom, id: user.user_id},
        caisse: caisse
      });
      // logger.timeEnd('getCommande (new)');
      dispatch({ type: commandeActionTypes.GET_COMMANDE_SUCCESS, commande });
      //    dispatch(getNumero());
    }
    // avec id de commande, on va chercher la commande en base
    else {
      logger.info("on va chercher la commande #" + commandeId);

      // logger.time('getCommande ('+commandeId+')');
      commandeServices.getCommandeById(commandeId).then(
        (response) => {

          // logger.timeEnd('getCommande ('+commandeId+')');
          const commande = response._cmd;
          dispatch({
            type: commandeActionTypes.GET_COMMANDE_SUCCESS,
            commande,
          });
        },
        (error) => {
          // logger.timeEnd('getCommande ('+commandeId+')');
          dispatch({
            type: commandeActionTypes.GET_COMMANDE_FAILURE,
            error: error.toString(),
          })
        }
      );
    }
  };
}

function setChrono(payload) {
  return async (dispatch, getState) => {
    const { ticketId, endTime, careTime } = payload.commande;

    logger.info("setChrono", payload);

    const cmd = await commandeServices.getCommandeById(ticketId);

    if (cmd) {
      const commande = cmd._cmd;

      const endDatetime = new Date(endTime);
      const careDatetime = careTime ? new Date(careTime) : endDatetime;

      // si la commande a déjà été synchronisée avec le Backend
      let cmdToSync = {};
      if (commande.hasOwnProperty("sync") && commande.sync!==null) {
        cmdToSync = {
          id: commande.id,
          ticketId: commande.ticketId,
          careTime: formatISO(careDatetime),
          endTime: formatISO(endDatetime),
          productionTime:
            Math.round(
              differenceInMilliseconds(endDatetime, careDatetime) / 10
            ) / 100,
          waitTime:
            Math.round(
              differenceInMilliseconds(careDatetime, parseISO(commande.end)) /
                10
            ) / 100,
          status: commande.status,
          createdAt: formatISO(commande.createdAt),
          updatedAt: formatISO(new Date()),
        };
      }
      // sinon,
      else {
        cmdToSync = {
          ...commande,
          careTime: formatISO(careDatetime),
          endTime: formatISO(endDatetime),
          productionTime:
            Math.round(
              differenceInMilliseconds(endDatetime, careDatetime) / 10
            ) / 100,
          waitTime:
            Math.round(
              differenceInMilliseconds(careDatetime, parseISO(commande.end)) /
                10
            ) / 100,
          createdAt: formatISO(commande.createdAt),
          updatedAt: formatISO(new Date()),
        };
      }

      if (cmdToSync.status==='confirmed') {
        dispatch(notificationActions.syncCommandes([cmdToSync]));
      }
    }
  };
}

// payload = commande à sauvegarder
function confirmCommande(_payload, printTemplates) {
  return (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.VALIDATE_COMMANDE_REQUEST });

    const catalogueReducer = getState().catalogueReducer;
    const { caisse, role } = getState().parametresReducer.parametres.options;
    const { user } = getState().authentication;
    const { commande } = getState().commandeReducer;
    const { ticket, note } = getState().numerotationReducer;
    const { privateKey, trousseauId } = getState().signatureReducer;
    const { entreprise } = getState().parametresReducer.parametres;


    let payload = {...commande};
    logger.info('confirmCommande commande', commande);

    if (payload.numero == null) {
      payload.numero = getState().commandeReducer.commande.numero;
    }

    payload.operator_encaissement = { id: user.user_id, nom: user.nom };
    payload.caisse_encaissement = caisse;

    payload.enproduction = payload.scheduled ? false : true;


    const payloadcopy = { ...payload, localsync: [caisse.uniqid] };
    dispatch(getCommande());



    commandeServices.saveCommande(payloadcopy, catalogueReducer).then(
      async (confirm) => {

        dispatch({
          type: commandeActionTypes.VALIDATE_COMMANDE_SUCCESS,
          commande: {},
        });
        // met à jour la liste des schedules (ajoute ou supprime la commande)
        dispatch({
          type: (payloadcopy.scheduled) ? commandeActionTypes.SET_SCHEDULE : commandeActionTypes.DELETE_SCHEDULE,
          schedule: payloadcopy.ticketId
        });

        
        if (!confirm.signaturenote && !confirm.note) {  
          const lastSignatureNote = await signatureServices.getLastSignature('notes');
          const newNote = 'N'+format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + note.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false});
          const signatureNote = signatureServices.createTicketSignature({...confirm, ticket: newNote}, privateKey, lastSignatureNote);
        
          confirm = {
            ...confirm,
            note: newNote,
            hashsourcenote: signatureNote.source, 
            hashnote: signatureNote.hash,
            signaturenote: signatureNote.signature,
          }


          const __noteData = _createNote(confirm, {
            newNote,
            entreprise,
            user,
            vendeur: user,
            caisse,
            signature: signatureNote.signature,
            trousseauId,
            hash: signatureNote.hash,
            source: signatureNote.source
          });

          // si la note est offerte
          if (__noteData['ENC-TIK-REM-MTN']>0 && __noteData['ENC-TIK-TOT-TTC']===0) {
            // on loggue dans le JET
            dispatch(journalActions.log('327', `Note #${ newNote } offerte (${ Number(__noteData['ENC-TIK-REM-MTN'] / 100).toFixed(2) } €)`));
          }
          else {
            // son loggue dans le JET les articles offerts
            const __articlesofferts = __noteData['LIGNES'].filter(art => art['ENC-TIK-LIG-REM-TXX']===100 );
            __articlesofferts.forEach(art => {
              dispatch(journalActions.log('328', `Article #${ art['ENC-TIK-ORI-NUM'] } offert (${ Number(art['ENC-TIK-LIG-REM-TOT'] / 100).toFixed(2) } €) : Note #${ newNote }`));
            });
          }

          await commandeServices.persistNote(__noteData);
          dispatch(journalActions.log('160','Note #'+newNote));

          dispatch( signatureActions.updateSignature('notes', signatureNote.signature) );
          dispatch( signatureActions.updateNumerotation('note', note+1) );

        }
          
        if (!confirm.signature && !confirm.ticket) {
          const lastSignatureTicket = await signatureServices.getLastSignature('tickets');
          const newTicket = 'T'+format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + ticket.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false});
          const signatureTicket = signatureServices.createTicketSignature({...confirm, ticket: newTicket}, privateKey, lastSignatureTicket);
        
          confirm = {
            ...confirm,
            ticket: newTicket,
            hashsource: signatureTicket.source,
            hash: signatureTicket.hash,
            signature: signatureTicket.signature
          }


          const __ticketData = _createTicket(confirm, {
            newTicket,
            entreprise,
            user,
            vendeur: user,
            caisse,
            signature: signatureTicket.signature,
            trousseauId,
            hash: signatureTicket.hash,
            source: signatureTicket.source,
            operation: 'VENTE'
          });

          await commandeServices.persistTicket(__ticketData);
          dispatch(journalActions.log('160','Ticket #'+newTicket));

          dispatch(clotureActions.createGrandTotalTicket(confirm));

          dispatch( signatureActions.updateSignature('tickets', signatureTicket.signature) );
          dispatch( signatureActions.updateNumerotation('ticket', ticket+1) );

        } 

        commandeServices.persistCommande(confirm);


        console.log('🖨 commande', confirm);
        
        dispatch(peripheralActions.printCommandeTicket(printTemplates, confirm));

      

        dispatch(notificationActions.syncDispatch("commande", confirm));

        dispatch(clotureActions.getTodayCa());

        const cmdtosync = {
          ...confirm,
          chrono: confirm.chrono || 0,
          createdAt: formatISO(confirm.createdAt),
          updatedAt: formatISO(confirm.updatedAt),
        };


        // si la caisse est une primary, elle s'occupe de la synchro avec le BO
        if (role==="primary") {

          commandeServices.getCommandesToSync(10).then((results) => {

            const { commandes, chronos } = results;

            // si la nouvelle commande (confirm) est déjà en BDD, on le l'ajoute pas
            const prevcommandes = commandes.filter((c) => (confirm.ticketId!==c.ticketId) );

            const chrcommandes = prevcommandes.map((c) => {
              const chr = chronos
                ? chronos.find((h) => h.ticketId === c.ticketId)
                : undefined;
              if (chr !== undefined) {

                return {
                  ...c,
                  chrono: c.chrono || 0,
                  createdAt: formatISO(c.createdAt),
                  updatedAt: formatISO(c.updatedAt),
                  endTime: formatISO(chr.endTime),
                  careTime: chr.careTime.hasOwnProperty('firstCare') ? formatISO(chr.careTime.firstCare) : null,
                  productionTime: chr.careTime.hasOwnProperty('firstCare') ? 
                    (Math.round(
                      differenceInMilliseconds(
                        chr.endTime,
                        chr.careTime.firstCare
                      ) / 10
                    ) / 100) : null,
                  waitTime: chr.careTime.hasOwnProperty('firstCare') ?
                    (Math.round(
                      differenceInMilliseconds(
                        chr.careTime.firstCare,
                        parseISO(c.end)
                      ) / 10
                    ) / 100) : null,
                };
                
              } else {
                return {
                  ...c,
                  chrono: c.chrono || 0,
                  createdAt: formatISO(c.createdAt),
                  updatedAt: formatISO(c.updatedAt),
                };
              }
            });

            dispatch(
              notificationActions.syncCommandes([...chrcommandes, cmdtosync])
            );
          });
        }

        // s'il y a un numéro de commande, c'est qu'on encaisse une commande déjà réglée
        // donc on met à jour la liste des commande
        if (payload.createdAt) dispatch(getTodayCommandesList());
      },
      (error) => {
        logger.info(error);
        dispatch({
          type: commandeActionTypes.VALIDATE_COMMANDE_FAILURE,
          error: error,
        });
      }
    );
  };
}


function _createTicket(confirm, params) {

  const {
    newTicket,
    entreprise,
    user,
    vendeur,
    caisse,
    signature,
    trousseauId,
    hash,
    source,
    operation
  } = params;

  const __ticketData = {
    'ENC-TIK-NUM': newTicket,
    'ENC-TIK-CDE': confirm.ticketId,
    'ENC-TIK-TAG-VER': packageJson.version,
    'ENC-TIK-PRN-NBR': 1,
    'ENC-TIK-SOC-ETS': entreprise.denomination,
    'ENC-TIK-SOC-ID': entreprise.enseigne,
    'ENC-TIK-SOC-ADR': entreprise.adresse,
    'ENC-TIK-SOC-CCP': entreprise.code_postal,
    'ENC-TIK-SOC-VIL': entreprise.ville,
    'ENC-TIK-SOC-PAY': entreprise.pays,
    'ENC-TIK-SOC-SIR': entreprise.siret,
    'ENC-TIK-SOC-NAF': entreprise.ape,
    'ENC-TIK-SOC-TVA': entreprise.tva,
    'ENC-TIK-VEN-NID': vendeur.user_id,
    'ENC-TIK-VEN-NOM': vendeur.nom,
    'ENC-TIK-OPS-NID': user.user_id,
    'ENC-TIK-OPS-NOM': user.nom,
    'ENC-TIK-CAI-NID': caisse.uniqid,
    'ENC-TIK-HOR-GDH': format(confirm.createdAt,'yyyyMMddHHmmss'),
    'ENC-OPE-TYP': operation,
    'ENC-TIK-DOC-TYP': 'TICKET',
    'ENC-TIK-LIG-NBR': 1,
    'ENC-TIK-TAG-SIG': signature,
    'ENC-TIK-ID-KEY': trousseauId,
    'ENC-TIK-TAG-RET': signature.substring(2,3) + signature.substring(6,7) + signature.substring(12,13) + signature.substring(18,19),
    'ENC-TIK-HASH': hash,
    'ENC-TIK-ARG': source,
    'ENC-TIK-LOG': 'SPLASH360',
    'LIGNES':[],
    'TVA': [],
    'REGLEMENTS': [],
    'ENC-TIK-TOT-MHT': 0,
    'ENC-TIK-TOT-TTC': 0,
    'FAC-TOT-TVA': 0,
    'ENC-TIK-REM-MTN': 0
  };

  // lignes tickets :
  confirm.items.forEach((itm,i) => {

    // extraction des données sur le modificateur
    /* -------------------------- REGLE ---------------------------- */
    /* |  • les remises en numéraire sont appliquées sur le TTC    | */
    /* |  • les remises en pourcentage sont appliquées sur le HT   | */
    /* ------------------------------------------------------------- */
    // const __prdmod = confirm.modificateurs.find(m => m.item === itm.itemid && m.ingredient===null);
    
    // // taux du modificateur
    // let __modtx = null;
    // // valeur du modificateur
    // let __modval = null;
    // let __itmht = Math.round(itm.puht * 100) * itm.quantite;
    // let __itmttc = (Math.round(itm.pu * 100) * itm.quantite);
    // let __itmmodtotal = 0;


    // if (__prdmod) {
    //   // ispc :bool (is percent)
    //   const ispc = String(__prdmod.valeur).substr(-1,1)==='%';
    //   const val = Math.abs(Number(String(__prdmod.valeur).slice(0,-1)));
    //   __modval = ispc ? Math.round(itm.prix * 100) * (val/100) : Math.round(val * 100);

    //   // conversion du modificateur en coefficient
    //   __modtx = (ispc) 
    //   ? (
    //     __prdmod.operation > 0 
    //     ? (100 + val) / 100
    //     : (100 - val) / 100
    //     ) 
    //   : (
    //     __prdmod.operation > 0 
    //     ? 1 + (val/itm.prix)
    //     : 1 - (val/itm.prix)
    //     )
    //   ;

    //   // si le modificateur est en pourcentage : application de la remise sur le HT
    //   // et calcul des valeurs
    //   if (ispc) {
    //     let prvttc = __itmttc;
    //     __itmht = __itmht * __modtx;
    //     __itmttc = __itmht * (1 + itm.tva.valeur);
    //     __itmmodtotal = prvttc - __itmttc;
    //   }
    //   // si me modificateur est en numéraire : application de la remise sur le TTC
    //   // et calcul des valeurs
    //   else {
    //     let prvttc = __itmttc;
    //     __itmttc = __itmht - __modval;
    //     __itmht = __itmttc / (1 + itm.tva.valeur);
    //     __itmmodtotal = prvttc - __itmttc;
    //   }
      
    // }

    __ticketData['LIGNES'].push({
      'ENC-NID': newTicket,
      'ENC-TIK-ORI-NUM': itm.itemid,
      'ENC-TIK-LIG-NUM': __ticketData['ENC-TIK-LIG-NBR'],
      'ENC-TIK-LIG-PRO-NID': itm.produitid,
      'ENC-TIK-LIG-PRO-LIB': itm.nom,
      'ENC-TIK-LIG-PRO-QTE': itm.quantite,
      'ENC-TIK-LIG-TAX-NID': itm.tva.code,
      'ENC-TIK-LIG-TAX-TXX': Number(itm.tva.valeur) * 100,
      'ENC-TIK-LIG-PRO-MTH': Math.round(itm.puht * 100),
      'ENC-TIK-LIG-PRO-TTC': Math.round(itm.pu * 100),
      'ENC-TIK-LIG-REM-TXX': itm.rem_txx,
      'ENC-TIK-LIG-REM-TOT': itm.rem_tot,
      'ENC-TIK-LIG-TOT-MHT': itm.tot_mht,
      'ENC-TIK-LIG-TOT-TTC': itm.tot_ttc,
      'ENC-TIK-LIG-OPE-TYP': 'VENTE',
      'ENC-TIK-LIG-CAI-NID': caisse.uniqid,
      'ENC-TIK-LIG-VEN-NID': user.user_id,
      'ENC-TIK-LIG-OPS-NID': user.user_id,
      'ENC-TIK-LIG-HOR-GDH': format(confirm.createdAt,'yyyyMMddHHmmss')
    });

    // incrémentation du numéro de ligne
    __ticketData['ENC-TIK-LIG-NBR'] += 1;

    // total des montants de remises (modificateurs)
    __ticketData['ENC-TIK-REM-MTN'] += itm.rem_tot;

    itm.ingredients.forEach((ing, ingidx) => {

      __ticketData['LIGNES'].push({
        'ENC-NID': newTicket,
        'ENC-TIK-ORI-NUM': itm.itemid+'-'+ingidx,
        'ENC-TIK-LIG-NUM': __ticketData['ENC-TIK-LIG-NBR'],
        'ENC-TIK-LIG-PRO-NID': ing.ingredient,
        'ENC-TIK-LIG-PRO-LIB': ing.nom,
        'ENC-TIK-LIG-PRO-QTE': ing.qte,
        'ENC-TIK-LIG-TAX-NID': ing.tva.code,
        'ENC-TIK-LIG-TAX-TXX': Number(ing.tva.valeur) * 100,
        'ENC-TIK-LIG-PRO-MTH': Math.round(ing.supplementht * 100),
        'ENC-TIK-LIG-PRO-TTC': Math.round(ing.supplement * 100),
        'ENC-TIK-LIG-REM-TXX': ing.rem_txx,
        'ENC-TIK-LIG-REM-TOT': ing.rem_tot,
        'ENC-TIK-LIG-TOT-MHT': ing.tot_mht,
        'ENC-TIK-LIG-TOT-TTC': ing.tot_ttc,
        'ENC-TIK-LIG-OPE-TYP': 'VENTE',
        'ENC-TIK-LIG-CAI-NID': caisse.uniqid,
        'ENC-TIK-LIG-VEN-NID': user.user_id,
        'ENC-TIK-LIG-OPS-NID': user.user_id,
        'ENC-TIK-LIG-HOR-GDH': format(confirm.createdAt,'yyyyMMddHHmmss')
      });

      // incrémentation du numéro de ligne
      __ticketData['ENC-TIK-LIG-NBR'] += 1;

    // total des montants de remises (modificateurs)
    __ticketData['ENC-TIK-REM-MTN'] += ing.rem_tot;
    });
  });

  // tva ticket
  Object.values(confirm.ventilation).forEach(tva =>{

    __ticketData['TVA'].push({
      'ENC-NID': newTicket,
      'ENC-TIK-TOT-MHT': tva.ht,
      'ENC-TIK-TVA-NID': tva.code,
      'ENC-TIK-TVA-TXX': Number(tva.taux) * 100,
      'ENC-TIK-TVA-MTN': tva.tva,
    });
    __ticketData['ENC-TIK-TOT-MHT'] += tva.ht;
    __ticketData['ENC-TIK-TOT-TTC'] += tva.ttc;
    __ticketData['FAC-TOT-TVA'] += tva.tva;
  });


  // reglements ticket
  confirm.reglements.forEach(r => {
    __ticketData['REGLEMENTS'].push({
      'ENC-NID': newTicket,
      'ENC-TIK-ORI-NUM': r.reglementId,
      'ENC-TIK-REG-TYP': r.moyen,
      'ENC-TIK-REG-MOD-LIB': strings.modules.encaissement.reglement.moyens[r.moyen],
      'ENC-TIK-REG-MTN': Math.round(r.valeur * 100),
      'ENC-TIK-REG-NUM': r.info || '',
      'ENC-TIK-REG-USR-NID': confirm.operator_encaissement.id,
      'ENC-TIK-REG-HOR-GDH': format(confirm.createdAt,'yyyyMMddHHmmss')
    });
  });

  return __ticketData;
}



function _createNote(confirm, params) {

  const {
    newNote,
    entreprise,
    user,
    vendeur,
    caisse,
    signature,
    trousseauId,
    hash,
    source,
  } = params;

  const __noteData = {
    'ENC-TIK-NUM': newNote,
    'commandeId': confirm.ticketId,
    'ENC-TIK-TAG-VER': packageJson.version,
    'ENC-TIK-PRN-NBR': 0,
    'ENC-TIK-SOC-ETS': entreprise.denomination,
    'ENC-TIK-SOC-ID': entreprise.enseigne,
    'ENC-TIK-SOC-ADR': entreprise.adresse,
    'ENC-TIK-SOC-CCP': entreprise.code_postal,
    'ENC-TIK-SOC-VIL': entreprise.ville,
    'ENC-TIK-SOC-PAY': entreprise.pays,
    'ENC-TIK-SOC-SIR': entreprise.siret,
    'ENC-TIK-SOC-NAF': entreprise.ape,
    'ENC-TIK-SOC-TVA': entreprise.tva,
    'ENC-TIK-VEN-NID': vendeur.user_id,
    'ENC-TIK-VEN-NOM': vendeur.nom,
    'ENC-TIK-OPS-NID': user.user_id,
    'ENC-TIK-OPS-NOM': user.nom,
    'ENC-TIK-CAI-NID': caisse.uniqid,
    'ENC-TIK-HOR-GDH': format(confirm.createdAt,'yyyyMMddHHmmss'),
    'ENC-OPE-TYP': 'VENTE',
    'ENC-TIK-DOC-TYP': 'NOTE',
    'ENC-TIK-LIG-NBR': 1,
    'ENC-TIK-TAG-SIG': signature,
    'ENC-TIK-ID-KEY': trousseauId,
    'ENC-TIK-TAG-RET': signature.substring(2,3) + signature.substring(6,7) + signature.substring(12,13) + signature.substring(18,19),
    'ENC-TIK-HASH': hash,
    'ENC-TIK-ARG': source,
    'ENC-TIK-LOG': 'SPLASH360',
    'LIGNES':[],
    'ENC-TIK-TOT-MHT': 0,
    'ENC-TIK-TOT-TTC': 0,
    'FAC-TOT-TVA': 0,
    'ENC-TIK-REM-MTN': 0
  };

  // lignes tickets :
  confirm.items.forEach((itm,i) => {

    // // extraction des données sur le modificateur
    // /* -------------------------- REGLE ---------------------------- */
    // /* |  • les remises en numéraire sont appliquées sur le TTC    | */
    // /* |  • les remises en pourcentage sont appliquées sur le HT   | */
    // /* ------------------------------------------------------------- */
    // const __prdmod = confirm.modificateurs.find(m => m.item === itm.itemid && m.ingredient===null);
    
    // // taux du modificateur
    // let __modtx = null;
    // // valeur du modificateur
    // let __modval = null;
    // let __itmht = Math.round(itm.puht * 100) * itm.quantite;
    // let __itmttc = (Math.round(itm.pu * 100) * itm.quantite);
    // let __itmmodtotal = 0;


    // if (__prdmod) {
    //   // ispc :bool (is percent)
    //   const ispc = String(__prdmod.valeur).substr(-1,1)==='%';
    //   const val = Math.abs(Number(String(__prdmod.valeur).slice(0,-1)));
    //   __modval = ispc ? Math.round(itm.prix * 100) * (val/100) : Math.round(val * 100);

    //   // conversion du modificateur en coefficient
    //   __modtx = (ispc) 
    //   ? (
    //     __prdmod.operation > 0 
    //     ? (100 + val) / 100
    //     : (100 - val) / 100
    //     ) 
    //   : (
    //     __prdmod.operation > 0 
    //     ? 1 + (val/itm.prix)
    //     : 1 - (val/itm.prix)
    //     )
    //   ;

    //   // si le modificateur est en pourcentage : application de la remise sur le HT
    //   // et calcul des valeurs
    //   if (ispc) {
    //     let prvttc = __itmttc;
    //     __itmht = __itmht * __modtx;
    //     __itmttc = __itmht * (1 + itm.tva.valeur);
    //     __itmmodtotal = prvttc - __itmttc;
    //   }
    //   // si me modificateur est en numéraire : application de la remise sur le TTC
    //   // et calcul des valeurs
    //   else {
    //     let prvttc = __itmttc;
    //     __itmttc = __itmht - __modval;
    //     __itmht = __itmttc / (1 + itm.tva.valeur);
    //     __itmmodtotal = prvttc - __itmttc;
    //   }
      
    // }

    __noteData['LIGNES'].push({
      'ENC-NID': newNote,
      'ENC-TIK-ORI-NUM': itm.itemid,
      'ENC-TIK-LIG-NUM': __noteData['ENC-TIK-LIG-NBR'],
      'ENC-TIK-LIG-PRO-NID': itm.produitid,
      'ENC-TIK-LIG-PRO-LIB': itm.nom,
      'ENC-TIK-LIG-PRO-QTE': itm.quantite,
      'ENC-TIK-LIG-PRO-MTH': Math.round(itm.puht * 100),
      'ENC-TIK-LIG-PRO-TTC': Math.round(itm.pu * 100),
      'ENC-TIK-LIG-REM-TXX': itm.rem_txx,
      'ENC-TIK-LIG-REM-TOT': itm.rem_tot,
      'ENC-TIK-LIG-TOT-MHT': itm.tot_mht,
      'ENC-TIK-LIG-TOT-TTC': itm.tot_ttc,
      'ENC-TIK-LIG-OPE-TYP': 'VENTE',
      'ENC-TIK-LIG-CAI-NID': caisse.uniqid,
      'ENC-TIK-LIG-VEN-NID': user.user_id,
      'ENC-TIK-LIG-OPS-NID': user.user_id,
      'ENC-TIK-LIG-HOR-GDH': format(confirm.createdAt,'yyyyMMddHHmmss')
    });

    // incrémentation du numéro de ligne
    __noteData['ENC-TIK-LIG-NBR'] += 1;

    __noteData['ENC-TIK-REM-MTN'] += itm.rem_tot;


    itm.ingredients.forEach((ing, ingidx) => {

      __noteData['LIGNES'].push({
        'ENC-NID': newNote,
        'ENC-TIK-ORI-NUM': itm.itemid+'-'+ingidx,
        'ENC-TIK-LIG-NUM': __noteData['ENC-TIK-LIG-NBR'],
        'ENC-TIK-LIG-PRO-NID': ing.ingredient,
        'ENC-TIK-LIG-PRO-LIB': ing.nom,
        'ENC-TIK-LIG-PRO-QTE': ing.qte,
        'ENC-TIK-LIG-PRO-MTH': Math.round(ing.supplementht * 100),
        'ENC-TIK-LIG-PRO-TTC': Math.round(ing.supplement * 100),
        'ENC-TIK-LIG-REM-TXX': ing.rem_txx,
        'ENC-TIK-LIG-REM-TOT': ing.rem_tot,
        'ENC-TIK-LIG-TOT-MHT': Math.round(ing.supplementht * 100) * ing.qte,
        'ENC-TIK-LIG-TOT-TTC': Math.round(ing.supplement * 100) * ing.qte,
        'ENC-TIK-LIG-OPE-TYP': 'VENTE',
        'ENC-TIK-LIG-CAI-NID': caisse.uniqid,
        'ENC-TIK-LIG-VEN-NID': user.user_id,
        'ENC-TIK-LIG-OPS-NID': user.user_id,
        'ENC-TIK-LIG-HOR-GDH': format(confirm.createdAt,'yyyyMMddHHmmss')
      });

      // incrémentation du numéro de ligne
      __noteData['ENC-TIK-LIG-NBR'] += 1;

      __noteData['ENC-TIK-REM-MTN'] += ing.rem_tot;
    });
  });


  // tva ticket
  Object.values(confirm.ventilation).forEach(tva =>{
    __noteData['ENC-TIK-TOT-MHT'] += tva.ht;
    __noteData['ENC-TIK-TOT-TTC'] += tva.ttc;
    __noteData['FAC-TOT-TVA'] += tva.tva;
  });


  return __noteData;
}




function getPastNonConfirmed() {
  return async (dispatch, getState) => {
    const { heure_fin } = getState().parametresReducer.parametres.entreprise;
      
    // // *** définition de la fin de la période précédente
    const __periode = dateBounds(new Date(), heure_fin);

    console.log('__periode.debut',__periode.debut);

    const __cmdnonconfirmees = await commandeServices.getCommandesList({
      $and: [
        {status: {$in:['standby','a_encaisser']}},
        {createdAt:{$lt:__periode.debut}}
      ]
    });
    let __num = 0;
    if (__cmdnonconfirmees.hasOwnProperty('commandeslist')) {
      __num = Object.values(__cmdnonconfirmees.commandeslist).length;
    }
    dispatch({ type: commandeActionTypes.PAST_NONCONFIRMEDCMD, value: __num });

  }
}


function standByCommande(payload, needNumero) {
  return async (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.STANDBY_COMMANDE });

    payload.status = "standby";
    payload.end = new Date();
    payload.chrono =
      Math.round(differenceInMilliseconds(payload.end, payload.start) / 10) /
      100;
    logger.info(payload);
    const state = getState();

    logger.info("standByCommande needNumero", needNumero);

    const { parametres } = state.parametresReducer;
    if (needNumero) {


      const { numero } = state.commandeReducer;

      // cf. détail du process dans './src/services/commande/numeroActions.js > takeNumero()'
      if (parametres.options.role==="secondary") {
        const conf = await notificationServices.askNumero(parametres.options.primary)
        payload.numero = conf.numero;
        dispatch({type: numeroActionTypes.GET_NUMERO, numero: conf.numero});
      }
      else {
        const conf_numero = await numeroServices.getNumero(numero, parametres);
        payload.numero = conf_numero;
        dispatch({type: numeroActionTypes.GET_NUMERO, numero: conf_numero});
        dispatch(numeroActions.setNextNumero());
      }

      logger.info("standByCommande nn numero", payload.numero);
    }
    logger.info("standByCommande nn numero", payload.numero);

    payload.localsync = [parametres.options.caisse.uniqid];

    // if (payload.numero==null) {
    //   payload.numero = getState().commandeReducer.commande.numero;
    // }

    // activation de l'impression des tickets pour les commandes en attente
    const {print_standby} = getState().parametresReducer.parametres.commandes;

    commandeServices.saveCommande(payload, state.catalogueReducer).then(
      (confirm) => {
        dispatch({
          type: commandeActionTypes.VALIDATE_COMMANDE_SUCCESS,
          commande: {},
        });
        // on force l'impression des tickets de production si c'est paramétré
        // sauf si la commande est programmée
        if (print_standby && (payload.scheduled && payload.enproduction===false)) {
          dispatch(peripheralActions.printCommandeTicket("production", confirm));
        }
        dispatch(notificationActions.syncDispatch("commande", confirm));
        dispatch(getCommande());
      },
      (error) => {
        logger.info(error);
        dispatch({
          type: commandeActionTypes.VALIDATE_COMMANDE_FAILURE,
          error: error.toString(),
        });
      }
    );
  };
}

function validateCommande(_payload, needNumero) {
  return async (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.AENCAISSER_COMMANDE });


    const state = getState();

    const { catalogueReducer } = state;
    const { caisse } = state.parametresReducer.parametres.options;
    const { user } = state.authentication;
    const { commande } = state.commandeReducer;
    const { note } = state.numerotationReducer;
    const { privateKey, trousseauId } = state.signatureReducer;
    const { entreprise } = state.parametresReducer.parametres;

    let payload = {...commande};

    payload.status = "a_encaisser";
    payload.enproduction = payload.scheduled ? false : true;
    payload.end = new Date();
    payload.chrono =
      Math.round(differenceInMilliseconds(payload.end, payload.start) / 10) /
      100;
    logger.info(payload);

    logger.info("validateCommande needNumero", needNumero);

    const { parametres } = state.parametresReducer;
    if (needNumero) {
      const { numero } = state.commandeReducer;

      // cf. détail du process dans './src/services/commande/numeroActions.js > takeNumero()'
      if (parametres.options.role==="secondary") {
        const conf = await notificationServices.askNumero(parametres.options.primary)
        payload.numero = conf.numero;
        dispatch({type: numeroActionTypes.GET_NUMERO, numero: conf.numero});
      }
      else {
        const conf_numero = await numeroServices.getNumero(numero, parametres);
        payload.numero = conf_numero;
        dispatch({type: numeroActionTypes.GET_NUMERO, numero: conf_numero});
        dispatch(numeroActions.setNextNumero());
      }

      logger.info("validateCommande nn numero", payload.numero);
    }

    logger.info("validateCommande numero", payload.numero);


    if (payload.mode==="livraison" && payload.client && !payload.lot) {

      // const {parametres} = getState().parametresReducer;
      // let param_limit = parametres.commandes.hasOwnProperty('lot_max_num_commandes') ? parametres.commandes.lot_max_num_commandes : 10;
      // let param_exp = parametres.commandes.hasOwnProperty('lot_exp_in_minutes') ? parametres.commandes.lot_exp_in_minutes : 15;

      const client = state.clientsReducer.clients.find(clt=>clt.client_id===payload.client.client_id);
      if (client.hasOwnProperty('secteur')) {
        logger.info('client', client);
        const {lots} = state.commandesListReducer;
        logger.info('lots', lots);
        if (lots!==undefined) {
          logger.info('lots non undefined');

          const {lot_id, lot_timestamp} = dispatch(addCommandeToLot(payload.ticketId, client.secteur));
          logger.info('validateCommande() lot_id', lot_id);

          payload.lot = lot_id;
          payload.timestamplot = lot_timestamp.getTime();

        }
      }
    } // end "livraison" + client + lot



    const payloadcopy = { ...payload, localsync: [parametres.options.caisse.uniqid] };

    dispatch({
      type: commandeActionTypes.UPDATE_COMMANDE,
      commande: payloadcopy
    });
   
    

    dispatch(getCommande());


    try {

      let confirm = await commandeServices.saveCommande(payloadcopy, catalogueReducer);
     
      dispatch({
        type: commandeActionTypes.VALIDATE_COMMANDE_SUCCESS,
        commande: {},
      });

      // met à jour la liste des schedules (ajoute ou supprime la commande)
      dispatch({
        type: (confirm.scheduled) ? commandeActionTypes.SET_SCHEDULE : commandeActionTypes.DELETE_SCHEDULE,
        schedule: confirm.ticketId
      });
    
      if (!confirm.signaturenote && !confirm.note) {

        const lastSignatureNote = await signatureServices.getLastSignature('notes');
        const newNote = 'N'+format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + note.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false});
      
        let signatureNote = null;
        try {
          signatureNote = signatureServices.createTicketSignature({...confirm, ticket: lastSignatureNote}, privateKey, lastSignatureNote);
        } catch(e) {
          console.error(e);
        }

        if (signatureNote) {
       
          confirm = {
            ...confirm,
            note: newNote,
            hashsourcenote: signatureNote.source, 
            hashnote: signatureNote.hash,
            signaturenote: signatureNote.signature
          }


          const __noteData = _createNote(confirm, {
            newNote,
            entreprise,
            user,
            vendeur: user,
            caisse,
            signature: signatureNote.signature,
            trousseauId,
            hash: signatureNote.hash,
            source: signatureNote.source,
          });

          // si la note est offerte
          if (__noteData['ENC-TIK-REM-MTN']>0 && __noteData['ENC-TIK-TOT-TTC']===0) {
            // on loggue dans le JET
            dispatch(journalActions.log('327', `Note #${ newNote } offerte (${ Number(__noteData['ENC-TIK-REM-MTN'] / 100).toFixed(2) } €)`));
          }
          else {
            // son loggue dans le JET les articles offerts
            const __articlesofferts = __noteData['LIGNES'].filter(art => art['ENC-TIK-LIG-REM-TXX']===100 );
            __articlesofferts.forEach(art => {
              dispatch(journalActions.log('328', `Article #${ art['ENC-TIK-ORI-NUM'] } offert (${ Number(art['ENC-TIK-LIG-REM-TOT'] / 100).toFixed(2) } €) : Note #${ newNote }`));
            });
          }

          console.log('note', __noteData);

          try {
            await commandeServices.persistNote(__noteData);
            dispatch(journalActions.log('160','Note #'+newNote));
            
            dispatch( signatureActions.updateSignature('notes', signatureNote.signature) );
            dispatch( signatureActions.updateNumerotation('note', note+1) );
          } catch(e) {
            console.error(e);
          }
        }

      }

      commandeServices.persistCommande(confirm);


      // si la commande à encaisser est PROGRAMMÉE,
      // on n'imprime que le ticket commande
      if (payload.scheduled && payload.enproduction===false) {
        // dispatch(peripheralActions.printTicket({templates:["commande"]}));
        dispatch(peripheralActions.printCommandeTicket({templates:["commande"]}, confirm));
      }
      // sinon on imprime tout
      else {
        // dispatch(peripheralActions.printTicket("all"));
        dispatch(peripheralActions.printCommandeTicket("all", confirm));
      }

      dispatch(notificationActions.syncDispatch("commande", confirm));

    }
    catch(error){
      logger.info(error);
      dispatch({
        type: commandeActionTypes.VALIDATE_COMMANDE_FAILURE,
        error: error,
      });
    }

  };
}

function _getActiveLot(secteur, lots, limit) {
  logger.info("_getActiveLot", secteur, lots, limit);
   const __now = new Date();
   return lots.find(lot => lot.secteur===secteur && lot.expiredAt>__now && lot.commandes.length<limit); 
}


function deleteCurrentCommande() {
  return (dispatch) => {
    dispatch({ type: commandeActionTypes.DELETE_CURRENT_COMMANDE });
  };
}

function addProduit(payload) {
  return (dispatch, getState) => {
    const state = getState();
    const items = state.commandeReducer.commande.items;
    const tva = state.catalogueReducer.tva[payload.tva_id];
    const steps = state.catalogueReducer.steps[payload.produitid];


    // const composition = Object.entries(payload.composition).map(
    //   ([ingid, qte]) => ({
    //     ingredient: ingid,
    //     qte: qte,
    //     type: state.catalogueReducer.ingredients[ingid].type,
    //     tva:
    //       state.catalogueReducer.tva[
    //         state.catalogueReducer.ingredients[ingid].tva_id
    //       ],
    //     prix: Number(state.catalogueReducer.ingredients[ingid].supplement),
    //     nom: state.catalogueReducer.ingredients[ingid].nom,
    //     fromStep: null,
    //   })


      const composition = payload.compo.map(
        (comping) => {
          const [ingid, qte] = Object.entries(comping)[0];
          return {
            ingredient: ingid,
            qte: qte,
            type: state.catalogueReducer.ingredients[ingid].type,
            tva:
              state.catalogueReducer.tva[
                state.catalogueReducer.ingredients[ingid].tva_id
              ],
            prix: Number(state.catalogueReducer.ingredients[ingid].supplement),
            nom: state.catalogueReducer.ingredients[ingid].nom,
            fromStep: null,
          }
        });


      /*

      ingredient: ingredient.id, 
      type: ingredient.type, 
      qte: 1, 
      prix: Number(ingredient.supplement), 
      nom: ingredient.nom, 
      fromStep:step.step_id,
      tva: tva
        */
    payload = { ...payload, composition };


    logger.info('addprd pl', payload);

    const { commandeItem, mode } = commandeServices.addProduit(
      payload,
      tva,
      items,
      steps
    );

    if ("add" === mode)
      dispatch({ type: commandeActionTypes.ADD_PRODUIT, commandeItem });
    if ("update" === mode)
      dispatch({ type: commandeActionTypes.UPDATE_PRODUIT, commandeItem });

    dispatch(checkMarketing());
  };
}

function updateProduit(payload) {
  return (dispatch, getState) => {
    const { itemid, addPrd } = payload;
    const state = getState();
    const item = state.commandeReducer.commande.items.find(
      (itm) => itm.itemid === itemid
    );
    const steps = state.catalogueReducer.steps[item.produitid];
    const tvaCat = state.catalogueReducer.tva;

    // s'il s'agit d'un produit customisable et si on augmente la quantité
    if (addPrd && steps) {


      const items = state.commandeReducer.commande.items;
      const tva = state.catalogueReducer.tva[item.tva.tva_id];
      const steps = state.catalogueReducer.steps[item.produitid];

      const __prd = {
        produitid: item.produitid,
        nom: item.nom,
        prix: item.pu,
        puht: item.puht,
        composition: item.composition,
        compo: [],
        customizable: true,
        tva_id: item.tva.tva_id,
        status: 'confirmed'
      };

      const { commandeItem } = commandeServices.addProduit(
        __prd,
        tva,
        items,
        steps
      );

      commandeItem.steps = item.steps;

      dispatch({ type: commandeActionTypes.ADD_PRODUIT, commandeItem });

      item.ingredients.forEach(ing => {
        dispatch(addIngredient({
          itemid: commandeItem.itemid,
          stepid: ing.fromStep,
          ingredientid: ing.ingredient,
          quantite: ing.qte,
          tvaCat
        }));
        dispatch(completeStep({
          itemid: commandeItem.itemid,
          stepid: ing.fromStep
        }));
      });

    }
    // si on diminue la quantité et/ou s'il s'agit d'un produit non customisable
    else {

      const { commandeItem, mode } = commandeServices.updateProduit(
        payload,
        item
      );

      if ("update" === mode) {
        dispatch({ type: commandeActionTypes.UPDATE_PRODUIT, commandeItem });
      }
      if ("delete" === mode) {
        dispatch({ type: commandeActionTypes.DELETE_PRODUIT, commandeItem });
        dispatch( journalActions.log('323', `suppression du produit ${itemid}`) );
      }

    }
    dispatch(checkMarketing());
    
  };
}

function addIngredient(payload) {
  return (dispatch, getState) => {
    const { itemid, stepid, ingredientid, quantite } = payload;
    const state = getState();
    const item = state.commandeReducer.commande.items.find(
      (itm) => itm.itemid === itemid
    );
    const commandeMode = state.commandeReducer.commande.mode;
    const step = state.catalogueReducer.steps[item.produitid].find(
      (step) => step.step_id === stepid
    );
    const ingredient = state.catalogueReducer.ingredients[ingredientid];
    const produitSteps = state.catalogueReducer.steps[item.produitid];
    const tvaCat = state.catalogueReducer.tva;
    const tva = state.catalogueReducer.tva[ingredient.tva_id];

      console.log('CmdAct.addIngredient', payload);

    const commandeItem = commandeServices.addIngredient(
      ingredient,
      quantite,
      step,
      item,
      produitSteps,
      tva,
      commandeMode,
      tvaCat
    );
    dispatch({ type: commandeActionTypes.ADD_INGREDIENT, commandeItem });
  };
}

function removeIngredient(payload) {
  return (dispatch, getState) => {
    const { itemid, stepid, ingredientid, quantite } = payload;
    const state = getState();
    const item = state.commandeReducer.commande.items.find(
      (itm) => itm.itemid === itemid
    );
    const step = state.catalogueReducer.steps[item.produitid].find(
      (step) => step.step_id === stepid
    );
    const ingredient = state.catalogueReducer.ingredients[ingredientid];
    const produitSteps = state.catalogueReducer.steps[item.produitid];

    const commandeItem = commandeServices.removeIngredient(
      ingredient,
      quantite,
      step,
      item,
      produitSteps
    );
    dispatch({ type: commandeActionTypes.REMOVE_INGREDIENT, commandeItem });
  };
}

function noIngredientForStep(payload) {
  return (dispatch, getState) => {
    logger.info(payload);

    const { itemid, stepid } = payload;
    const state = getState();
    const item = state.commandeReducer.commande.items.find(
      (itm) => itm.itemid === itemid
    );
    const step = state.catalogueReducer.steps[item.produitid].find(
      (step) => step.step_id === stepid
    );
    const produitSteps = state.catalogueReducer.steps[item.produitid];

    const commandeItem = commandeServices.noIngredientForStep(
      step,
      item,
      produitSteps
    );
    dispatch({ type: commandeActionTypes.STEP_NOINGREDIENT, commandeItem });
  };
}

function completeStep(payload) {
  return (dispatch, getState) => {
    logger.info("CmdA.completeStep()", payload);

    const { itemid, stepid } = payload;
    const state = getState();
    const item = state.commandeReducer.commande.items.find(
      (itm) => itm.itemid === itemid
    );
    const step = state.catalogueReducer.steps[item.produitid].find(
      (step) => step.step_id === stepid
    );
    const produitSteps = state.catalogueReducer.steps[item.produitid];

    commandeServices
      .completeStep(step, item, produitSteps)
      .then((commandeItem) => {
        dispatch({ type: commandeActionTypes.STEP_COMPLETE, commandeItem });
      });
  };
}

function uncheckItemSteps(payload) {
  return (dispatch, getState) => {
    const { itemid, stepid } = payload;
    const item = getState().commandeReducer.commande.items.find(
      (itm) => itm.itemid === itemid
    );

    const commandeItem = commandeServices.uncheckItemSteps(item, stepid);
    dispatch({ type: commandeActionTypes.STEP_UNCOMPLETE, commandeItem });
  };
}


function updateMode(mode) {
  return (dispatch, getState) => {
    const {commande} = getState().commandeReducer;
    const {ingredients, catalogue, tva, steps} = getState().catalogueReducer;
    
    const updated_commande = commandeServices.updateMode(mode, commande, {ingredients, catalogue, tva, steps})
      
    dispatch({type: commandeActionTypes.UPDATE_COMMANDE, commande: updated_commande, contexte:"updateMode"});
      
    dispatch(checkMarketing());

  }
}


function updateCommande(payload, from='') {
  return (dispatch, getState) => {
    logger.dump('updateCommande()',{from, payload});

    const {commande} = getState().commandeReducer;
    const {lots} = getState().commandesListReducer;
    

    if (commande.mode==="livraison" && commande.client && !commande.lot && lots!==undefined) {

      // const {parametres} = getState().parametresReducer;
      // let param_limit = parametres.commandes.hasOwnProperty('lot_max_num_commandes') ? parametres.commandes.lot_max_num_commandes : 10;
      // let param_exp = parametres.commandes.hasOwnProperty('lot_exp_in_minutes') ? parametres.commandes.lot_exp_in_minutes : 15;

      const client = getState().clientsReducer.clients.find(clt=>clt.client_id===commande.client.client_id);
      if (client.hasOwnProperty('secteur')) {
       
        const {lot_id, lot_timestamp} = dispatch(addCommandeToLot(commande.ticketId, client.secteur));
        logger.info('updateCommande() lot_id', lot_id);

        payload = {...payload, lot: lot_id, timestamplot: lot_timestamp.getTime()};
        
      }
    }
    dispatch({ type: commandeActionTypes.UPDATE_COMMANDE, payload: payload, contexte: from });
    dispatch(checkMarketing());
    

  };
}

function deleteCommande(payload) {
  return async (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.DELETE_COMMANDE_REQUEST });

    const { commandeslist } = getState().commandesListReducer;

    const { caisse, role } = getState().parametresReducer.parametres.options;
    const { user } = getState().authentication;
    const { ticket } = getState().numerotationReducer;
    const { privateKey, trousseauId } = getState().signatureReducer;
    const { entreprise } = getState().parametresReducer.parametres;


    let commande = Object.values(commandeslist).find(
      (cmd) => cmd.ticketId === payload.ticketId
    );

    const { ticketId, motif } = payload;

    logger.info("commande à annuler", commande);

    let error = "";
    if (!commande) error = "inconnue";
    if (commande && commande.status === "confirmed") error = "active";

    if (error === "") {
      try {

        const data = await commandeServices.deleteCommande(ticketId, motif);
        dispatch({
          type: commandeActionTypes.DELETE_COMMANDE_SUCCESS,
          ...data,
        });
        dispatch(notificationActions.syncDispatch("commande", data));
        
        if (commande.status==='a_encaisser') {
          try {
            const note = await commandeServices.getNote({'ENC-TIK-NUM': commande.note});

            const lastSignatureTicket = await signatureServices.getLastSignature('tickets');
            const newTicket = 'T'+format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + ticket.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false});
            const signatureTicket = signatureServices.createTicketSignature({...commande, ticket: newTicket}, privateKey, lastSignatureTicket);
          
            commande = {
              ...commande,
              ticket: newTicket,
              hashsource: signatureTicket.source,
              hash: signatureTicket.hash,
              signature: signatureTicket.signature
            }


            const __ticketData = _createTicket(commande, {
              newTicket,
              entreprise,
              user,
              vendeur: user,
              caisse,
              signature: signatureTicket.signature,
              trousseauId,
              hash: signatureTicket.hash,
              source: signatureTicket.source,
              operation: 'ABANDON'
            });

            await commandeServices.persistTicket(__ticketData);
            dispatch(journalActions.log('160','Ticket ABANDON #'+newTicket));
            dispatch(journalActions.log('324','Abandon de la Note #'+commande.note));

            dispatch( signatureActions.updateSignature('tickets', signatureTicket.signature) );
            dispatch( signatureActions.updateNumerotation('ticket', ticket+1) );



          }
          catch(e) {
            console.error(e);
          }
        } else {
          dispatch( journalActions.log('320', `Abandon de la Commande #${ticketId}`) );
        }
      
        const cmdtosync = {
          ...data,
          chrono: data.chrono || 0,
          createdAt: formatISO(data.createdAt),
          updatedAt: formatISO(data.updatedAt),
        };
        
        dispatch(notificationActions.syncCommandes([cmdtosync]));
      }
      catch(error) {
        dispatch({
          type: commandeActionTypes.DELETE_COMMANDE_FAILURE,
          error: error,
        });
      }
    } else {
      logger.error(
        "deleteCommande(" + payload.ticketId + ") error",
        "Impossible de supprimer une commande qui n’est pas en attente."
      );
    }
  };
}

function addPrintnum(payload) {
  return (dispatch, getState) => {
    const {commandeId} = payload;
    const { commandeslist } = getState().commandesListReducer;
    const commande = Object.values(commandeslist).find(
      (cmd) => cmd.ticketId === commandeId
    );

    const printnum = Number(commande.printnum) + 1;
    
    commandeServices.persistCommande({ ...commande, printnum: printnum }).then(
      (data) => {
        dispatch({
          type: commandeActionTypes.UPDATE_COMMANDE,
          payload: { printnum: printnum },
          contexte: 'addPrintnum'
        });
        dispatch(
          notificationActions.syncDispatch("commande", {
            ...commande,
            printnum: printnum
          })
        );
        dispatch(getTodayCommandesList());
      },
      (error) =>
        dispatch({
          type: commandeActionTypes.UPDATE_COMMANDE_ERROR,
          error: error,
        })
    );
  }
}

function setLivreur(payload) {
  return (dispatch, getState) => {
    const { commandeId, livreur } = payload;

    const { commandeslist } = getState().commandesListReducer;
    const commande = Object.values(commandeslist).find(
      (cmd) => cmd.ticketId === commandeId
    );

    const now = new Date();

    commandeServices.persistCommande({ ...commande, livreur: livreur, pickedAt:formatISO(now)}).then(
      (data) => {
        dispatch({
          type: commandeActionTypes.UPDATE_COMMANDE,
          payload: { livreur: livreur, pickedAt: formatISO(now) },
          contexte: 'setLivreur'
        });
        dispatch(
          notificationActions.syncDispatch("commande", {
            ...commande,
            livreur: livreur,
            pickedAt: formatISO(now),
          })
        );
        dispatch(getTodayCommandesList());
      },
      (error) =>
        dispatch({
          type: commandeActionTypes.UPDATE_COMMANDE_ERROR,
          error: error,
        })
    );
  };
}


function addReglement(payload) {
  return (dispatch, getState) => {
    const state = getState();
    const reglements = state.commandeReducer.commande.reglements;

    const reglement = commandeServices.addReglement(payload, reglements);
    dispatch({ type: commandeActionTypes.ADD_REGLEMENT, reglement });
  };
}

function removeReglement(payload) {
  return (dispatch, getState) => {
    //  commandeServices.removeReglement(reglementId);

    dispatch({
      type: commandeActionTypes.REMOVE_REGLEMENT,
      reglementId: payload.reglementId,
    });
  };
}

function addRendu(payload) {
  return dispatch => {
    const rendu = commandeServices.addRendu(payload);
    dispatch({ type: commandeActionTypes.ADD_RENDU, rendu });
  };
}
function removeRendu(payload) {
  return dispatch => {
    dispatch({
      type: commandeActionTypes.REMOVE_RENDU,
      renduId: payload.renduId,
    });
  };
}
function addTroppercu(payload) {
  return dispatch => {
    const troppercu = commandeServices.addTroppercu(payload);
    dispatch({ type: commandeActionTypes.ADD_TROP_PERCU, troppercu });
  };
}

function addComment(payload) {
  return (dispatch, getState) => {
    const comments = getState().commandeReducer.commande.comments;

    const comment = commandeServices.addComment(payload, comments);
    dispatch({ type: commandeActionTypes.ADD_COMMENT, comment });
  };
}
function updateComment(payload) {
  return (dispatch, getState) => {
    logger.info("CommandeActions.updateComment", payload);
    dispatch({ type: commandeActionTypes.UPDATE_COMMENT, payload: payload });
  };
}
function deleteComment(payload) {
  return (dispatch, getState) => {
    dispatch({
      type: commandeActionTypes.DELETE_COMMENT,
      commentId: payload.commentId,
    });
  };
}

function duplicata(ticketId) {
  return async (dispatch, getState) => {

    const { duplicata } = getState().numerotationReducer;
    const { privateKey, trousseauId } = getState().signatureReducer;
    const { caisse, role } = getState().parametresReducer.parametres.options;
    const { user } = getState().authentication;

    try {
      const {_cmd} = await commandeServices.getCommandeById(ticketId);
      let commande = _cmd;
      console.log('duplicata',commande);

        
      let piece = null;
      try {
        if (commande.status==="confirmed") {
          piece = await commandeServices.getTicket({'ENC-TIK-NUM':commande.ticket});
        } else {
          piece = await commandeServices.getNote({'ENC-TIK-NUM':commande.note});
        }
        piece = piece[0];
      }
      catch(e) {
        console.error(e);
      }

      
      const {duplicatas} = commande;

      let _duplis = (Array.isArray(duplicatas)) ? duplicatas : [];

      const lastSignature = await signatureServices.getLastSignature('duplicatas');
      const newDuplicata = 'D'+format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + duplicata.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false});
      
      const printedAt = new Date();


      const __dupli = {
        'ENC-DUP-NID': newDuplicata,
        'ENC-DUP-ORI-NUM': piece['ENC-TIK-NUM'],
        'ENC-DUP-TYP': piece['ENC-TIK-DOC-TYP'],
        'ENC-DUP-PRN-NUM': commande.duplicatas ? (commande.duplicatas.filter(d => d.type===piece['ENC-TIK-DOC-TYP']).length + 1) : 1,
        'ENC-DUP-OPS-NID': user.user_id,
        'ENC-DUP-HOR-GDH': format(printedAt, 'yyyyMMddHHmmss'),
        'ENC-TIK-ID-KEY': trousseauId,
        'ENC-DUP-VER': packageJson.version,
        'ENC-SIG-RES': piece['ENC-TIK-TAG-SIG'],
        'ENC-SIG-MOTIF': 'LISTE COMMANDES' 
      };

      const {source, hash, signature} = signatureServices.createDuplicataSignature(__dupli, privateKey, lastSignature, (piece['ENC-TIK-DOC-TYP']==='NOTE'));
    
      __dupli['ENC-DUP-HASH'] = hash;
      __dupli['ENC-TIK-ARG'] = source;
      __dupli['ENC-DUP-TAG-SIG'] = signature;
      __dupli['ENC-DUP-RES'] = signature.substring(2,3) + signature.substring(6,7) + signature.substring(12,13) + signature.substring(18,19);


      commande = {
        ...commande,
        duplicatas: [
          ..._duplis,
          { 
            id: newDuplicata, 
            type: piece['ENC-TIK-DOC-TYP'],
            hashsource: source,
            hash: hash,
            signature: signature,
            printedAt: format(printedAt, 'yyyy-MM-dd HH:mm:ss')
          }
        ],
        updatedAt: formatISO(new Date())
      }
      
      commandeServices.persistCommande(commande);

      await commandeServices.persistDuplicata(__dupli);

      console.log('🖨 commande duplicata', commande);
      
      dispatch(peripheralActions.printCommandeTicket({templates:['commande']}, commande));
      
      dispatch( signatureActions.updateSignature('duplicatas', signature) );
      dispatch( signatureActions.updateNumerotation('duplicata', duplicata+1) );

      // synchro avec les autres caisses du restaurant
      dispatch(notificationActions.syncDispatch("commande", commande));

      // si la caisse est une primary, elle s'occupe de la synchro avec le BO
      if (role==="primary") {
        dispatch(
          notificationActions.syncCommandes([commande])
        );
      }

      
    

    } catch(error) {
      console.error(error);
    }
  }
}

function setSchedule(payload) {

  return (dispatch, getState) => {
    const { ticketId, heure } = payload;

    const { commandeslist } = getState().commandesListReducer;
    const commande = Object.values(commandeslist).find(
      (cmd) => cmd.ticketId === ticketId
    );

    commandeServices.persistCommande({ ...commande, scheduled: heure, enproduction: false}).then(
      (data) => {
        dispatch({
          type: commandeActionTypes.UPDATE_COMMANDE,
          payload: { scheduled: heure, enproduction: false },
          contexte: 'setSchedule'
        });
        dispatch(
          notificationActions.syncDispatch("commande", {
            ...commande,
            scheduled: heure, 
            enproduction: false,
          })
        );
        // met à jour la liste des schedules (ajoute ou supprime la commande)
        dispatch({
          type: (heure) ? commandeActionTypes.SET_SCHEDULE : commandeActionTypes.DELETE_SCHEDULE,
          schedule: commande.ticketId
        });
        dispatch(getTodayCommandesList());
      },
      (error) =>
        dispatch({
          type: commandeActionTypes.UPDATE_COMMANDE_ERROR,
          error: error,
        })
    );
  };
}

function checkSchedules() {
  return async (dispatch, getState) => {
    // const {schedules} = getState().commandesListReducer;

    console.log('checkSchedules()');

    const { options } = getState().parametresReducer.parametres;

    if (options && options.role==='primary') {
      
      // heure de déclenchement de la production des commandes programmées (moins le délai)
      const {commandes} = getState().parametresReducer.parametres;
      const __now = new Date();
      let __heure = __now;
      // let __heure = (__now.getHours() * 100) + __now.getMinutes();

      
      if (commandes.hasOwnProperty('schedule_delay')) {
        __heure = add(__now, {minutes: commandes.schedule_delay});
      } else {
        __heure = add(__now, {minutes: 15});
      }

      const { heure_fin } = getState().parametresReducer.parametres.entreprise;

      // *** définition de la fin de la période précédente
      const __periode_bounds = dateBounds(new Date(), heure_fin);
      const lastperiode_end = __periode_bounds.debut;

      // récupération commandes programmées à lancer
      const { commandeslist } = await commandeServices.getCommandesList({
        // $and: [
        //   {createdAt: { $gt: lastperiode_end } },
        //   {scheduled: { $exists: true }},
        //   {scheduled: { $lte: __heure}},
        //   {$or: [
        //     {enproduction: { $exists: false }},
        //     {enproduction: false}
        //   ]}
        // ]
          '$and': [
            {'createdAt': { '$gt': lastperiode_end }}, 
            {'scheduled': { '$exists': true }},
            {'scheduled': { '$lte': __heure }},
            {'$or': [
              {'enproduction': { '$exists': false }}, 
              {'enproduction': false}
            ]}
          ]
      });


      console.log('checkSchedules()',commandeslist);

      // s'il y a des commandes programmées à lancer...
      if (commandeslist && Object.entries(commandeslist).length>0) {
        // logger.info('⏰ '+Object.entries(commandeslist).length+' commandes en attente devant être lancées.');
        console.log('⏰ '+Object.entries(commandeslist).length+' commandes en attente devant être lancées.');

        // on lance chaque commande et on la déclare comme 'en production'
        Object.values(commandeslist).forEach(cmd => {
          dispatch(peripheralActions.printCommandeTicket('production', {...cmd, enproduction: true}));
          commandeServices.persistCommande({ ticketId: cmd.ticketId, enproduction: true });
          dispatch({
            type: commandeActionTypes.DELETE_SCHEDULE,
            schedule: cmd.ticketId
          });
        });

      } else {
        // logger.info('⏰ aucune commande en attente 🚫');
        console.log('⏰ aucune commande en attente 🚫');
      }
    }
    else {
      console.log('schedules : la caisse n’est pas `primary`')
    }
    
  }
}

function addDiscount(payload) {
  return (dispatch, getState) => {
    const modificateurs = getState().commandeReducer.commande.modificateurs;

    const modificateur = commandeServices.addModificateur(
      payload,
      modificateurs
    );
    dispatch({ type: commandeActionTypes.ADD_DISCOUNT, modificateur });
  };
}
function updateDiscount(payload) {
  return (dispatch, getState) => {
    logger.info("CommandeActions.updateDiscount", payload);
    dispatch({ type: commandeActionTypes.UPDATE_DISCOUNT, payload: payload });
  };
}
function deleteDiscount(payload) {
  return (dispatch, getState) => {
    dispatch({
      type: commandeActionTypes.DELETE_DISCOUNT,
      discountId: payload.discountId,
    });
  };
}

function getLots() {
  return dispatch => {
    commandeServices.getAllLots()
    .then(data => {
      dispatch({type: commandeActionTypes.GET_LOTS, lots:data});
    })
  }
}

function addCommandeToLot(ticketId, secteur) {
  return (dispatch, getState) => {

    logger.info('📦 addCommandeToLot()');
    
    const {lots} = getState().commandesListReducer;
    const {parametres} = getState().parametresReducer;
    let param_limit = parametres.commandes.hasOwnProperty('lot_max_num_commandes') ? parametres.commandes.lot_max_num_commandes : 10;
    let param_exp = parametres.commandes.hasOwnProperty('lot_exp_in_minutes') ? parametres.commandes.lot_exp_in_minutes : 15;

    let lot = _getActiveLot(secteur, lots, param_limit);
    let mode = 'add';
    if (!lot) {
      lot = commandeServices.createLot(secteur, param_exp);
      mode = 'create';
    }    
    
    if (!lot.commandes.includes(ticketId)) {
      lot.commandes.push(ticketId);
    }

    logger.info("addCommandeToLot()", lot);
    
    commandeServices
      .saveLot(lot)
      .then(data => {
        if (mode==="create") {
          dispatch({type: commandeActionTypes.CREATE_LOT, lot: lot});
        } else {
          dispatch({type: commandeActionTypes.ADD_COMMANDE_TO_LOT, lot_id: lot.lot_id, ticket_id: ticketId});
        }
      });
    
      return {lot_id: lot.lot_id, lot_timestamp: lot.createdAt};
    }
}

function checkMarketing() {
  return (dispatch, getState) => {
    const { commande } = getState().commandeReducer;
    const { reglescatalogue } = getState().marketingReducer;

    const modifiers = commandeServices.checkMarketing(commande, reglescatalogue);

    

    let promos = [];

    modifiers.forEach(m => {
      promos.push(commandeServices.addModificateur(m, null));
    });

    const __cmdmodifiers = commande.modificateurs || [];

    const newModificateurs = [
      ...__cmdmodifiers.filter(m=>m.type!=='catalogue'),
      ...promos
    ];

    dispatch({type: commandeActionTypes.CHECK_DISCOUNT, modificateurs: newModificateurs});


  }
}

function archiveCommands(payload) {
  return (dispatch) => {
    dispatch({ type: commandeActionTypes.ARCHIVE_REQUEST });

    const { cmd, clotureId } = payload;

    // logger.time('archiveCommands');
    commandeServices.archiveCommands(cmd, clotureId).then(
      (confirm) => {

      //  logger.timeEnd("archiveCommands");
        dispatch({ type: commandeActionTypes.ARCHIVE_SUCCESS, ids: cmd });
        dispatch(
          notificationActions.syncDispatch("archivecommandes", {
            cmd,
            clotureId,
          })
        );
        dispatch(getTodayCommandesList());
      },
      (error) => {

        // logger.timeEnd("archiveCommands");
        dispatch({
          type: commandeActionTypes.ARCHIVE_FAILURE,
          error: error.toString(),
        });
      }
    );
  };
}

function setSyncedCommands(payload) {
  return (dispatch) => {
    dispatch({ type: commandeActionTypes.SETSYNCED_REQUEST });
    logger.info("setSyncedCommands()", payload);
    const { id, datetime } = payload;
    commandeServices.setSyncedCommands(id, datetime).then(
      (confirm) => {
        dispatch({ type: commandeActionTypes.SETSYNCED_SUCCESS });
        dispatch(
          notificationActions.syncDispatch("setsyncedcommandes", {
            id,
            datetime,
          })
        );
      },
      (error) => {
        dispatch({ type: commandeActionTypes.SETSYNCED_FAILURE, error: error });
      }
    );
  };
}

function setCommandeFromOrder(provider, payload) {
  return async (dispatch, getState) => {
    logger.info("setCommmandeFromOrder()");

    const state = getState();

    // définition du montant du réglement à partir du sous-total
    let __valeur = payload.payment.charges.sub_total.amount / 100;
    // s'il y a une promo, réglement à partir du sous-total après promo
    if (payload.payment.hasOwnProperty('promotions')) {
      __valeur = payload.payment.charges.sub_total_promo_applied.amount / 100;
    }

    let data = {
      ...payload,
      operator: { id: -1, nom: "UberEats", type: "UberEats" },
      caisse: { id: -1, nom: "UberEats", type: "UberEats" },
      operator_encaissement: { id: -1, nom: "UberEats", type: "UberEats" },
      caisse_encaissement: { id: -1, nom: "UberEats", type: "UberEats" },
      enproduction: true,
      reglements: [
        {
          moyen: "uber",
          reglementId: new Date().getTime(),
          valeur: __valeur,
        },
      ],
    };

    const { numero } = getState().commandeReducer;
    const { parametres } = getState().parametresReducer;
    const { ticket, note } = getState().numerotationReducer;
    const { privateKey, trousseauId } = getState().signatureReducer;
    const { entreprise } = parametres;
    // const { user } = getState().authentication;
    const { caisse } = parametres.options;
  

    const newnumero = await numeroServices.getNumero(numero, parametres);
    dispatch(numeroActions.setNextNumero());

    // logger.info(data);
    const commande = commandeServices.setCommandeFromOrder(
      data,
      state.catalogueReducer,
      state.parametresReducer.parametres,
      newnumero
    );

    // dispatch(numeroActions.takeNumero());


    commandeServices.saveCommande({...commande, localsync: [parametres.options.caisse.uniqid]}, state.catalogueReducer).then(
      async (confirm) => {

        // met à jour la liste des schedules (ajoute ou supprime la commande)
        dispatch({
          type: (commande.scheduled) ? commandeActionTypes.SET_SCHEDULE : commandeActionTypes.DELETE_SCHEDULE,
          schedule: commande.ticketId
        });



        if (!confirm.signaturenote && !confirm.note) {  
          const lastSignatureNote = await signatureServices.getLastSignature('notes');
          const newNote = 'N'+format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + note.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false});
          const signatureNote = signatureServices.createTicketSignature({...confirm, ticket: newNote}, privateKey, lastSignatureNote);
        
          confirm = {
            ...confirm,
            note: newNote,
            hashsourcenote: signatureNote.source, 
            hashnote: signatureNote.hash,
            signaturenote: signatureNote.signature,
          }


          const __noteData = _createNote(confirm, {
            newNote,
            entreprise,
            user: confirm.operator_encaissement,
            vendeur: confirm.operator,
            caisse,
            signature: signatureNote.signature,
            trousseauId,
            hash: signatureNote.hash,
            source: signatureNote.source
          });

          // si la note est offerte
          if (__noteData['ENC-TIK-REM-MTN']>0 && __noteData['ENC-TIK-TOT-TTC']===0) {
            // on loggue dans le JET
            dispatch(journalActions.log('327', `Note #${ newNote } offerte (${ Number(__noteData['ENC-TIK-REM-MTN'] / 100).toFixed(2) } €)`));
          }
          else {
            // son loggue dans le JET les articles offerts
            const __articlesofferts = __noteData['LIGNES'].filter(art => art['ENC-TIK-LIG-REM-TXX']===100 );
            __articlesofferts.forEach(art => {
              dispatch(journalActions.log('328', `Article #${ art['ENC-TIK-ORI-NUM'] } offert (${ Number(art['ENC-TIK-LIG-REM-TOT'] / 100).toFixed(2) } €) : Note #${ newNote }`));
            });
          }

          await commandeServices.persistNote(__noteData);
          dispatch(journalActions.log('160','Note #'+newNote));

          dispatch( signatureActions.updateSignature('notes', signatureNote.signature) );
          dispatch( signatureActions.updateNumerotation('note', note+1) );

        }


        if (!confirm.signature && !confirm.ticket) {

          const lastSignature = await signatureServices.getLastSignature('tickets');
          const newTicket = 'T'+format(new Date(),'yyMM-') + 's-' + ticket.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false});
          const signatureTicket = signatureServices.createTicketSignature({...confirm, ticket: newTicket}, privateKey, lastSignature);
          
          confirm = {
            ...confirm,
            ticket: newTicket,
            hashsource: signatureTicket.source,
            hash: signatureTicket.hash,
            signature: signatureTicket.signature
          }
          


          const __ticketData = _createTicket(confirm, {
            newTicket,
            entreprise,
            user: confirm.operator_encaissement,
            vendeur: confirm.operator,
            caisse,
            signature: signatureTicket.signature,
            trousseauId,
            hash: signatureTicket.hash,
            source: signatureTicket.source,
            operation: 'VENTE'
          });

          await commandeServices.persistTicket(__ticketData);
          dispatch(journalActions.log('160','Ticket #'+newTicket));

          dispatch(clotureActions.createGrandTotalTicket(confirm));

          dispatch( journalActions.log('140', `service externe : ${data.caisse.type} #${newTicket}`) );
          
          dispatch( signatureActions.updateSignature('tickets', signatureTicket.signature) );
          dispatch( signatureActions.updateNumerotation('ticket', ticket+1) );

          
        }


        const cmdtosync = {
          ...confirm,
          chrono: confirm.chrono || 0,
          createdAt: formatISO(confirm.createdAt),
          updatedAt: formatISO(confirm.updatedAt),
        };

        const cmd = {
          ...confirm, 
          start: formatISO(new Date()),
          end: formatISO(new Date()),
          uber: {
            display_id: payload.display_id, 
            date: format(parseISO(payload.estimated_ready_for_pickup_at), 'd MMM yyyy à HH:mm', frLocale),
            heure: format(parseISO(payload.estimated_ready_for_pickup_at), 'HH:mm', frLocale),
            eater: payload.eater
          }
        };

        commandeServices.persistCommande(cmd);


        dispatch(getTodayCommandesList());
        dispatch(notificationActions.syncDispatch("commande", confirm));
        dispatch({ type: commandeActionTypes.SET_COMMANDE_FROM_API, commande });


        dispatch(peripheralActions.printCommandeTicket('all_uber', cmd));

        dispatch(notificationActions.syncCommandes([cmdtosync]));
        dispatch(clotureActions.getTodayCa());
        //  dispatch({ type: commandeActionTypes.NEW_NUMERO, numero });
      },
      (error) => {
        logger.info(error);
        dispatch({
          type: commandeActionTypes.VALIDATE_COMMANDE_FAILURE,
          error: error.toString(),
        });
      }
    );
    return commande.ticketId;
  };
}


function setCommandeFromAPI(payload) {
  return async (dispatch, getState) => {
    const state = getState();
    let { data } = payload;

    const { ticket, note } = getState().numerotationReducer;
    const { privateKey, trousseauId } = getState().signatureReducer;
    const { entreprise } = getState().parametresReducer.parametres;
    const { user } = getState().authentication;
    const { caisse } = getState().parametresReducer.parametres.options;


    if (data.provider==="clickandcollect") {
      const datacommande = data.commande;
      data = {
        ...datacommande,
        enproduction: true,
        provider: data.provider,
        operator: {id:'clickandcollect', nom:'clickandcollect'},
        caisse: {id:'clickandcollect', nom:'clickandcollect', type:'clickandcollect'}
      };
      if (data.reglements) {
        data.operator = {id:'clickandcollect', nom:'clickandcollect'};
        data.caisse = {id:'clickandcollect', nom:'clickandcollect', type:'clickandcollect'};
        data.reglements = data.reglements.map(r => ( (r.reglementId) ? {...r} : {...r, reglementId: LodashId.createId()}) );
      }
    } 
    // commandes provenant de la borne
    else {
      if (data.status === "confirmed") {

        if (!data.operator.hasOwnProperty('uniqid')) data.operator.uniqid = data.operator.id;
        if (!data.caisse.hasOwnProperty('uniqid')) data.caisse.uniqid = data.caisse.id;

        if (!data.caisse.hasOwnProperty('type')) data.caisse.type = "borne";

        data = {
          ...data,
          enproduction: true,
          operator_encaissement: data.operator,
          caisse_encaissement: data.caisse,
          reglements: data.reglements || [
            {
              moyen: "carte",
              reglementId: LodashId.createId(),
              valeur: data.total,
            },
          ],
        };
      }
    }

    const { numero } = getState().commandeReducer;
    const { parametres } = getState().parametresReducer;

    const newnumero = await numeroServices.getNumero(numero, parametres);
      

    // si un client est renseigné
    if (data.client) {

      let client = null; 

      // on le cherche dans la base
      if (data.client.telephone || data.client.telephone2 || data.client.email) {

        client = await clientsServices.findClient({
          telephone: data.client.telephone,
          telephone2: data.client.telephone2,
          email: data.client.email
        });
        if (client._clt) dispatch({type: clientsActionTypes.FIND_CLIENT, client: client._clt});
      }

      // s'il n'existe pas on crée sa fiche
      if (client._clt===null || client._clt===undefined) {
        client._clt = await clientsServices.createClient(data.client);
        if (client._clt) dispatch({type: clientsActionTypes.CREATE_SUCCESS, client: client._clt});
      }

      // et on l'ajoute à la commande
      logger.info('cmdAct->API client', client);
      data.client = {nom: client._clt.nom, prenom: client._clt.prenom, client_id: client._clt.client_id};
      
    }

    logger.info("new numero", newnumero);
    dispatch(numeroActions.setNextNumero());

    logger.info(data);
    const commande = commandeServices.setCommandeFromAPI(
      data,
      state.catalogueReducer,
      state.parametresReducer.parametres,
      newnumero
    );

    logger.warn('data.provider',data.provider);

    // si la commande vient du Click & Collect
    if (data.provider==="clickandcollect") {
      logger.info('donc on envoie le numero de cmd au BO');
      dispatch(notificationActions.confirmCommande({ticketId: data.ticket_id, numero: commande.numero}));
    } 
   

    // activation de l'impression des tickets pour les commandes en attente
    const {print_standby} = parametres.commandes;

  

    commandeServices.saveCommande({...commande, localsync: [parametres.options.caisse.uniqid]}, state.catalogueReducer).then(
      async (confirm) => {
        // met à jour la liste des schedules (ajoute ou supprime la commande)
        dispatch({
          type: (commande.scheduled) ? commandeActionTypes.SET_SCHEDULE : commandeActionTypes.DELETE_SCHEDULE,
          schedule: commande.ticketId
        });

        dispatch( journalActions.log('140', `station tierce: ${data.caisse.type} (ticketId: ${commande.ticketId}, status:${commande.status})`) );


        if (confirm.status !== "standby") {

          if (!confirm.signaturenote && !confirm.note) {  
            const lastSignatureNote = await signatureServices.getLastSignature('notes');
            const newNote = 'N'+format(new Date(),'yyMM-') + 'c' + caisse.id + '-' + note.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false});
            const signatureNote = signatureServices.createTicketSignature({...confirm, ticket: newNote}, privateKey, lastSignatureNote);
          
            confirm = {
              ...confirm,
              note: newNote,
              hashsourcenote: signatureNote.source, 
              hashnote: signatureNote.hash,
              signaturenote: signatureNote.signature,
            }
  
  
            const __noteData = _createNote(confirm, {
              newNote,
              entreprise,
              user,
              vendeur: confirm.operator,
              caisse,
              signature: signatureNote.signature,
              trousseauId,
              hash: signatureNote.hash,
              source: signatureNote.source
            });

            // si la note est offerte
            if (__noteData['ENC-TIK-REM-MTN']>0 && __noteData['ENC-TIK-TOT-TTC']===0) {
              // on loggue dans le JET
              dispatch(journalActions.log('327', `Note #${ newNote } offerte (${ Number(__noteData['ENC-TIK-REM-MTN'] / 100).toFixed(2) } €)`));
            }
            else {
              // son loggue dans le JET les articles offerts
              const __articlesofferts = __noteData['LIGNES'].filter(art => art['ENC-TIK-LIG-REM-TXX']===100 );
              __articlesofferts.forEach(art => {
                dispatch(journalActions.log('328', `Article #${ art['ENC-TIK-ORI-NUM'] } offert (${ Number(art['ENC-TIK-LIG-REM-TOT'] / 100).toFixed(2) } €) : Note #${ newNote }`));
              });
            }
  
            await commandeServices.persistNote(__noteData);
            dispatch(journalActions.log('160','Note #'+newNote));
  
            dispatch( signatureActions.updateSignature('notes', signatureNote.signature) );
            dispatch( signatureActions.updateNumerotation('note', note+1) );
  
          }



        }
        

        if (confirm.status === "confirmed") {
          if (!confirm.signature && !confirm.ticket) {

            const lastSignature = await signatureServices.getLastSignature('tickets');
            let newTicket = 'T'+format(new Date(),'yyMM-') + '%ORIGIN%-' + ticket.toLocaleString('en-US',{minimumIntegerDigits: 5, useGrouping: false});
            const signatureTicket = signatureServices.createTicketSignature({...confirm, ticket: newTicket}, privateKey, lastSignature);
            
            if (data.provider==="clickandcollect") {
              newTicket = newTicket.replace('%ORIGIN%', 'cc');
            }
            else {
              newTicket = newTicket.replace('%ORIGIN%', 'b'+confirm.caisse.id);
            }

            confirm = {
              ...confirm,
              ticket: newTicket,
              hashsource: signatureTicket.source,
              hash: signatureTicket.hash,
              signature: signatureTicket.signature
            }


            const __ticketData = _createTicket(confirm, {
              newTicket,
              entreprise,
              user,
              vendeur: confirm.operator,
              caisse,
              signature: signatureTicket.signature,
              trousseauId,
              hash: signatureTicket.hash,
              source: signatureTicket.source,
              operation: 'VENTE'
            });

            await commandeServices.persistTicket(__ticketData);
            dispatch(journalActions.log('160','Ticket #'+newTicket));

            dispatch(clotureActions.createGrandTotalTicket(confirm));
            
            dispatch( signatureActions.updateSignature('tickets', signatureTicket.signature) );
            dispatch( signatureActions.updateNumerotation('ticket', ticket+1) );

          }

        }
        commandeServices.persistCommande(confirm);

        // sinon la commande vient de la borne
        if (data.provider!=="clickandcollect") {


          const numtosend =
            commande.numero.hex === true
              ? commande.numero.value.toString(16)
              : commande.numero.value;

          let _extrait_sign = '';
          // caractères 3, 7, 13, 19 de la signature
          if (confirm.signature) {
            _extrait_sign += confirm.signature.substring(2,3);
            _extrait_sign += confirm.signature.substring(6,7);
            _extrait_sign += confirm.signature.substring(12,13);
            _extrait_sign += confirm.signature.substring(18,19);
          }

          commandeServices.sendTicketId(
            confirm.ticketId,
            _extrait_sign,
            confirm.ticket ? confirm.ticket : '',
            numtosend,
            payload.response
          );
        }
        
        if (data.provider==="clickandcollect") {
          // dispatch(peripheralActions.printCommandeTicket((commande.status === "confirmed") ? "all" : "production", commande));
          dispatch(peripheralActions.printCommandeTicket("all", confirm));
        } else {
          if (confirm.status === "confirmed" || print_standby) {
            dispatch(peripheralActions.printCommandeTicket("production", confirm));
          }
        }





        dispatch(getTodayCommandesList());
        dispatch(notificationActions.syncDispatch("commande", confirm));
        dispatch({ type: commandeActionTypes.SET_COMMANDE_FROM_API, commande });
        dispatch(clotureActions.getTodayCa());

        if (confirm.status === "confirmed") {
          const cmdtosync = {
            ...confirm,
            chrono: confirm.chrono || 0,
            createdAt: formatISO(confirm.createdAt),
            updatedAt: formatISO(confirm.updatedAt),
          };

          dispatch(notificationActions.syncCommandes([cmdtosync]));
        }
      },
      (error) => {
        logger.info(error);
        dispatch({
          type: commandeActionTypes.VALIDATE_COMMANDE_FAILURE,
          error: error.toString(),
        });
      }
    );
    return commande.ticketId;
  };
}

// function updateCommandeReglementsCC(payload) {
//   return async (dispatch, getState) => {

//     const state = getState();
//     const { parametres } = getState().parametresReducer;
//     let { data } = payload;
//     console.log("data : ", data);
//     commandeServices.getCommandeById(data.ticket_id).then(
//       (response) => {
//         const commande = response._cmd;
   
//         const reglements = data.reglements.map(r => ({...r, reglementId: LodashId.createId()}) );

//         const newCommande = {...commande, reglements, status: "confirmed", localsync: [parametres.options.caisse.uniqid] };

//         commandeServices.persistCommande(newCommande);
//       }
//     );

//   }
// }

function getCommandesCaisses() {
  return async (dispatch) => {
    dispatch({ type: commandeActionTypes.GET_COMMANDES_CAISSES_REQUEST });

    try {
      const caisses = await commandeServices.getCommandesCaisses();
      dispatch({ type: commandeActionTypes.GET_COMMANDES_CAISSES_SUCCESS, caisses});
    } catch (err) {
      dispatch({ type: commandeActionTypes.GET_COMMANDES_CAISSES_FAILURE, error: err });
    }

  }
}

/**
 * ajout / modif de commandes depuis la synchro
 */
function setCommandeFromSync(commande) {
  return async (dispatch, getState) => {
    const { data, emitter, response } = commande;


    // on ajoute l'id de la caisse à la propriété localsync
    // et si elle n'existe pas, on crée la propriété
    const {caisse} = getState().parametresReducer.parametres.options;

    // s'il s'agit de plusieurs commandes (data est un Array)
    if (Array.isArray(data)) {


      let commandesIds = [];
      let cmdNum = 0;

      const __syncCmd = async () => {
        await asyncForEach(data, async (cmd) => {

          const {localsync} = cmd;
          let __lsync = localsync || [];
          if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);
    
          const __data = {...cmd, localsync: __lsync};
    
          let commandeconfirm = null;

          try {

            commandeconfirm = await commandeServices.setCommandeFromSync(__data);
            
            dispatch({
              type: commandeActionTypes.SET_COMMANDE_FROM_SYNC_SUCCESS,
              commandeconfirm,
            });
            cmdNum++;
            commandesIds.push(commandeconfirm.ticketId);

          } catch(err) {
            dispatch({
              type: commandeActionTypes.SET_COMMANDE_FROM_SYNC_FAILURE,
              error: err,
            });
            logger.error(err);
            
          }

          // logger.info('num',`${cmdNum}/${data.length}`);
          // logger.info('commandesIds',commandesIds);

          if (cmdNum===data.length) {
            
            // confirmation du traitement de la synchro
            if (response !== null) {
              dispatch(notificationActions.syncConfirm(response, {db:"commande", ids:commandesIds, from:caisse.uniqid}));
            } 
            // -> si 'response' est null, la synchro ne provient pas de l'API,
            // il s'agit d'une synchro d'entretien commandée par la caisse 'primary'
            else {
              dispatch(notificationActions.syncConfirmToPrimary({db:"commande", ids:commandesIds, from:caisse.uniqid}));
            }

            // -> si 'emitter' est null, la synchro provient de la caisse 'primary',
            // donc inutile de lui renvoyer la synchro
            if (emitter !== null) {
              dispatch(notificationActions.syncDispatch("commande", __data, emitter));

              // synchro de la commande avec le BO,
              // si la commande provient d'une caisse 'secondary'
              // et s'il s'agit d'une commande confirmée ou supprimée
              if (commandeconfirm.status === "confirmed" || commandeconfirm.status === "deleted") {
                const cmdtosync = {
                  ...commandeconfirm,
                  chrono: commandeconfirm.chrono || 0,
                  createdAt: formatISO(commandeconfirm.createdAt),
                  updatedAt: formatISO(commandeconfirm.updatedAt),
                };

                dispatch(notificationActions.syncCommandes([cmdtosync]));
              }
            }
            dispatch(getTodayCommandesList());
            dispatch(clotureActions.getTodayCa());
          }

        });
      }

      __syncCmd();

    } 
    // dans le cas d'une synchro de commande seule
    else {

      const {localsync} = data;
      let __lsync = localsync || [];
      if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);

      const __data = {...data, localsync: __lsync};


      let commandeconfirm = null;

      try {
        commandeconfirm = await commandeServices.setCommandeFromSync(__data);
        
        dispatch({
          type: commandeActionTypes.SET_COMMANDE_FROM_SYNC_SUCCESS,
          commandeconfirm,
        });

        // confirmation du traitement de la synchro
        if (response !== null) {
          dispatch(notificationActions.syncConfirm(response, {db:"commande", ids:[commandeconfirm.ticketId], from:caisse.uniqid}));
        } 
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // il s'agit d'une synchro d'entretien commandée par la caisse 'primary'
        else {
          dispatch(notificationActions.syncConfirmToPrimary({db:"commande", ids:[commandeconfirm.ticketId], from:caisse.uniqid}));
        }

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary',
        // donc inutile de lui renvoyer la synchro
        if (emitter !== null) {
          dispatch(notificationActions.syncDispatch("commande", __data, emitter));

          // synchro de la commande avec le BO,
          // si la commande provient d'une caisse 'secondary'
          // et s'il s'agit d'une commande confirmée ou supprimée
          if (commandeconfirm.status === "confirmed" || commandeconfirm.status === "deleted") {
            const cmdtosync = {
              ...commandeconfirm,
              chrono: commandeconfirm.chrono || 0,
              createdAt: formatISO(commandeconfirm.createdAt),
              updatedAt: formatISO(commandeconfirm.updatedAt),
            };

            dispatch(notificationActions.syncCommandes([cmdtosync]));
          }
        }
        dispatch(getTodayCommandesList());
        dispatch(clotureActions.getTodayCa());
      }
      catch (error) {
        dispatch({
          type: commandeActionTypes.SET_COMMANDE_FROM_SYNC_FAILURE,
          error: error,
        });
        logger.info("sync cmd err", error);
      }
      
      
    }
  };
}

/**
 * archivage commandes depuis la synchro
 *
 * @param {*} payload
 */
function archiveCommandesFromSync(payload) {
  return (dispatch) => {
    dispatch({ type: commandeActionTypes.ARCHIVE_FROM_SYNC_REQUEST });

    const { data, emitter, response } = payload;
    const { cmd, clotureId } = data;

    commandeServices.archiveCommands(cmd, clotureId).then(
      (confirm) => {
        dispatch({
          type: commandeActionTypes.ARCHIVE_FROM_SYNC_SUCCESS,
          ids: cmd,
        });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary',
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter !== null && response !== null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(
            notificationActions.syncDispatch(
              "archivecommandes",
              { cmd, clotureId },
              emitter
            )
          );
        }
        dispatch(getTodayCommandesList());
      },
      (error) => {
        dispatch({
          type: commandeActionTypes.ARCHIVE_FROM_SYNC_FAILURE,
          error: error.toString(),
        });
      }
    );
  };
}

function setSyncedCommandsFromSync(payload) {
  return (dispatch) => {
    dispatch({ type: commandeActionTypes.SETSYNCED_FROM_SYNC_REQUEST });
    logger.info("setSyncedCommandsFromSync()", payload);
    const { id, datetime } = payload.data;
    commandeServices.setSyncedCommands(id, datetime).then(
      (confirm) => {
        dispatch({ type: commandeActionTypes.SETSYNCED_FROM_SYNC_SUCCESS });
      },
      (error) => {
        dispatch({
          type: commandeActionTypes.SETSYNCED_FROM_SYNC_FAILURE,
          error: error,
        });
      }
    );
  };
}

/**
 * ajout de TR depuis la synchro
 */
function setTicketRestaurantFromSync(ticketrestaurant) {
  return async (dispatch, getState) => {
    dispatch({
      type: commandeActionTypes.PERSIST_TICKETRESTAU_FROM_SYNC_REQUEST,
    });

    const { data, emitter, response } = ticketrestaurant;

    // on ajoute l'id de la caisse à la propriété localsync
    // et si elle n'existe pas, on crée la propriété
    const {caisse} = getState().parametresReducer.parametres.options;
    
    // s'il s'agit de plusieurs TR (data est un Array)
    if (Array.isArray(data)) {


      let trIds = [];
      let trNum = 0;

      const __syncTR = async () => {
        await asyncForEach(data, async (tr) => {
          

          const {localsync} = tr;
          let __lsync = localsync || [];
          if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);
    
          const __data = {...tr, localsync: __lsync};
    

          try {

            await commandeServices.persistSingleTicketRestaurant(__data);

            dispatch({
              type: commandeActionTypes.PERSIST_TICKETRESTAU_FROM_SYNC_SUCCESS,
              ticketrestau: __data
            });
            trNum++;
            trIds.push(__data.id);

          } catch (err) {
            dispatch({
              type: commandeActionTypes.PERSIST_TICKETRESTAU_FROM_SYNC_FAILURE,
              error: err,
            });
            logger.info("sync tr err", err);
          }

          if (trNum===data.length) {
            
            
            // confirmation du traitement de la synchro
            if (response !== null) {
              dispatch(notificationActions.syncConfirm(response, {db:"ticketrestaurant", ids:trIds, from:caisse.uniqid}));
            } 
            // -> si 'response' est null, la synchro ne provient pas de l'API,
            // il s'agit d'une synchro d'entretien commandée par la caisse 'primary'
            else {
              dispatch(notificationActions.syncConfirmToPrimary({db:"ticketrestaurant", ids:trIds, from:caisse.uniqid}));
            }

            // -> si 'emitter' est null, la synchro provient de la caisse 'primary',
            // donc inutile de lui renvoyer la synchro
            if (emitter !== null) {
              dispatch(notificationActions.syncDispatch("ticketrestaurant", __data, emitter));
            }
            
          }

        });
      }

      __syncTR();
    
    } 
    // dans le cas d'une synchro de TR seul
    else {
      
      const {localsync} = data;
      let __lsync = localsync || [];
      if (!__lsync.includes(caisse.uniqid)) __lsync.push(caisse.uniqid);

      const __data = {...data, localsync: __lsync};


      try {

        await commandeServices.persistSingleTicketRestaurant(__data);

        dispatch({
          type: commandeActionTypes.PERSIST_TICKETRESTAU_FROM_SYNC_SUCCESS,
          ticketrestau: __data
        });
        
        // confirmation du traitement de la synchro
        if (response !== null) {
          dispatch(notificationActions.syncConfirm(response, {db:"ticketrestaurant", ids:[__data.id], from:caisse.uniqid}));
        } 
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // il s'agit d'une synchro d'entretien commandée par la caisse 'primary'
        else {
          dispatch(notificationActions.syncConfirmToPrimary({db:"ticketrestaurant", ids:[__data.id], from:caisse.uniqid}));
        }

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary',
        // donc inutile de lui renvoyer la synchro
        if (emitter !== null) {
          dispatch(notificationActions.syncDispatch("ticketrestaurant", __data, emitter));
        }
      } catch (error) {
          dispatch({
            type: commandeActionTypes.PERSIST_TICKETRESTAU_FROM_SYNC_FAILURE,
            error: error,
          });
          logger.info("sync tr err", error);
      }
    }
  };
}

export const commandeActions = {
  getCommandesList,
  getTodayCommandesList,
  checkMarketing,
  getCommande,
  setChrono,
  getPastNonConfirmed,
  confirmCommande,
  standByCommande,
  validateCommande,
  deleteCurrentCommande,
  addProduit,
  updateProduit,
  addIngredient,
  removeIngredient,
  noIngredientForStep,
  completeStep,
  uncheckItemSteps,
  updateCommande,
  updateMode,
  deleteCommande,
  addPrintnum,
  setLivreur,
  getCommandesCaisses,
  // setProductionChrono,
  setSchedule,
  checkSchedules,
  addReglement,
  removeReglement,
  addRendu,
  removeRendu,
  addTroppercu,
  archiveCommands,
  setSyncedCommands,
  addComment,
  updateComment,
  deleteComment,
  duplicata,
  addDiscount,
  updateDiscount,
  deleteDiscount,
  getLots,
  setCommandeFromOrder,
  setCommandeFromAPI,
  getAllTicketsRestaurant,
  persistTicketsRestaurants,
  setCommandeFromSync,
  archiveCommandesFromSync,
  setTicketRestaurantFromSync,
  setSyncedCommandsFromSync,
};
