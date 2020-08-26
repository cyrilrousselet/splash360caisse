import { commandeActionTypes } from './commandeActionTypes';
import { commandeServices } from './commandeServices';
import { differenceInMilliseconds, sub, differenceInMinutes, isBefore, endOfYesterday, parseISO, format, formatISO } from 'date-fns';
import { peripheralActions } from '../peripheral/peripheralActions';
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import Logger from '../../helpers/Logger';
import { notificationActions } from '../notification/notificationActions';
import { notificationServices } from '../notification/notificationServices';
import { differenceBy } from 'lodash';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const logger = new Logger();


function getCommandesList(params={}) {

  logger.log('CmdA.getCommandesList()');

  return dispatch => {
    dispatch({ type: commandeActionTypes.GET_ALLCOMMANDES_REQUEST });

    commandeServices.getCommandesList(params)
    .then(
        data => { dispatch({ type: commandeActionTypes.GET_ALLCOMMANDES_SUCCESS, ...data }) }
    )
    .catch(
      error => { dispatch({ type: commandeActionTypes.GET_ALLCOMMANDES_FAILURE, error: error.toString() }) }
    );
  }
}


function getAllTicketsRestaurant() {
  return dispatch => {
    dispatch({ type: commandeActionTypes.GETALL_TICKETSRESTAU_REQUEST });
    commandeServices.getAllTicketsRestaurant()
    .then(
      data => dispatch({ type: commandeActionTypes.GETALL_TICKETSRESTAU_SUCCESS, ...data }),
      error => dispatch({ type: commandeActionTypes.GET_TICKETRESTAU_FAILURE, error: error })
    );
  }
}


function persistTicketsRestaurants(liste) {
  return dispatch => {
    dispatch({ type: commandeActionTypes.PERSIST_TICKETRESTAU_REQUEST });

    commandeServices.persistTicketsRestaurants(liste)
    .then(
      data => {
        dispatch({type: commandeActionTypes.PERSIST_TICKETRESTAU_SUCCESS});
        dispatch( getAllTicketsRestaurant());
        dispatch(notificationActions.syncDispatch('ticketrestaurant',liste));
      },
      error => dispatch({ type: commandeActionTypes.PERSIST_TICKETRESTAU_FAILURE, error: error })
    );
  }
}


function getNumero() {
  return (dispatch, getState) => {
    

    const {options} = getState().parametresReducer.parametres;
    if (options.role==='secondary') {
      dispatch(notificationActions.getNewNumero());
    } else {
      const {numero} = getState().commandeReducer;
      const nnumero = numero ? numero : commandeServices.getNewNumero( getState().parametresReducer.parametres, null);
      logger.log('getNumero()', nnumero);
      
      dispatch({type: commandeActionTypes.GET_NUMERO, numero: nnumero});
      dispatch(setNewNumero());
    }

  }
}


function resetNumero(val) {
  return (dispatch, getState) => {
    const {commande} = getState().commandeReducer;
    const { numerotation_start } = getState().parametresReducer.parametres.commandes;
    dispatch(setNewNumero(numerotation_start));
    if (commande.hasOwnProperty('ticketId')) {
      dispatch(getNumero());
    }
  }
}


function setNewNumero(defaultValue=null) {

  return (dispatch, getState) => {

    logger.log('setNewNumero',defaultValue);

    const numero = defaultValue!==null ? {value: defaultValue-1, updated: new Date} : getState().commandeReducer.numero; 

    const newnumero = commandeServices.getNewNumero( getState().parametresReducer.parametres, numero);
    dispatch({ type: commandeActionTypes.SET_NEW_NUMERO, newnumero });

  }
}

/**
 * Recupere la commande à partir de son ID 
 * ou crée une nouvelle commande si aucun ID n'est passé en paramètre
 * @param {*} commandeId 
 */
