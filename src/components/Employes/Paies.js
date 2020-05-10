import React from 'react';
import PropTypes from 'prop-types';


import { Modal, Fab, AppBar, TableContainer, Table, TableHead, TableCell, TableBody, TableRow } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import 'date-fns';
import { Interval, format, compareAsc, startOfToday, endOfToday, startOfDay, endOfDay, isAfter, getWeek, getDay, getMonth, isFirstDayOfMonth, isLastDayOfMonth, add, isBefore, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getHours, getMinutes, differenceInDays, differenceInHours, differenceInSeconds, subDays, subWeeks, subMonths, addDays, addWeeks, isSameDay } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import history from '../../helpers/history';
import paths from '../../constants/routes';

import fakeliste from '../../assets/images/fake_stocks_fournisseurs.svg';
import BackIcon from '../common/icon/BackIcon';
import { addMonths } from 'date-fns/esm';
import NextIcon from '../common/icon/NextIcon';

import {devise} from '../../helpers/toolbox';

let strings = new LocalizedStrings(data);


class LocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "d MMM yyyy", { locale: frLocale });
  }
}

class Paies extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      openTab: 0,
      view: 'mois',
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    }

    this.datesView = this.datesView.bind(this);
    this.changePeriode = this.changePeriode.bind(this);
    this.dateToday = this.dateToday.bind(this);
    this.getNomPeriode = this.getNomPeriode.bind(this);
  }

  componentDidMount() {
    this.props.getUsers();
    this.props.getAllPointages();
    this.props.getAllShifts();
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

  datesView(view) {
    const { startDate } = this.state;

    let start, end;
    switch(view) {
      case 'jour':
        start = startOfDay(startDate);
        end = endOfDay(startDate);
        break;
      case 'semaine':
        start = startOfWeek(startDate, {weekStartsOn:1});
        end = endOfWeek(startDate, {weekStartsOn:1});
        break;
      case 'mois':
        start = startOfMonth(startDate);
        end = endOfMonth(startDate);
        break;
    }


    // switch (short) {
    //   case "jour":
    //     startDate = startOfToday();
    //     endDate = endOfToday();
    //     break;
    //   case "semaine":
    //     startDate = startOfWeek(new Date(), {weekStartsOn:1});
    //     endDate = endOfWeek(new Date(), {weekStartsOn:1});
    //     break;
    //   case "mois":
    //     startDate = startOfMonth(new Date());
    //     endDate = endOfMonth(new Date());
    //     break;
    // }
    this.setState({view: view, startDate: start, endDate: end});
    
  }

  dateToday() {
    const { view } = this.state;

    let start, end, now = new Date();
    switch(view) {
      case 'jour':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'semaine':
        start = startOfWeek(now, {weekStartsOn:1});
        end = endOfWeek(now, {weekStartsOn:1});
        break;
      case 'mois':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
    }
    this.setState({startDate: start, endDate: end});
  }


  changePeriode(suivant=false) {
    const { view, startDate } = this.state;
    let start, end;
    switch(view) {
      case 'jour':
        start = startOfDay(suivant?addDays(startDate,1):subDays(startDate,1));
        end = endOfDay(suivant?addDays(startDate,1):subDays(startDate,1));
        break;
      case 'semaine':
        start = startOfWeek(suivant?addWeeks(startDate,1):subWeeks(startDate,1), {weekStartsOn:1});
        end = endOfWeek(suivant?addWeeks(startDate,1):subWeeks(startDate,1), {weekStartsOn:1});
        break;
      case 'mois':
        start = startOfMonth(suivant?addMonths(startDate,1):subMonths(startDate,1));
        end = endOfMonth(suivant?addMonths(startDate,1):subMonths(startDate,1));
        break;
    }
    this.setState({startDate: start, endDate: end});
  }

  getNomPeriode() {
    const {view,startDate} = this.state;
    switch(view) {
      case 'jour':
        return format(startDate, 'EEEE d MMMM yyyy', { locale: frLocale });
      case 'semaine':
        return `${strings.modules.employes.paies.liste.semaine} ${format(startDate, 'd MMMM yyyy', { locale: frLocale })}`;
      case 'mois':
        return format(startDate, 'MMMM yyyy', { locale: frLocale });
    }    
  }




  getPlanningTotal(shifts) {
    let total = 0;
    shifts.map(shift => {
      const start = shift.start.split(':');
      const end = shift.end.split(':');
      console.log('start-end', start, end);
      total += add(startOfToday(), {hours:Number(end[0]), minutes:Number(end[1])}).getTime() - add(startOfToday(), {hours:Number(start[0]), minutes:Number(start[1])}).getTime();
    });
    return total;
  }

  getPlanningJour(date, shiftslist) {

 //   console.log('getPlanningJour', date, shiftslist);

    const __shifts = shiftslist.filter(sh => {

      let shdate = new Date(sh.date);
      let ok = true;

      // si le shift est récurrent
      if (sh.recurrence && sh.recurrence.periode!=='none') {
        // si la règle de récurrence n'est pas remplie
        // -> pas de shift
        // s'il y a une date de début de la règle
        if (isBefore(date, shdate)) ok = false;
        // s'il y a une date de fin de la règle
        if (sh.recurrence.limite && isAfter(date, sh.recurrence.limite)) ok = false;
          
        
        // si la règle est remplie
        if (ok) {
          // récurrence valide :
          // • par semaine
          if (sh.recurrence.periode=='semaine') {
            // si la semaine en cours ne tombe pas sur celle du shift 
            // ou si le jour n'est pas dans la liste du shift
            // -> pas de shift
            if ((((getWeek(date) - getWeek(shdate)) % Number(sh.recurrence.rythme))!=0) || (sh.recurrence.jours.indexOf(getDay(date))==-1)) ok = false;
          } 
          // • par mois
          if (sh.recurrence.periode=='mois') {
            
            // si le mois en cours ne tombe pas sur celle du shift
            // ou si le jour n'est pas dans la liste du shift (premier jour du mois, dernier jour du mois ou un jour de la liste)
            // -> pas de shift
            if (
              ((getMonth(date) - getMonth(shdate)) % Number(sh.recurrence.rythme))!=0 || 
              (sh.recurrence.jours[0]==0 && isFirstDayOfMonth(shdate)) ||
              (sh.recurrence.jours[0]==-1 && isLastDayOfMonth(shdate)) ||
              (sh.recurrence.jours.indexOf(getDay(shdate))==-1)
            ) ok = false;
          } 
        }
      }
      // si le shift est ponctuel (une seule fois)
      else {
        // si le shift n'est pas aujourd'hui
        if (!isSameDay(shdate,date)) ok = false;
      }
      return ok;
    })

    return __shifts;
  }



  render() {

    const { users, employes, pointages, shifts } = this.props;
    const { startDate, endDate, openTab, view } = this.state;

    console.log(this.state);


    const _ecartToHmm = (ms) => {
      const h = 3600 * 1000;
      const s = ms<0 ? '-':'';
      // let m = getMinutes(Math.abs(ms)-d);
      // return `${s}${getHours(Math.abs(ms)-d)}:${(m.toString().length==2?m:'0'+m)}`;
      const dh = Math.floor(Math.abs(ms)/h);
      const dm = Math.round((Math.abs(ms)%h)/60000).toString().padStart(2, '0');
      return `${s} ${dh}h${(dm!='00'?dm:'')}`;
    }

    const _toHmm = (ms) => {
      const d = 3600 * 1000;
      let m = getMinutes(ms-d);
      return `${getHours(ms-d)}:${(m.toString().length==2?m:'0'+m)}`;
    }
    
    const _salaire = (taux, temps) => {
      const d = 3600 * 1000;
      if (!taux) {
        return ' - €';
      }
      return `${devise(taux*(temps/d))} €`;
    }



    
    let liste = [];
    if (employes && pointages) {
      employes.forEach(usr => {
      
        console.log('user',usr.nom);
        let usr_obj = {
          id: usr.user_id, 
          nom: usr.nom, 
          taux: Number(usr.taux_horaire) || 0,
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
            console.log('ptn', {itv: `${differenceInDays(up.clockout, up.clockin)}j ${differenceInHours(up.clockout, up.clockin)}h ${differenceInSeconds(up.clockout, up.clockin)}s`, id:up.pointage_id});
          });
        }

        // conversion en heures
      //   usr_obj.reel /= (1000 * 3600);
        
        const jours = differenceInDays(endDate, startDate);
        console.log('jours', jours);



        // récup du temps prévu
       // usr_obj.shifts = [];

        const shiftlist = shifts.filter(sh=>sh.employe==usr.user_id);

        let sh = [];

        if (jours>0) {
          [...Array(jours+1).keys()].forEach((v,i) => {
            const __s = this.getPlanningJour(addDays(startDate, i), shiftlist);
            sh = [...sh, ...__s];
          });
        } else {
          usr_obj.shifts = this.getPlanningJour(startDate, shiftlist);
        }

        usr_obj.prevu = this.getPlanningTotal(sh);

        /* TODO - filtrage et comptage des shifts de la période */

        // calcul de l'écart
        usr_obj.ecart = usr_obj.reel - usr_obj.prevu;

        // temps de travail retenu (après application de l'ajustement)
        usr_obj.travail = usr_obj.reel;
        
        liste.push(usr_obj);

        
      });
    } 


    return (
      <div className="Paies">
        <div className="zoneboutons">
          <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text={ strings.general.dialog.back } onClick={ () => { history.push(paths.EMPLOYES) }} />
          <div className="dates">
            <Fab aria-label="previous" size="small" className="previous-button" onClick={ () => { this.changePeriode(false) }}>
              <BackIcon />
            </Fab>
            <div className="nomperiode">
              <div className="ttl">{ strings.modules.employes.paies.titre[view] }</div>
              <div className="periode">{ this.getNomPeriode() }</div>
            </div>
            <Fab aria-label="next" size="small" className="next-button" onClick={ () => { this.changePeriode(true) }}>
              <NextIcon />
            </Fab>

            {/* <MuiPickersUtilsProvider utils={LocalizedUtils} locale={ frLocale }>
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
            </MuiPickersUtilsProvider> */}
          </div>
          <div className="views">
            <StdButton key="aujourdhui" identifier="aujourdhui" elementclass={ `view view-aujourdhui`} text={ strings.modules.employes.paies.view.today } noStroke={true} onClick={ ()=>{ this.dateToday() } } />
            <StdButton key="view-jour" identifier="jour" elementclass={ `view view-jour${(view==='jour'?' selected':'')}`} text={ strings.modules.employes.paies.view.jour } noStroke={true} onClick={ ()=>{ this.datesView('jour') } } />
            <StdButton key="view-semaine" identifier="semaine" elementclass={ `view view-semaine${(view==='semaine'?' selected':'')}`} text={ strings.modules.employes.paies.view.semaine } noStroke={true} onClick={ ()=>{ this.datesView('semaine') } } />
            <StdButton key="view-mois" identifier="mois" elementclass={ `view view-mois${(view==='mois'?' selected':'')}`} text={ strings.modules.employes.paies.view.mois } noStroke={true} onClick={ ()=>{ this.datesView('mois') } } />
          </div>
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
            <TableCell key={`hd-taux`} className="liste-taux">{ strings.modules.employes.paies.liste.taux }</TableCell>
            <TableCell key={`hd-travail`} className="liste-travail">{ strings.modules.employes.paies.liste.travail }</TableCell>
            <TableCell key={`hd-salaire`} className="liste-salaire">{ strings.modules.employes.paies.liste.salaire }</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {liste.map((row, i) => (
            <TableRow key={row.id} className={ `${(i%2)?'odd':'even'}` }>
              <TableCell key={`${row.id}-nom`} className="liste-nom">{ row.nom }</TableCell>
              <TableCell key={`${row.id}-reel`} className="liste-reel">{ _ecartToHmm(row.reel) }</TableCell>
              <TableCell key={`${row.id}-prevu`} className="liste-prevu">{ _ecartToHmm(row.prevu) }</TableCell>
              <TableCell key={`${row.id}-ecart`} className={ `liste-ecart${ (row.ecart>0 ? ' over': (row.ecart==0 ? '':' under')) }`}>{ _ecartToHmm(row.ecart) }</TableCell>
              <TableCell key={`${row.id}-taux`} className="liste-taux">{ row.taux }</TableCell>
              <TableCell key={`${row.id}-travail`} className="liste-travail">{ _ecartToHmm(row.travail) }</TableCell>
              <TableCell key={`${row.id}-salaire`} className="liste-salaire">{ _salaire(row.taux, row.travail) }</TableCell>
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