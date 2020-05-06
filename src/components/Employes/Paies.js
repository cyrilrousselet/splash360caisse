import React from 'react';
import PropTypes from 'prop-types';


import { Modal, Fab, AppBar, TableContainer, Table, TableHead, TableCell, TableBody, TableRow } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import 'date-fns';
import { format, compareAsc, startOfToday, endOfToday, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getHours, getMinutes } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import history from '../../helpers/history';
import paths from '../../constants/routes';

import fakeliste from '../../assets/images/fake_stocks_fournisseurs.svg';
import BackIcon from '../common/icon/BackIcon';

let strings = new LocalizedStrings(data);


class LocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "d MMM yyyy", { locale: this.locale });
  }
}

class Paies extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      openTab: 0,
      startDate: startOfToday(),
      endDate: endOfToday()
    }

    this.datesShortcut = this.datesShortcut.bind(this);
  }

  componentDidMount() {
    this.props.getUsers();
    this.props.getAllPointages();
  }

  setSelectedDate(bound,date) {
    const { startDate, endDate } = this.state;
    if (bound=='start') {
      this.setState({startDate:(date<=endDate)?startOfDay(date):endDate});
    }
    if (bound=='end') {
      this.setState({endDate:(date>=startDate)?endOfDay(date):startDate});
    }
  }

  datesShortcut(short) {
    let startDate, endDate;
    switch (short) {
      case "jour":
        startDate = startOfToday();
        endDate = endOfToday();
        break;
      case "semaine":
        startDate = startOfWeek(new Date(), {weekStartsOn:1});
        endDate = endOfWeek(new Date(), {weekStartsOn:1});
        break;
      case "mois":
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
        break;
    }
    this.setState({startDate:startDate, endDate:endDate});
    
  }

  render() {

    const { users, pointages } = this.props;
    const { startDate, endDate, openTab } = this.state;


    const _ecartToHmm = (ms) => {
      const d = 3600 * 1000;
      const s = ms<0 ? '-':'';
      let m = getMinutes(Math.abs(ms)-d);
      return `${s}${getHours(Math.abs(ms)-d)}:${(m.toString().length==2?m:'0'+m)}`;
    }

    const _toHmm = (ms) => {
      const d = 3600 * 1000;
      let m = getMinutes(ms-d);
      return `${getHours(ms-d)}:${(m.toString().length==2?m:'0'+m)}`;
    }


    console.log('pointages', pointages);
    
    let liste = [];
    if (users && pointages) {
      users.forEach(usr => {
        if (usr.status!=='deleted') {
         
          let usr_obj = {
            id: usr.user_id, 
            nom: usr.nom, 
            pointages: [], 
            shifts: [], 
            reel: 0, 
            prevu: 0, 
            ecart: 0, 
            travail: 0
          };

          // récup du pointage
          usr_obj.pointages = pointages.filter(p=>(
            p.employe==usr.user_id && 
            p.status=='closed' && 
            p.clockin>=startDate.getTime() && 
            p.clockin<=endDate.getTime()
          ));
          if (usr_obj.pointages) {
            usr_obj.pointages.forEach(up => {
              usr_obj.reel += up.clockout - up.clockin;
            });
          }

          // conversion en heures
       //   usr_obj.reel /= (1000 * 3600);
          
          // récup du temps prévu
          usr_obj.shifts = [];
          /* TODO - filtrage et comptage des shifts de la période */

          // calcul de l'écart
          usr_obj.ecart = usr_obj.prevu - usr_obj.reel;

          // temps de travail retenu (après application de l'ajustement)
          usr_obj.travail = usr_obj.reel;
          
          liste.push(usr_obj);

        }
      });
    } 


    console.log('liste', liste);


    return (
      <div className="Paies">
        <div className="zoneBoutons">
          <div className="buttons">
            <Fab aria-label="back" size="small" className="back-button" onClick={ () => { history.push(paths.EMPLOYES) }}>
              <BackIcon />
            </Fab>
          </div>

          <AppBar position="static" className="liste-header">
            <div className="dates">
              <MuiPickersUtilsProvider utils={LocalizedUtils} locale={ frLocale }>
                <div className="caption start">{ strings.modules.employes.paies.pickers.du }</div>
                <KeyboardDatePicker
                  id="startdatepicker"
                  margin="normal"
                  value={ startDate }
                  format="d MMM yyyy"
                  onChange={date => { this.setSelectedDate('start', date) }}
                  KeyboardButtonProps={{ 'aria-label': 'change date' }}
                  clearLabel={ strings.general.dialog.clear }
                  cancelLabel={ strings.general.dialog.cancel }
                  />
                <div className="caption">{ strings.modules.employes.paies.pickers.au }</div>
                <KeyboardDatePicker
                  id="enddatepicker"
                  margin="normal"
                  value={ endDate }
                  format="d MMM yyyy"
                  onChange={date => { this.setSelectedDate('end', date) }}
                  KeyboardButtonProps={{ 'aria-label': 'change date' }}
                  clearLabel={ strings.general.dialog.clear }
                  cancelLabel={ strings.general.dialog.cancel }
                  />
              </MuiPickersUtilsProvider>
            </div>
            <div className="shortcuts">
              <StdButton key="short-jour" identifier="jour" elementclass="shortcut shortcut-jour" text={ strings.modules.employes.paies.shortcut.jour } noStroke={true} onClick={ ()=>{ this.datesShortcut('jour') } } />
              <StdButton key="short-semaine" identifier="semaine" elementclass="shortcut shortcut-semaine" text={ strings.modules.employes.paies.shortcut.semaine } noStroke={true} onClick={ ()=>{ this.datesShortcut('semaine') } } />
              <StdButton key="short-mois" identifier="mois" elementclass="shortcut shortcut-mois" text={ strings.modules.employes.paies.shortcut.mois } noStroke={true} onClick={ ()=>{ this.datesShortcut('mois') } } />
            </div>
          </AppBar>
        </div>
        <div className="zoneliste">
          <div class="wrapper">
    <TableContainer className="table-cont">
      <Table size="small" aria-label="a dense table" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell key={`hd-nom`} className="liste-nom">{ strings.modules.employes.paies.liste.nom }</TableCell>
            <TableCell key={`hd-reel`} className="liste-reel">{ strings.modules.employes.paies.liste.reel }</TableCell>
            <TableCell key={`hd-prevu`} className="liste-prevu">{ strings.modules.employes.paies.liste.prevu }</TableCell>
            <TableCell key={`hd-ecart`} className="liste-ecart">{ strings.modules.employes.paies.liste.ecart }</TableCell>
            <TableCell key={`hd-travail`} className="liste-travail">{ strings.modules.employes.paies.liste.travail }</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {liste.map((row, i) => (
            <TableRow key={row.id} className={ `${(i%2)?'odd':'even'}` }>
              <TableCell key={`${row.id}-nom`} className="liste-nom">{ row.nom }</TableCell>
              <TableCell key={`${row.id}-reel`} className="liste-reel">{ _toHmm(row.reel) }</TableCell>
              <TableCell key={`${row.id}-prevu`} className="liste-prevu">{ _toHmm(row.prevu) }</TableCell>
              <TableCell key={`${row.id}-ecart`} className="liste-ecart">{ _ecartToHmm(row.ecart) }</TableCell>
              <TableCell key={`${row.id}-travail`} className="liste-travail">{ _toHmm(row.travail) }</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
          </div>
        </div>
      </div>
    );
  }
}
export default Paies;

// Paies.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
// }