function getCommande(commandeId=null) {
  return (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.GET_COMMANDE_REQUEST, id:commandeId });

    logger.log('CmdA.getCommande()', commandeId);
    // sans id de commande, on crée une nouvelle commande
    if (null===commandeId) {
      logger.log('on demande une nouvelle commande');
      const state = getState();
      const { user } = state.authentication;
      const { caisse } = state.parametresReducer.parametres.options;
      const commande = commandeServices.getNewCommande({operator:user, caisse:caisse});
      dispatch({ type: commandeActionTypes.GET_COMMANDE_SUCCESS, commande });
  //    dispatch(getNumero());
    }
    // avec id de commande, on va chercher la commande en base
    else {
      logger.log('on va chercher la commande #'+commandeId);
      commandeServices.getCommandeById(commandeId)
      .then(
        response => {
          const commande = response._cmd;
          dispatch({ type: commandeActionTypes.GET_COMMANDE_SUCCESS, commande });
        },
        error => dispatch({ type: commandeActionTypes.GET_COMMANDE_FAILURE, error: error.toString() })
      );
    }
  }
}

// payload = commande à sauvegarder
function validateCommande(payload) {
  return (dispatch, getState) => {

    dispatch({ type: commandeActionTypes.VALIDATE_COMMANDE_REQUEST });

   // payload.status = 'confirmed';
    const catalogueReducer = getState().catalogueReducer;
    const { caisse } = getState().parametresReducer.parametres.options;
    const { user } = getState().authentication;

    // if (payload.numero==null) { 
      //   const numero = commandeServices.getNewNumero(getState().parametresReducer.parametres, getState().commandeReducer.numero);
      //   payload.numero = numero;
      //   dispatch({ type: commandeActionTypes.NEW_NUMERO, numero });
      // }
    if (payload.numero==null) { 
      payload.numero = getState().commandeReducer.commande.numero;
    }
    

    payload.operator_encaissement = {id: user.id, nom: user.nom};
    payload.caisse_encaissement = caisse;


    const payloadcopy = {...payload};
    dispatch(getCommande());
    
    commandeServices.saveCommande(payloadcopy, catalogueReducer)
    .then(
      confirm => {
      //  const commande = commandeServices.getNewCommande({operator:{id: user.id, nom: user.nom}, caisse: caisse});
        dispatch({ type: commandeActionTypes.VALIDATE_COMMANDE_SUCCESS, commande:{}});
        dispatch(notificationActions.syncDispatch('commande',confirm));

        const cmdtosync = {
          ...confirm,
          createdAt: formatISO(confirm.createdAt),
          updatedAt: formatISO(confirm.updatedAt)
        };

        dispatch(notificationActions.syncCommandes([cmdtosync]));
        // dispatch(setNewNumero());
//        logger.log('commande.createdAt', payload.createdAt);
        // s'il y a un numéro de commande, c'est qu'on encaisse une commande déjà réglée
        // donc on met à jour la liste des commande
        if (payload.createdAt) dispatch(getCommandesList());
      },
      error => {
        logger.log(error);
        dispatch({ type:commandeActionTypes.VALIDATE_COMMANDE_FAILURE, error: error })
      }
    );
    
  }
}

function validateCommandeAndUpdateList(payload) {

  logger.log('commandeActions.validateCommandeAndUpdateList()');

  return (dispatch) => {
    // dispatch(validateCommande(payload)).then((dataFromValidate) => {
    //   dispatch(getCommandesList())
    // })
    dispatch(validateCommande(payload));
  }
}

