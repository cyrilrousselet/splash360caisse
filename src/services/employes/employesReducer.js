import { employesActionTypes } from './employesActionTypes';
import { userActionTypes } from '../user/userActionTypes';

const initialState = {
  loading: false,
  error: null,
  idError: null,
  pointages: [],
  shifts: [],
  timeadjusts: []
}

export function employesReducer(state = initialState, action) {

  switch (action.type) {

    case employesActionTypes.GET_POINTAGES_LIST_REQUEST:
      return {
        ...state,
        loading: true
      };
    case employesActionTypes.GET_POINTAGES_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        pointages: action.pointageslist
      };
    case userActionTypes.AUTHENT_FAILURE:
      return {
        ...state,
        idError: action.error
      };
    case employesActionTypes.GET_SHIFTS_LIST_REQUEST:
      return {
        ...state,
        loading: true
      };
    case employesActionTypes.GET_SHIFTS_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        shifts: action.shiftslist
      };
      case employesActionTypes.GET_TIMEADJUSTS_LIST_REQUEST:
        return {
          ...state,
          loading: true
        };
      case employesActionTypes.GET_TIMEADJUSTS_LIST_SUCCESS:
        return {
          ...state,
          loading: false,
          timeadjusts: action.timeadjustslist
        };
    case employesActionTypes.CLOCKIN_SUCCESS:
    case employesActionTypes.CLOCKOUT_SUCCESS:
      return {
        ...state,
        idError: null
      };
    default:
      return state;
  }
}

export const getPointages = state => state.employesReducer.pointages;
export const getShifts = state => state.employesReducer.shifts;
export const getTimeadjusts = state => state.employesReducer.timeadjusts;