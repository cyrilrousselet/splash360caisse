import { commandeActionTypes } from './commandeActionTypes';

const initialState = {
  loading: false,
  error: null,
  commande: {},
  numero: JSON.parse(localStorage.getItem('numero'))
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
    , comments = []
    , cmtIndex = -1
    , modificateurs = []
    , modIndex = -1
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
      let start = commande.start;
      if (items.length==0) start = new Date();
      items.push(action.commandeItem);


      return {
        ...state,
        commande: {...commande, items, start}
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

    //  let {mode, status, client} = action.payload;
      let payload = action.payload;
      return {
        ...state,
        commande: {
//          ...commande, mode, status, client
          ...commande, ...payload
        }
      }

    case commandeActionTypes.DELETE_CURRENT_COMMANDE:

      items = commande.items;
      items = [];
       
      return {
        ...state,
        commande: {...commande, items:[]}
      }

    case commandeActionTypes.ADD_INGREDIENT:
    case commandeActionTypes.REMOVE_INGREDIENT:
    case commandeActionTypes.STEP_NOINGREDIENT:
    case commandeActionTypes.STEP_COMPLETE:
    case commandeActionTypes.STEP_UNCOMPLETE:

      items = commande.items;
      commandeitem = action.commandeItem;
      itmIndex = items.findIndex((obj => obj.itemid === commandeitem.itemid));
      itm = items[itmIndex];
      items[itmIndex] = {...itm, ...commandeitem};

      return {
        ...state,
        commande: {...commande, items}
      };

    case commandeActionTypes.ADD_COMMENT:

      comments = commande.comments;
      comments.push(action.comment);

      return {
        ...state,
        commande: {...commande, comments}
      };


    case commandeActionTypes.UPDATE_COMMENT:

      const {commentId, texte} = action.payload;

      comments = commande.comments;
      cmtIndex = comments.findIndex((obj => obj.comment_id == commentId));

      if (-1 < cmtIndex) { 
        
        const cmt = comments[cmtIndex];
        comments[cmtIndex] = {...cmt, texte:texte};
  
        return {
          ...state,
          commande: {...commande, comments:comments}
        }
      };


    case commandeActionTypes.DELETE_COMMENT:

      comments = commande.comments;
      cmtIndex = comments.findIndex((obj => obj.comment_id == action.commentId));
      
      if (-1 < cmtIndex) { 
        comments.splice(cmtIndex,1);
        
        return {
          ...state,
          commande: {...commande, comments}
        }
      }



    case commandeActionTypes.ADD_DISCOUNT:

      modificateurs = commande.modificateurs;
      modificateurs.push(action.modificateur);

      return {
        ...state,
        commande: {...commande, modificateurs}
      };


    case commandeActionTypes.UPDATE_DISCOUNT:

      const {discountId, valeur} = action.payload;

      modificateurs = commande.modificateurs;
      modIndex = modificateurs.findIndex((obj => obj.modificateur_id == discountId));

      if (-1 < modIndex) { 
        
        const dsc = modificateurs[modIndex];
        modificateurs[modIndex] = {...dsc, valeur:valeur};
  
        return {
          ...state,
          commande: {...commande, modificateurs:modificateurs}
        }
      };


    case commandeActionTypes.DELETE_DISCOUNT:

      modificateurs = commande.modificateurs;
      modIndex = modificateurs.findIndex((obj => obj.modificateur_id == action.discountId));
      
      if (-1 < modIndex) { 
        modificateurs.splice(modIndex,1);
        
        return {
          ...state,
          commande: {...commande, modificateurs}
        }
      }

    case commandeActionTypes.ADD_REGLEMENT:

      reglements = commande.reglements;

      // dans le cas de l'update d'un règlement en espèces
      // on supprime l'ancienne occurrence du règlement
      rglIndex = reglements.findIndex(reglement=>reglement.reglementId==action.reglement.reglementId);
      if (rglIndex>-1) {
        reglements.splice(rglIndex, 1);
      }
      
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
    
    case commandeActionTypes.SET_NEW_NUMERO:
        return {
          ...state,
          commande: {...commande, numero: action.newnumero},
          numero: action.newnumero
        }

    case commandeActionTypes.NEW_NUMERO:
        return {
          ...state,
          numero: action.numero
        };

    default:
      return state;
  }
}

export const getCommande = state => state.commandeReducer.commande;
export const getCommandeLoading = state => state.commandeReducer.loading;
export const getCommandeError = state => state.commandeReducer.error;