function standByCommande(payload) {

  return (dispatch, getState) => {

    dispatch({ type: commandeActionTypes.STANDBY_COMMANDE });

    payload.status = 'standby';
    payload.end = new Date();
    payload.chrono = Math.round(differenceInMilliseconds(payload.end, payload.start)/10)/100;
    logger.log(payload);
    const state = getState();

    // if (payload.numero==null) { 
    //   const numero = commandeServices.getNewNumero(state.parametresReducer.parametres, state.commandeReducer.numero);
    //   payload.numero = numero;
    //   dispatch({ type: commandeActionTypes.NEW_NUMERO, numero });
    // }
    if (payload.numero==null) { 
      payload.numero = getState().commandeReducer.commande.numero;
    }
    
    commandeServices.saveCommande(payload, state.catalogueReducer)
    .then(
      confirm => {
        // const { user } = state.authentication;
        // const { caisse } = state.parametresReducer.parametres.options;

        // const commande = commandeServices.getNewCommande({operator:user, caisse:caisse});
        dispatch({ type: commandeActionTypes.VALIDATE_COMMANDE_SUCCESS, commande:{}});
        dispatch(notificationActions.syncDispatch('commande',confirm));
        dispatch(getCommande());
        // dispatch(getCommandesList());
      },
      error => {
        logger.log(error);
        dispatch({ type:commandeActionTypes.VALIDATE_COMMANDE_FAILURE, error: error.toString() })
      }
    );
    
  }
}

function livraisonCommande(payload) {

  return (dispatch, getState) => {

    dispatch({ type: commandeActionTypes.AENCAISSER_COMMANDE });

    payload.status = 'a_encaisser';
    payload.end = new Date();
    payload.chrono = Math.round(differenceInMilliseconds(payload.end, payload.start)/10)/100;
    logger.log(payload);
    const state = getState();

    // if (payload.numero==null) { 
    //   const numero = commandeServices.getNewNumero(state.parametresReducer.parametres, state.commandeReducer.numero);
    //   payload.numero = numero
    //   dispatch({ type: commandeActionTypes.NEW_NUMERO, numero });
    // }
    if (payload.numero==null) { 
      payload.numero = getState().commandeReducer.commande.numero;
    }

    const payloadcopy = {...payload};
    dispatch(peripheralActions.printTicket('all'));
    dispatch(getCommande());
    
    commandeServices.saveCommande(payloadcopy, state.catalogueReducer)
    .then(
      confirm => {
        // const { user } = state.authentication;
        // const { caisse } = state.parametresReducer.parametres.options;
        // const commande = commandeServices.getNewCommande({operator:user, caisse:caisse});
        dispatch({ type: commandeActionTypes.VALIDATE_COMMANDE_SUCCESS, commande:{}});
        dispatch(notificationActions.syncDispatch('commande',confirm));
        
        // dispatch(getCommandesList());
      },
      error => {
        logger.log(error);
        dispatch({ type:commandeActionTypes.VALIDATE_COMMANDE_FAILURE, error: error })
      }
    );
    
  }
}


function deleteCurrentCommande() {
  return (dispatch) => {
    dispatch({ type: commandeActionTypes.DELETE_CURRENT_COMMANDE });
  }
}

function addProduit(payload) {

  return (dispatch, getState) => {
    
    const state = getState();
    const items = state.commandeReducer.commande.items;
    const tva = state.catalogueReducer.tva[payload.tva_id];
    const steps = state.catalogueReducer.steps[payload.produitid];
    
    const composition = Object.entries(payload.composition).map(([ingid,qte]) => (
        {
          ingredient: ingid,
          qte: qte, 
          type: state.catalogueReducer.ingredients[ingid].type, 
          tva: state.catalogueReducer.tva[state.catalogueReducer.ingredients[ingid].tva_id],
          prix: Number(state.catalogueReducer.ingredients[ingid].supplement),
          nom: state.catalogueReducer.ingredients[ingid].nom,
          fromStep: null 
        }


        /*

      ingredient: ingredient.id, 
      type: ingredient.type, 
      qte: 1, 
      prix: Number(ingredient.supplement), 
      nom: ingredient.nom, 
      fromStep:step.step_id,
      tva: tva
        */
    ));
    payload = {...payload, composition};

    const { commandeItem, mode } = commandeServices.addProduit(payload, tva, items, steps);
    
    if ('add'===mode) dispatch({ type: commandeActionTypes.ADD_PRODUIT, commandeItem });
    if ('update'===mode) dispatch({ type: commandeActionTypes.UPDATE_PRODUIT, commandeItem });
  }
}

