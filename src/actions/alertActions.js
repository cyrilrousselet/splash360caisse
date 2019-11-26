import { alertActionTypes } from '../constants/actionTypes';

export const alertActions = {
    success,
    error,
    clear
};

const success = (message) => ({ type: alertActionTypes.SUCCESS, message });
const error = (message) => ({ type: alertActionTypes.ERROR, message });
const clear = () => ({ type: alertActionTypes.CLEAR });