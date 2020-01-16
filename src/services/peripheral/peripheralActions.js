import { peripheralActionTypes } from './peripheralActionTypes';
import { peripheralServices } from './peripheralServices';

function printTest(payload) {
  return dispatch => {
    peripheralServices.printTest()
    .then(
      response => {
        console.log(response);
      }
    )
    dispatch({ type: peripheralActionTypes.PRINT_TEST });
  }
}

export const peripheralActions = {
  printTest
};