function updateProduit(payload) {

  return (dispatch, getState) => {

    const { itemid } = payload;
    const state = getState();
    const item = state.commandeReducer.commande.items.find(itm => itm.itemid === itemid);

    const { commandeItem, mode } = commandeServices.updateProduit(payload, item);

    if ('update'===mode) dispatch({ type: commandeActionTypes.UPDATE_PRODUIT, commandeItem });
    if ('delete'===mode) dispatch({ type: commandeActionTypes.DELETE_PRODUIT, commandeItem });

  }
}

function addIngredient(payload) {

  return (dispatch, getState) => {

    const { itemid, stepid, ingredientid, quantite } = payload;
    const state = getState();
    const item = state.commandeReducer.commande.items.find(itm => itm.itemid === itemid);
    const step = state.catalogueReducer.steps[item.produitid].find(step => step.step_id === stepid);
    const ingredient = state.catalogueReducer.ingredients[ingredientid];
    const produitSteps = state.catalogueReducer.steps[item.produitid];
    const tva = state.catalogueReducer.tva[ingredient.tva_id];

    const commandeItem = commandeServices.addIngredient(ingredient, quantite, step, item, produitSteps, tva);
    dispatch({ type: commandeActionTypes.ADD_INGREDIENT, commandeItem });
  }
}

function removeIngredient(payload) {

  return (dispatch, getState) => {

    const { itemid, stepid, ingredientid, quantite } = payload;
    const state = getState();
    const item = state.commandeReducer.commande.items.find(itm => itm.itemid === itemid);
    const step = state.catalogueReducer.steps[item.produitid].find(step => step.step_id === stepid);
    const ingredient = state.catalogueReducer.ingredients[ingredientid];
    const produitSteps = state.catalogueReducer.steps[item.produitid];

    const commandeItem = commandeServices.removeIngredient(ingredient, quantite, step, item, produitSteps);
    dispatch({ type: commandeActionTypes.REMOVE_INGREDIENT, commandeItem });
  }
}

function noIngredientForStep(payload) {

  return (dispatch, getState) => {


    logger.log(payload);

    const { itemid, stepid } = payload;
    const state = getState();
    const item = state.commandeReducer.commande.items.find(itm => itm.itemid === itemid);
    const step = state.catalogueReducer.steps[item.produitid].find(step => step.step_id === stepid);
    const produitSteps = state.catalogueReducer.steps[item.produitid];

    const commandeItem = commandeServices.noIngredientForStep(step, item, produitSteps);
    dispatch({ type: commandeActionTypes.STEP_NOINGREDIENT, commandeItem });
  }
}

function completeStep(payload) {
  return (dispatch, getState)  => {

    logger.log('CmdA.completeStep()', payload);
    
    const { itemid, stepid } = payload;
    const state = getState();
    const item = state.commandeReducer.commande.items.find(itm => itm.itemid === itemid);
    const step = state.catalogueReducer.steps[item.produitid].find(step => step.step_id === stepid);
    const produitSteps = state.catalogueReducer.steps[item.produitid];

    commandeServices.completeStep(step, item, produitSteps)
    .then(commandeItem => {
      dispatch({ type: commandeActionTypes.STEP_COMPLETE, commandeItem });
    })
  }
}

function uncheckItemSteps(payload) {
  return (dispatch, getState) => {
    const { itemid, stepid } = payload;
    const item = getState().commandeReducer.commande.items.find(itm => itm.itemid===itemid);

    const commandeItem = commandeServices.uncheckItemSteps(item, stepid);
    dispatch({ type: commandeActionTypes.STEP_UNCOMPLETE, commandeItem });
  }
}


function updateCommande(payload) {
  return (dispatch) => {
    logger.log(payload);
    dispatch({ type: commandeActionTypes.UPDATE_COMMANDE, payload });
  }
}

