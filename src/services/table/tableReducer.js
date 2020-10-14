import { tableActionTypes } from './tableActionTypes';

const initialState = {
  loading: false,
  error: null,
  salles: {}
}

export function tableReducer(state = initialState, action) {

  const { salles } = state;
  let salle = null;
 // let table = null;

  switch (action.type) {
    case tableActionTypes.GET_ALL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };


    case tableActionTypes.GET_ALL_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        salles: action.salleslist
      };


    case tableActionTypes.GET_ALL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error
      };


    case tableActionTypes.ADD_TABLE_SUCCESS:

      salle = salles[action.table.salleId];
      let tables = salle.tables || [];
      tables.push(action.table);
      salle = {...salle, tables};

      return {
        ...state,
        salles: {...salles, [action.table.salleId]:salle}
      };


    case tableActionTypes.REMOVE_TABLE_SUCCESS:

      salle = salles[action.salleId];
      salle.tables = salle.tables.filter(obj=>obj.tableId!==action.tableId);

      return {
        ...state,
        salles: {...salles, [action.salleId]: salle}
      };

    case tableActionTypes.UPDATE_TABLE_SUCCESS:

      salle = salles[action.table.salleId];
      let tableindex = salle.tables.findIndex(t=>t.tableId===action.table.tableId);
      salle.tables[tableindex] = action.table;

      return {
        ...state,
        salles: {...salles, [salle.salleId]:salle}
      };


    case tableActionTypes.ADD_SALLE_SUCCESS:

      salle = action.salle;

      return {
        ...state,
        salles: {...salles, [salle.salleId]:salle}
      };

    case tableActionTypes.UPDATE_SALLE_SUCCESS:

      salle = action.salle;

      return {
        ...state,
        salles: {...salles, [salle.salleId]:salle}
      };


    case tableActionTypes.REMOVE_SALLE_SUCCESS:

      if (salles[action.salleId].tables.length>0) {
        return state;
      }

      delete salles[action.salleId];

      return {
        ...state,
        salles: {...salles}
      };

    default:
      return state;
  }
}