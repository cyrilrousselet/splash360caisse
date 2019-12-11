import { commandeActionTypes } from './commandeActionTypes';

const initialState = {
  loading: false,
  error: null,
  commande: {}
}

export function commandeReducer(state = initialState, action) {

  const { commande } = state;
  let items = []
    , commandeitem = {}
    , itmIndex = -1
    , itm = {}
    , reglements = []
    , rglIndex = -1
    , rgl = {}
    , rendus = []
    , rndIndex = -1
    , rnd = {}
    ;

  switch (action.type) {
    case commandeActionTypes.GET_COMMANDE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case commandeActionTypes.GET_COMMANDE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        commande: action.commande
      };

    case commandeActionTypes.GET_COMMANDE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error
      };

    case commandeActionTypes.ADD_PRODUIT:

      items = commande.items;
      items.push(action.commandeItem);

      return {
        ...state,
        commande: {...commande, items}
      }

    case commandeActionTypes.UPDATE_PRODUIT:

      items = commande.items;
      commandeitem = action.commandeItem;
      itmIndex = items.findIndex((obj => obj.itemid === commandeitem.itemid));
      itm = items[itmIndex];
      items[itmIndex] = {...itm, quantite: commandeitem.quantite, commentaire: commandeitem.commentaire};

      return {
        ...state,
        commande: {...commande, items}
      }

    case commandeActionTypes.DELETE_PRODUIT:

      items = commande.items;
      commandeitem = action.commandeItem;
      itmIndex = items.findIndex((obj => obj.itemid == commandeitem.itemid));
      if (-1 < itmIndex) { 
        items.splice(itmIndex,1);

        return {
          ...state,
          commande: {...commande, items}
        }
      }

    case commandeActionTypes.UPDATE_COMMANDE:

      let {mode, commentaire} = action.payload;
      return {
        ...state,
        commande: {
          ...commande, mode, commentaire
        }
      }

    case commandeActionTypes.DELETE_COMMANDE:

      items = commande.items;
      items = [];
       
      return {
        ...state,
        commande: {...commande, items:[]}
      }

    case commandeActionTypes.ADD_REGLEMENT:

      reglements = commande.reglements;
      reglements.push(action.reglement);

      return {
        ...state,
        commande: {...commande, reglements}
      }

    case commandeActionTypes.REMOVE_REGLEMENT:

      reglements = commande.reglements;
      rglIndex = reglements.findIndex((obj => obj.reglementId == action.reglementId));
      
      if (-1 < rglIndex) { 
        reglements.splice(rglIndex,1);
        
        return {
          ...state,
          commande: {...commande, reglements}
        }
      }

    case commandeActionTypes.ADD_RENDU:

      rendus = commande.rendus;
      rendus.push(action.rendu);

      return {
        ...state,
        commande: {...commande, rendus}
      }

    case commandeActionTypes.REMOVE_RENDU:

      
      rendus = commande.rendus;
      rndIndex = rendus.findIndex((obj => obj.renduId == action.renduId));
      
      if (-1 < rndIndex) { 
        rendus.splice(rndIndex,1);
        
        return {
          ...state,
          commande: {...commande, rendus}
        }
      }

    case commandeActionTypes.VALIDATE_COMMANDE_REQUEST:
        return {
          ...state,
          loading: true,
          error: null
        };

    case commandeActionTypes.VALIDATE_COMMANDE_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.error
        };
    

    case commandeActionTypes.VALIDATE_COMMANDE_SUCCESS:
        return {
          ...state,
          loading: false,
          error: null,
          commande: action.commande
        };

    default:
      return state;
  }
}

export const getCommande = state => state.commandeReducer.commande;
export const getCommandeLoading = state => state.commandeReducer.loading;
export const getCommandeError = state => state.commandeReducer.error;