function deleteCommande(payload) {
  return (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.DELETE_COMMANDE_REQUEST });

    const { commandeslist } = getState().commandesListReducer;
    const commande = Object.values(commandeslist).find(cmd => cmd.ticketId==payload.ticketId);

    const {ticketId, motif} = payload;

    logger.log('commande à annuler', commande);

    let error = '';
    if (!commande) error = 'inconnue';
    if (commande && commande.status==='confirmed') error = 'active';

    if (error==='') {
      commandeServices.deleteCommande(ticketId, motif)
      .then(
        data => {
          dispatch({ type: commandeActionTypes.DELETE_COMMANDE_SUCCESS, ...data });
          dispatch(notificationActions.syncDispatch('commande', data));
          
          const cmdtosync = {
            ...data,
            createdAt: formatISO(data.createdAt),
            updatedAt: formatISO(data.updatedAt)
          };
  
          dispatch(notificationActions.syncCommandes([cmdtosync]));

          dispatch(getCommandesList());
        },
        error => dispatch({ type: commandeActionTypes.DELETE_COMMANDE_FAILURE, error: error })
      );
    } else {
      logger.error('deleteCommande('+payload.ticketId+') error', 'Impossible de supprimer une commande qui n’est pas en attente.')
    }

  }
}

function setLivreur(payload) {
  return (dispatch, getState) => {

    const {commandeId, livreur} = payload;

    const { commandeslist } = getState().commandesListReducer;
    const commande = Object.values(commandeslist).find(cmd => cmd.ticketId==commandeId);

    commandeServices.persistCommande({...commande, livreur:livreur})
    .then(
      data => {
        dispatch({ type: commandeActionTypes.UPDATE_COMMANDE, payload:{livreur:livreur} });
        dispatch(notificationActions.syncDispatch('commande',{...commande, livreur:livreur}));
        dispatch(getCommandesList())
      },
      error => dispatch({ type: commandeActionTypes.UPDATE_COMMANDE_ERROR, error: error})
    );
  }
}

// function setProductionChrono(payload) {
//   return (dispatch, getState) => {
//     const {ticketId, careTime, endTime} = payload;
//     const { commandeslist } = getState().commandesListReducer;
//     const commande = Object.values(commandeslist).find(cmd => cmd.ticketId==ticketId);

//     const waitChrono = Math.round(differenceInMilliseconds(careTime.firstCare, parseISO(commande.end))/10)/100;
//     const prodChrono = Math.round(differenceInMilliseconds(endTime, careTime.firstCare)/10)/100;

//     Object.keys(careTime).forEach(k=> careTime[k] = formatISO(careTime[k]));

//     commandeServices.persistCommande({...commande, prodChrono:prodChrono, waitChrono:waitChrono, care: careTime, finish: formatISO(endTime)})
//     .then(
//       data => {
//         dispatch({ type: commandeActionTypes.UPDATE_COMMANDE, payload:{prodChrono:prodChrono, waitChrono:waitChrono, care: careTime, finish:endTime} });
//         dispatch(notificationActions.syncDispatch('commande',{...commande, prodChrono:prodChrono, waitChrono:waitChrono, care: careTime, finish:endTime}));
//         dispatch(getCommandesList())
//       },
//       error => dispatch({ type: commandeActionTypes.UPDATE_COMMANDE_ERROR, error: error})
//     );

//   }
// }

function addReglement(payload) {
  return (dispatch, getState) => {
    const state = getState();
    const reglements = state.commandeReducer.commande.reglements;

    const reglement = commandeServices.addReglement(payload, reglements);
    dispatch({ type: commandeActionTypes.ADD_REGLEMENT, reglement });
  }
}

function removeReglement(payload) {
  return (dispatch, getState) => {

  //  commandeServices.removeReglement(reglementId);

    dispatch({ type: commandeActionTypes.REMOVE_REGLEMENT, reglementId: payload.reglementId });
    
  }
}

