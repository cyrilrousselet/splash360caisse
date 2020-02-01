import React from 'react';
import PropTypes from 'prop-types';


import { Modal, Fab } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import history from '../../helpers/history';
import paths from '../../constants/routes';

import 'date-fns';
import { format, startOfWeek, isValid } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import fakeliste from '../../assets/images/fake_employes_plannings.svg';




let strings = new LocalizedStrings(data);


class LocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return `Semaine du ${format(startOfWeek(date, {weekStartsOn:1}), "d MMMM", {locale:this.locale})}`
  }
}


class Plannings extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      startDate: startOfWeek(new Date(), {weekStartsOn:1})
    };
    this.setSelectedDate = this.setSelectedDate.bind(this);
    this.formatWeekSelectLabel = this.formatWeekSelectLabel.bind(this);
  }
 
  setSelectedDate(date) {
      this.setState({startDate:date});
  }
  formatWeekSelectLabel = (date) => {

    return `Semaine du ${format(startOfWeek(date, {weekStartsOn:1}), "d MMMM", {locale:frLocale})}`
  };

 render() {

  const { startDate } = this.state;

  return (
    <div className="Plannings">
      <div className="zoneBoutons">
        <div className="buttons">
          <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text="Retour" onClick={ () => { history.push(paths.EMPLOYES) }} />

          <MuiPickersUtilsProvider utils={LocalizedUtils} locale={ frLocale }>
            <KeyboardDatePicker
              id="startdatepicker"
              margin="normal"
              value={ startDate }
              onChange={this.setSelectedDate}
              labelFunc={this.formatWeekSelectLabel}
              KeyboardButtonProps={{ 'aria-label': 'change date' }}
              clearLabel={ strings.general.dialog.clear }
              cancelLabel={ strings.general.dialog.cancel }
              />
          </MuiPickersUtilsProvider>
        </div>
        <div className="titre">Planning</div>
        <div className="taille">
          <StdButton identifier="btnjour" elementclass="btnjour" key="btnjour" text="Jour" onClick={ () => void(0) } />
          <StdButton identifier="btnsemaine" elementclass="btnsemaine" key="btnsemaine" text="Semaine" onClick={ () => void(0) } />
          <StdButton identifier="btnmois" elementclass="btnmois" key="btnmois" text="Mois" onClick={ () => void(0) } />
        </div>
      </div>
      <div className="zoneliste">
        <div class="wrapper">
          <img src={ fakeliste } className="fakeliste" />
        </div>
      </div>
    </div>
    );
  }
}
export default Plannings;

// Cloture.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
// }