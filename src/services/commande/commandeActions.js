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
        operator: user,
        caisse: caisse,
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
      if (commande.hasOwnProperty("sync")) {
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
function validateCommande(_payload) {
  return (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.VALIDATE_COMMANDE_REQUEST });

    const catalogueReducer = getState().catalogueReducer;
    const { caisse, role } = getState().parametresReducer.parametres.options;
    const { user } = getState().authentication;
    const { commande } = getState().commandeReducer;


    // logger.info('validateCommande', _payload);
    let payload = {...commande};
    logger.info('validateCommande commande', commande);

    if (payload.numero == null) {
      payload.numero = getState().commandeReducer.commande.numero;
    }

    payload.operator_encaissement = { id: user.id, nom: user.nom };
    payload.caisse_encaissement = caisse;

    payload.enproduction = payload.scheduled ? false : true;

    const payloadcopy = { ...payload, localsync: [caisse.uniqid] };
    dispatch(getCommande());

    commandeServices.saveCommande(payloadcopy, catalogueReducer).then(
      (confirm) => {

        dispatch({
          type: commandeActionTypes.VALIDATE_COMMANDE_SUCCESS,
          commande: {},
        });
        // met à jour la liste des schedules (ajoute ou supprime la commande)
        dispatch({
          type: (payloadcopy.scheduled) ? commandeActionTypes.SET_SCHEDULE : commandeActionTypes.DELETE_SCHEDULE,
          schedule: payloadcopy.ticketId
        });
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
        // dispatch(setNewNumero());
        //        logger.info('commande.createdAt', payload.createdAt);
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

// function validateCommandeAndUpdateList(payload) {
//   logger.info("commandeActions.validateCommandeAndUpdateList()");

//   return (dispatch) => {
//     // dispatch(validateCommande(payload)).then((dataFromValidate) => {
//     //   dispatch(getCommandesList())
//     // })
//     dispatch(validateCommande(payload));
//   };
// }

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

      const newnumero = await numeroActions._getNumero(parametres, numero);
      payload.numero = newnumero;

      dispatch({ type: numeroActionTypes.GET_NUMERO, numero: newnumero });
      if (parametres.options.role === "secondary") {
        dispatch(numeroActions.setNewNumero(newnumero.value));
      } else {
        dispatch(numeroActions.setNewNumero());
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

function livraisonCommande(_payload, needNumero) {
  return async (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.AENCAISSER_COMMANDE });

    const { commande } = getState().commandeReducer;
    let payload = {...commande};

    payload.status = "a_encaisser";
    payload.enproduction = payload.scheduled ? false : true;
    payload.end = new Date();
    payload.chrono =
      Math.round(differenceInMilliseconds(payload.end, payload.start) / 10) /
      100;
    logger.info(payload);
    const state = getState();

    logger.info("livraisonCommande needNumero", needNumero);

    const { parametres } = state.parametresReducer;
    if (needNumero) {
      const { numero } = state.commandeReducer;

      const newnumero = await numeroActions._getNumero(parametres, numero);

      dispatch({ type: numeroActionTypes.GET_NUMERO, numero: newnumero });
      if (parametres.options.role === "secondary") {
        dispatch(numeroActions.setNewNumero(newnumero.value));
      } else {
        dispatch(numeroActions.setNewNumero());
      }

      payload.numero = newnumero;

      logger.info("livraisonCommande nn numero", payload.numero);
    }

    logger.info("livraisonCommande numero", payload.numero);


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

          const lot_id = dispatch(addCommandeToLot(payload.ticketId, client.secteur));
          logger.info('livraisonCommande() lot_id', lot_id);

          payload.lot = lot_id;

        }
      }
    }


    // if (payload.numero==null) {
    //   payload.numero = getState().commandeReducer.commande.numero;
    // }

    const payloadcopy = { ...payload, localsync: [parametres.options.caisse.uniqid] };
   
    // si la commande à encaisser est PROGRAMMÉE,
    // on n'imprime que le ticket commande
    if (payload.scheduled && payload.enproduction===false) {
      dispatch(peripheralActions.printTicket({templates:["commande"]}));
    }
    // sinon on imprime tout
    else {
      dispatch(peripheralActions.printTicket("all"));
    }

    dispatch(getCommande());

    commandeServices.saveCommande(payloadcopy, state.catalogueReducer).then(
      (confirm) => {
        // const { user } = state.authentication;
        // const { caisse } = state.parametresReducer.parametres.options;
        // const commande = commandeServices.getNewCommande({operator:user, caisse:caisse});
        dispatch({
          type: commandeActionTypes.VALIDATE_COMMANDE_SUCCESS,
          commande: {},
        });
        // met à jour la liste des schedules (ajoute ou supprime la commande)
        dispatch({
          type: (confirm.scheduled) ? commandeActionTypes.SET_SCHEDULE : commandeActionTypes.DELETE_SCHEDULE,
          schedule: confirm.ticketId
        });
        dispatch(notificationActions.syncDispatch("commande", confirm));

        // dispatch(getCommandesList());
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

    // s'il s'agit d'un produit customisable et si on augmente la quantité
    if (addPrd && steps) {


      const items = state.commandeReducer.commande.items;
      const tva = state.catalogueReducer.tva[item.tva.tva_id];
      const steps = state.catalogueReducer.steps[item.produitid];

      const __prd = {
        produitid: item.produitid,
        nom: item.nom,
        prix: item.pu,
        composition: item.composition,
        compo: [],
        customizable: true,
        tva_id: item.tva.tva_id
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
          quantite: ing.qte
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
    const step = state.catalogueReducer.steps[item.produitid].find(
      (step) => step.step_id === stepid
    );
    const ingredient = state.catalogueReducer.ingredients[ingredientid];
    const produitSteps = state.catalogueReducer.steps[item.produitid];
    const tva = state.catalogueReducer.tva[ingredient.tva_id];

      logger.info('addIngredient', payload);

    const commandeItem = commandeServices.addIngredient(
      ingredient,
      quantite,
      step,
      item,
      produitSteps,
      tva
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
       
        const lot_id = dispatch(addCommandeToLot(commande.ticketId, client.secteur));
        logger.info('updateCommande() lot_id', lot_id);

        payload = {...payload, lot: lot_id};
        
      }
    }
    dispatch({ type: commandeActionTypes.UPDATE_COMMANDE, payload: payload, contexte: from });
    dispatch(checkMarketing());
    

  };
}

function deleteCommande(payload) {
  return (dispatch, getState) => {
    dispatch({ type: commandeActionTypes.DELETE_COMMANDE_REQUEST });

    const { commandeslist } = getState().commandesListReducer;
    const commande = Object.values(commandeslist).find(
      (cmd) => cmd.ticketId === payload.ticketId
    );

    const { ticketId, motif } = payload;

    logger.info("commande à annuler", commande);

    let error = "";
    if (!commande) error = "inconnue";
    if (commande && commande.status === "confirmed") error = "active";

    if (error === "") {
      commandeServices.deleteCommande(ticketId, motif).then(
        (data) => {
          dispatch({
            type: commandeActionTypes.DELETE_COMMANDE_SUCCESS,
            ...data,
          });
          dispatch(notificationActions.syncDispatch("commande", data));

          const cmdtosync = {
            ...data,
            chrono: data.chrono || 0,
            createdAt: formatISO(data.createdAt),
            updatedAt: formatISO(data.updatedAt),
          };

          dispatch(notificationActions.syncCommandes([cmdtosync]));

        //  dispatch(getTodayCommandesList());
        },
        (error) =>
          dispatch({
            type: commandeActionTypes.DELETE_COMMANDE_FAILURE,
            error: error,
          })
      );
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
  return (dispatch, getState) => {
    const state = getState();
    const rendus = state.commandeReducer.commande.rendus;

    const rendu = commandeServices.addRendu(payload, rendus);
    dispatch({ type: commandeActionTypes.ADD_RENDU, rendu });
  };
}
function removeRendu(payload) {
  return (dispatch, getState) => {
    //  commandeServices.removeReglement(reglementId);

    dispatch({
      type: commandeActionTypes.REMOVE_RENDU,
      renduId: payload.renduId,
    });
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
        $and: [
          {createdAt: { $gt: lastperiode_end } },
          {scheduled: { $exists: true }},
          // {scheduled: { $lte: __heure.getTime()}},
          {scheduled: { $lte: __heure}},
          {$or: [
            {enproduction: { $exists: false }},
            {enproduction: false}
          ]}
        ]
      });

      // s'il y a des commandes programmées à lancer...
      if (commandeslist && Object.entries(commandeslist).length>0) {
        logger.info('⏰ '+Object.entries(commandeslist).length+' commandes en attente devant être lancées.');

        // on lance chaque commande et on la déclare comme 'en production'
        Object.values(commandeslist).forEach(cmd => {
          dispatch(peripheralActions.printCommandeTicket('production', {...cmd, enproduction: true}));
          dispatch({
            type: commandeActionTypes.DELETE_SCHEDULE,
            schedule: cmd.ticketId
          });
        });

      // } else {
      //   logger.info('⏰ aucune commande en attente 🚫');
      }
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
      if (!lot.commandes.includes(ticketId)) {
        lot.commandes.push(ticketId);
        mode = 'create';
      }
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
    
    return lot.lot_id;
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
    const newnumero = await numeroActions._getNumero(parametres, numero);

    logger.info("new numero", newnumero);
    // dispatch({ type: numeroActionTypes.GET_NUMERO, numero: newnumero });
    dispatch(numeroActions.setNewNumero());

    // logger.info(data);
    const commande = commandeServices.setCommandeFromOrder(
      data,
      state.catalogueReducer,
      state.parametresReducer.parametres,
      newnumero
    );

    // dispatch(numeroActions.takeNumero());

    commandeServices.saveCommande({...commande, localsync: [parametres.options.caisse.uniqid]}, state.catalogueReducer).then(
      (confirm) => {

        // met à jour la liste des schedules (ajoute ou supprime la commande)
        dispatch({
          type: (commande.scheduled) ? commandeActionTypes.SET_SCHEDULE : commandeActionTypes.DELETE_SCHEDULE,
          schedule: commande.ticketId
        });

        dispatch(getTodayCommandesList());
        dispatch(notificationActions.syncDispatch("commande", confirm));
        dispatch({ type: commandeActionTypes.SET_COMMANDE_FROM_API, commande });

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

    if (data.provider==="clickandcollect") {
      const datacommande = data.commande;
      data = {
        ...datacommande,
        enproduction: true,
        provider: data.provider,
        operator: {id:'clickandcollect', nom:'clickandcollect'},
        caisse: {id:'clickandcollect', nom:'clickandcollect'}
      };
      if (data.reglements) {
        data.reglements = data.reglements.map(r => ( (r.reglementId) ? {...r} : {...r, reglementId: LodashId.createId()}) );
      }
    } else {
      if (data.status === "confirmed") {

        if (!data.operator.hasOwnProperty('uniqid')) data.operator.uniqid = data.operator.id;
        if (!data.caisse.hasOwnProperty('uniqid')) data.caisse.uniqid = data.caisse.id;

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
    const newnumero = await numeroActions._getNumero(parametres, numero);


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
    // dispatch({ type: numeroActionTypes.GET_NUMERO, numero: newnumero });
    dispatch(numeroActions.setNewNumero());

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
    // sinon la commande vient de la borne
    else {
      

      const numtosend =
        commande.numero.hex === true
          ? commande.numero.value.toString(16)
          : commande.numero.value;

      commandeServices.sendTicketId(
        commande.ticketId,
        numtosend,
        payload.response
      );
    }

    // activation de l'impression des tickets pour les commandes en attente
    const {print_standby} = parametres.commandes;

    if (data.provider==="clickandcollect") {
      // dispatch(peripheralActions.printCommandeTicket((commande.status === "confirmed") ? "all" : "production", commande));
      dispatch(peripheralActions.printCommandeTicket("all", commande));
    } else {
      if (commande.status === "confirmed" || print_standby) {
        dispatch(peripheralActions.printCommandeTicket("production", commande));
      }
    }

    commandeServices.saveCommande({...commande, localsync: [parametres.options.caisse.uniqid]}, state.catalogueReducer).then(
      (confirm) => {
        // met à jour la liste des schedules (ajoute ou supprime la commande)
        dispatch({
          type: (commande.scheduled) ? commandeActionTypes.SET_SCHEDULE : commandeActionTypes.DELETE_SCHEDULE,
          schedule: commande.ticketId
        });
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
  // setNewNumero,
  // resetNumero,
  checkMarketing,
  getCommande,
  setChrono,
  validateCommande,
  // validateCommandeAndUpdateList,
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
  archiveCommands,
  setSyncedCommands,
  addComment,
  updateComment,
  deleteComment,
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
  // getNumeroAPI,
  // getNumero,
  // loadNumero
};