function addRendu(payload) {
  return (dispatch, getState) => {
    const state = getState();
    const rendus = state.commandeReducer.commande.rendus;

    const rendu = commandeServices.addRendu(payload, rendus);
    dispatch({ type: commandeActionTypes.ADD_RENDU, rendu });
  }
}
function removeRendu(payload) {
  return (dispatch, getState) => {

  //  commandeServices.removeReglement(reglementId);

    dispatch({ type: commandeActionTypes.REMOVE_RENDU, renduId: payload.renduId });
    
  }
}

function addComment(payload) {
  return (dispatch, getState) => {
    const comments = getState().commandeReducer.commande.comments;

    const comment = commandeServices.addComment(payload, comments);
    dispatch({ type: commandeActionTypes.ADD_COMMENT, comment });
  }
}
function updateComment(payload) {
  return (dispatch, getState) => {
    const {commentId, texte} = payload;
    logger.log('CommandeActions.updateComment', payload);
    dispatch({ type: commandeActionTypes.UPDATE_COMMENT, payload: payload });
  }
}
function deleteComment(payload) {
  return (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.DELETE_COMMENT, commentId: payload.commentId });
  }
}

function addDiscount(payload) {
  return (dispatch, getState) => {
    const modificateurs = getState().commandeReducer.commande.modificateurs;

    const modificateur = commandeServices.addModificateur(payload, modificateurs);
    dispatch({ type: commandeActionTypes.ADD_DISCOUNT, modificateur });
  }
}
function updateDiscount(payload) {
  return (dispatch, getState) => {
    const {discountId, valeur} = payload;
    logger.log('CommandeActions.updateDiscount', payload);
    dispatch({ type: commandeActionTypes.UPDATE_DISCOUNT, payload: payload });
  }
}
function deleteDiscount(payload) {
  return (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.DELETE_DISCOUNT, discountId: payload.discountId });
  }
}

function archiveCommands(payload) {

  return (dispatch) => {

    dispatch({ type: commandeActionTypes.ARCHIVE_REQUEST });

    const {cmd,clotureId} = payload;

    commandeServices.archiveCommands(cmd,clotureId)
    .then(
      confirm => {
        dispatch({ type: commandeActionTypes.ARCHIVE_SUCCESS, ids:cmd });
        dispatch(notificationActions.syncDispatch('archivecommandes', {cmd, clotureId}));
        dispatch(getCommandesList());
      },
      error => {
        dispatch({ type: commandeActionTypes.ARCHIVE_FAILURE, error: error.toString() });
      }
    );
  }

}


function setSyncedCommands(payload) {
  return dispatch => {
    dispatch({ type: commandeActionTypes.SETSYNCED_REQUEST });
    logger.log('setSyncedCommands()', payload);
    const {id, datetime} = payload;
    commandeServices.setSyncedCommands(id,datetime)
    .then(
      confirm => {
        dispatch({ type: commandeActionTypes.SETSYNCED_SUCCESS });
        dispatch(notificationActions.syncDispatch('setsyncedcommandes', {id, datetime}));
      },
      error => {
        dispatch({ type: commandeActionTypes.SETSYNCED_FAILURE, error: error });
      }
    );

  }
}


