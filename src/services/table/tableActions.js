import { tableActionTypes } from './tableActionTypes';
import { tableServices } from './tableServices';

import Logger from '../../helpers/Logger';


const logger = new Logger();

function getSallesList(params={}) {

  logger.log('tabA.getSallesList()');

  return dispatch => {
    dispatch({ type: tableActionTypes.GET_ALL_REQUEST });

    tableServices.getSallesList(params)
    .then(
      data => { dispatch({ type: tableActionTypes.GET_ALL_SUCCESS, ...data }) }
    )
    .catch(
      error => { dispatch({ type: tableActionTypes.GET_ALL_FAILURE, error: error })}
    );
  }

}

function addSalle(payload) {
  return (dispatch, getState) => {

    const newsalle = tableServices.getNewSalle();

    const {salles} = getState().tableReducer;

    const salle = {...newsalle, ...payload, weight: Object.entries(salles).length};
    dispatch({ type: tableActionTypes.ADD_SALLE_REQUEST });

    tableServices.persistSalle(salle)
    .then(
      confirm => dispatch({ type: tableActionTypes.ADD_SALLE_SUCCESS, salle: confirm }),
      error => dispatch({ type: tableActionTypes.ADD_SALLE_FAILURE, error})
    );

  }
}

function deleteSalle(payload) {
  return dispatch => {
    dispatch({ type: tableActionTypes.REMOVE_SALLE_REQUEST });

    tableServices.deleteSalle(payload.salleId)
    .then(
      data => {
        dispatch({ type: tableActionTypes.REMOVE_SALLE_SUCCESS, salleId: payload.salleId });
      },
      error => dispatch({ type: tableActionTypes.REMOVE_SALLE_FAILURE, error: error })
    );
  }
}


function updateSalle(payload) {
  return (dispatch, getState) => {
    dispatch({ type: tableActionTypes.UPDATE_SALLE_REQUEST });
    
    const {update} = payload;
    const { salles } = getState().tableReducer;
    const salle = salles[payload.salleId];

    tableServices.persistSalle({...salle, ...update})
    .then(
      data => {
        dispatch({ type: tableActionTypes.UPDATE_SALLE_SUCCESS, salle:data });
      },
      error => dispatch({ type: tableActionTypes.UPDATE_SALLE_FAILURE, error: error })
    );
  }
}



function addTable(payload) {
  return dispatch => {
    dispatch({ type: tableActionTypes.ADD_TABLE_REQUEST});

    const newtable = tableServices.getNewTable();
    
    const table = {...newtable, ...payload};

    tableServices.persistTable(table)
    .then(
      confirm => dispatch({ type: tableActionTypes.ADD_TABLE_SUCCESS, table: confirm }),
      error => dispatch({ type: tableActionTypes.ADD_TABLE_FAILURE, error})
    );

  }
}

function deleteTable(payload) {
  return dispatch => {
    dispatch({ type: tableActionTypes.REMOVE_TABLE_REQUEST });

    const {salleId, tableId} = payload;

    tableServices.deleteTable(tableId)
    .then(
      data => {
        dispatch({ type: tableActionTypes.REMOVE_TABLE_SUCCESS, salleId: salleId, tableId:tableId });
      },
      error => dispatch({ type: tableActionTypes.REMOVE_TABLE_FAILURE, error: error })
    );
  }
}


function updateTable(payload) {
  return (dispatch, getState) => {
    dispatch({ type: tableActionTypes.UPDATE_TABLE_REQUEST });
    

    const { salles } = getState().tableReducer;
    const {salleId, tableId, update} = payload;
    const salle = salles[salleId];
    const table = salle.tables.find(t => t.tableId === tableId);

    tableServices.persistTable({...table, ...update})
    .then(
      data => {
        dispatch({ type: tableActionTypes.UPDATE_TABLE_SUCCESS, table:data });
      },
      error => dispatch({ type: tableActionTypes.UPDATE_TABLE_FAILURE, error: error })
    );
  }
}

function takeTable(payload) {
  return (dispatch, getState) => {

    const {tableId, salleId, couverts} = payload;

    const { salles } = getState().tableReducer;
    const { user } = getState().authentication;
    const { ticketId } = getState().commandeReducer.commande;

    const salle = salles.find(s => s.salleId === salleId);
    const table = salle.tables.find(t => t.tableId === tableId);

    const takentable = {...table,
      couverts: couverts,
      status: 'pending',
      serveur: user.userId,
      ticketId: ticketId
    };

    dispatch({type: tableActionTypes.TAKE_TABLE, table: takentable});

    tableServices.persistTable(takentable)
    .then(
      data => {
        dispatch({ type: tableActionTypes.UPDATE_TABLE_SUCCESS, ...data });
      },
      error => dispatch({ type: tableActionTypes.UPDATE_TABLE_FAILURE, error: error })
    );
  }
}

function freeTable(payload) {
  return (dispatch, getState) => {

    const {tableId, salleId} = payload;
  
    const { salles } = getState().tableReducer;
  
    const salle = salles.find(s => s.salleId === salleId);
    const table = salle.tables.find(t => t.tableId === tableId);

    const freetable = {...table,
      couverts: 0,
      status: 'free',
      serveur: null,
      ticketId: null
    };

    dispatch({type: tableActionTypes.FREE_TABLE, table: freetable});

    tableServices.persistTable(freetable)
    .then(
      data => {
        dispatch({ type: tableActionTypes.UPDATE_TABLE_SUCCESS, ...data });
      },
      error => dispatch({ type: tableActionTypes.UPDATE_TABLE_FAILURE, error: error })
    );
  }
}



export const tableActions = {
  getSallesList,
  addSalle,
  deleteSalle,
  updateSalle,
  addTable,
  deleteTable,
  updateTable,
  takeTable,
  freeTable
}