function setCommandeFromOrder(provider, payload) {
  return (dispatch, getState) => {


    logger.log('setCommmandeFromOrder()');

    const state = getState();

    let data = {
      ...payload,
      operator: {id:-1, nom:'UberEats'},
      caisse: {id: -1, nom:'UberEats'},
      operator_encaissement: {id:-1, nom:'UberEats'}, 
      caisse_encaissement: {id: -1, nom:'UberEats'},
      reglements: [{moyen: 'uber', reglementId: new Date().getTime(), valeur: payload.payment.charges.sub_total.amount/100}]
    };
    


   // logger.log(data);
    const commande = commandeServices.setCommandeFromOrder(data, state.catalogueReducer, state.parametresReducer.parametres, state.commandeReducer.numero);

    const cmd = {
      ...commande, 
      uber: {
        display_id: payload.display_id, 
        date: format(parseISO(payload.estimated_ready_for_pickup_at), 'd MMM yyyy à HH:mm', frLocale),
        heure: format(parseISO(payload.estimated_ready_for_pickup_at), 'HH:mm', frLocale),
        eater: payload.eater
      }
    };

    dispatch(getNumero());

    dispatch(peripheralActions.printCommandeTicket('all_uber', cmd));

    commandeServices.saveCommande(commande, state.catalogueReducer)
    .then(
      confirm => {
        dispatch(getCommandesList());
        dispatch(notificationActions.syncDispatch('commande',confirm));
        dispatch({ type: commandeActionTypes.SET_COMMANDE_FROM_API, commande });
        const { numero } = commande;

        const cmdtosync = {
          ...confirm,
          createdAt: formatISO(confirm.createdAt),
          updatedAt: formatISO(confirm.updatedAt)
        };

        dispatch(notificationActions.syncCommandes([cmdtosync]));
      //  dispatch({ type: commandeActionTypes.NEW_NUMERO, numero });
      },
      error => {
        logger.log(error);
        dispatch({ type:commandeActionTypes.VALIDATE_COMMANDE_FAILURE, error: error.toString() })
      }
    );
    return commande.ticketId;

  }
}


function setCommandeFromAPI(payload) {
  return (dispatch, getState) => {

    const state = getState();
    let { data } = payload;

    if (data.status=='confirmed') {

      data = {
        ...data,
        operator_encaissement: data.operator, 
        caisse_encaissement: data.caisse,
        reglements: data.reglements || [{moyen: 'carte', reglementId: new Date().getTime(), valeur: data.total}]
      };
    }


    logger.log(data);
    const commande = commandeServices.setCommandeFromAPI(data, state.catalogueReducer, state.parametresReducer.parametres, state.commandeReducer.numero);

    commandeServices.sendTicketId(commande.ticketId, commande.numero, payload.response);

    dispatch(getNumero());

    commandeServices.saveCommande(commande, state.catalogueReducer)
    .then(
      confirm => {
        dispatch(getCommandesList());
        dispatch(notificationActions.syncDispatch('commande',confirm));
        dispatch({ type: commandeActionTypes.SET_COMMANDE_FROM_API, commande });
        const { numero } = commande;
      //  dispatch({ type: commandeActionTypes.NEW_NUMERO, numero });

        const cmdtosync = {
          ...confirm,
          createdAt: formatISO(confirm.createdAt),
          updatedAt: formatISO(confirm.updatedAt)
        };

        dispatch(notificationActions.syncCommandes([cmdtosync]));
      },
      error => {
        logger.log(error);
        dispatch({ type:commandeActionTypes.VALIDATE_COMMANDE_FAILURE, error: error.toString() })
      }
    );
    return commande.ticketId;
  }
}


function getNumeroAPI(response) {

  return (dispatch, getState) => {

    logger.log('getNumeroAPI()');

    const numero = getState().commandeReducer.numero;
    const {commande} = getState().commandeReducer;

    dispatch(notificationActions.sendNumero({numero, response}));

    if (commande.hasOwnProperty('ticketId')) {
      dispatch(getNumero());
    } else {
      dispatch(setNewNumero());
    }



  }
}


/** 
 * ajout / modif de commandes depuis la synchro
 */
function setCommandeFromSync(commande) {
  return dispatch => {

    const {data, emitter, response} = commande;

    commandeServices.setCommandeFromSync(data)
    .then(
      confirm => {
        dispatch({ type: commandeActionTypes.SET_COMMANDE_FROM_SYNC_SUCCESS, confirm });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('commande',data, emitter));

          // synchro de la commande avec le BO,
          // si la commande provient d'une caisse 'secondary'
          // et s'il s'agit d'une commande confirmée ou supprimée
          if (confirm.status==="confirmed" || confirm.status==="deleted") {

            const cmdtosync = {
              ...confirm,
              createdAt: formatISO(confirm.createdAt),
              updatedAt: formatISO(confirm.updatedAt)
            };
            
            dispatch(notificationActions.syncCommandes([cmdtosync]));
          }
        }
        dispatch(getCommandesList());
      },
      error => {
        dispatch({ type: commandeActionTypes.SET_COMMANDE_FROM_SYNC_FAILURE, error: error });
        logger.log('sync cmd err', error);
      }
    )
  }
}

/**
 * archivage commandes depuis la synchro
 * 
 * @param {*} payload 
 */
function archiveCommandesFromSync(payload) {

  return (dispatch) => {

    dispatch({ type: commandeActionTypes.ARCHIVE_FROM_SYNC_REQUEST });

    const {cmd, clotureId, emitter, response} = payload.data;

    commandeServices.archiveCommands(cmd,clotureId)
    .then(
      confirm => {
        dispatch({ type: commandeActionTypes.ARCHIVE_FROM_SYNC_SUCCESS, ids:cmd });

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('archivecommandes',{cmd, clotureId}, emitter));
        }
        dispatch(getCommandesList());
      },
      error => {
        dispatch({ type: commandeActionTypes.ARCHIVE_FROM_SYNC_FAILURE, error: error.toString() });
      }
    );
  }

}



function setSyncedCommandsFromSync(payload) {
  return dispatch => {
    dispatch({ type: commandeActionTypes.SETSYNCED_FROM_SYNC_REQUEST });
    logger.log('setSyncedCommandsFromSync()', payload);
    const {id, datetime, emitter, response} = payload.data;
    commandeServices.setSyncedCommands(id,datetime)
    .then(
      confirm => {
        dispatch({ type: commandeActionTypes.SETSYNCED_FROM_SYNC_SUCCESS });
      },
      error => {
        dispatch({ type: commandeActionTypes.SETSYNCED_FROM_SYNC_FAILURE, error: error });
      }
    );

  }
}


/**
 * ajout de TR depuis la synchro
 */
function setTicketRestaurantFromSync(ticketrestaurant) {
  return dispatch => {
    dispatch({ type: commandeActionTypes.PERSIST_TICKETRESTAU_FROM_SYNC_REQUEST }); 
  
    const {data, emitter, response} = ticketrestaurant;

    commandeServices.persistTicketsRestaurants(data)
    .then(
      result => {
        dispatch({type: commandeActionTypes.PERSIST_TICKETRESTAU_FROM_SYNC_SUCCESS});
        dispatch( getAllTicketsRestaurant());

        // -> si 'emitter' est null, la synchro provient de la caisse 'primary', 
        // donc inutile de lui renvoyer la synchro
        // -> si 'response' est null, la synchro ne provient pas de l'API,
        // donc inutile de confirmer le traitement de la synchro
        if (emitter!==null && response!==null) {
          dispatch(notificationActions.syncConfirm(response));
          dispatch(notificationActions.syncDispatch('ticketrestaurant',data, emitter));
        }
      },
      error => dispatch({ type: commandeActionTypes.PERSIST_TICKETRESTAU_FROM_SYNC_FAILURE, error: error })
    );
  }
}

export const commandeActions = {
  getCommandesList,
  setNewNumero,
  resetNumero,
  getCommande,
  validateCommande,
  validateCommandeAndUpdateList,
  standByCommande,
  livraisonCommande,
  deleteCurrentCommande,
  addProduit,
  updateProduit,
  addIngredient,
  removeIngredient,
  noIngredientForStep,
  completeStep,
  uncheckItemSteps,
  updateCommande,
  deleteCommande,
  setLivreur,
  // setProductionChrono,
  addReglement,
  removeReglement,
  addRendu,
  removeRendu,
  archiveCommands,
  setSyncedCommands,
  addComment,
  updateComment,
  deleteComment,
  addDiscount,
  updateDiscount,
  deleteDiscount,
  setCommandeFromOrder,
  setCommandeFromAPI,
  getAllTicketsRestaurant,
  persistTicketsRestaurants,
  setCommandeFromSync,
  archiveCommandesFromSync,
  setTicketRestaurantFromSync,
  setSyncedCommandsFromSync,
  getNumeroAPI,
  getNumero
};