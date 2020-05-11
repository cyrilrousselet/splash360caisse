import React from 'react';
import PropTypes from 'prop-types';


import { Modal, Fab, AppBar, TableContainer, Table, TableHead, TableCell, TableBody, TableRow, TextField, InputAdornment, IconButton } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import 'date-fns';
import { Interval, format, compareAsc, startOfToday, endOfToday, startOfDay, endOfDay, isAfter, getWeek, getDay, getMonth, isFirstDayOfMonth, isLastDayOfMonth, add, isBefore, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getHours, getMinutes, differenceInDays, differenceInHours, differenceInSeconds, subDays, subWeeks, subMonths, addDays, addWeeks, isSameDay, isToday, isEqual } from "date-fns";
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

class TimeadjustPopin extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      newvaleur:null
    };
    this.setNewValeur = this.setNewValeur.bind(this);
    this.saveTimeadjust = this.saveTimeadjust.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
    this.setNewValeurSign = this.setNewValeurSign.bind(this);
  }

  _getHeures(ms) {
    return Math.floor(Math.abs(ms)/(3600 * 1000));
  }
  _getMinutes(ms) {
    return Math.round((Math.abs(ms)%(3600 * 1000))/60000);
  }

  setNewValeur(champ, val) {
    const nv = this.state.newvaleur || this.props.valeur;
    const hrs = this._getHeures(nv);
    const min = this._getMinutes(nv);

console.log('setNewValeur',champ,val);

    if (champ=='minutes') {
      this.setState({newvaleur:((hrs*3600)+val)*1000});
    }
    else if (champ=='heures') {
      this.setState({newvaleur:((val*3600)+min)*1000});
    }
  }
  setNewValeurSign() {
    const nv = this.state.newvaleur || this.props.valeur;
    console.log('sign',nv, (0-nv));
    this.setState({newvaleur:(0-nv)});
  }
  saveTimeadjust() {
    const { user, employe, fin, valeur } = this.props;
    const { newvaleur } = this.state;

    if (newvaleur!=valeur) {

      console.log('nv,v',newvaleur,valeur);

      this.props.saveTimeadjust({
        employe: employe.user_id,
        user: user,
        valeur: newvaleur!==null ? (newvaleur - valeur) : 0,
        date: fin.getTime()
      });
    } 
    this.resetPopin();
    this.props.closeHandler();
  }

  resetPopin() {
    this.setState({newvaleur:null});
  }

  render() {
    const { open, user, employe, periode, debut, fin, valeur, closeHandler } = this.props;
    const newvaleur = this.state.newvaleur || valeur;


    console.log("newvaleur",newvaleur);

    return (
      <Modal
        open={open}
        >
        <div className={ `PaieTimeadjustEditModal`}>
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ strings.modules.employes.paies.timeadjust.titre }</div>
            </div>
            <div className="body">
              <div className="form-group group-employe">
                <div className="label">{ strings.modules.employes.paies.timeadjust.employe }</div>
                <div className="valeur nom-employe">{ employe && employe.nom }</div>
              </div>
              <div className="form-group group-periode">
                <div className="label">{ strings.modules.employes.paies.timeadjust.periode[periode] }</div>
                <div className="valeur periode">{ debut && (periode=='mois' ? format(debut, 'MMMM yyyy', { locale: frLocale }) : format(debut, 'd MMMM yyyy', { locale: frLocale })) }</div>
              </div>
              <div className="form-group group-valeur">
                <div className="label">{ strings.modules.employes.paies.timeadjust.valeur }</div>
                <TextField 
                  className="input valeur-heures" 
                  InputProps={{
                    startAdornment: 
                      <InputAdornment position="start">
                        <IconButton
                          className="signe-btn"
                          aria-label="toggle value sign"
                          onClick={ this.setNewValeurSign }>
                            { newvaleur>=0 ? '+' : '-'}
                        </IconButton>
                      </InputAdornment>,
                    endAdornment: <InputAdornment position="end">{ strings.modules.employes.paies.timeadjust.heures }</InputAdornment>,
                  }} 
                  type="number" 
                  name="valeur-heures" 
                  defaultValue={this._getHeures(newvaleur)} 
                  onChange={(event) => { this.setNewValeur('heures', event.target.value) }} 
                />
                <TextField 
                  className="input valeur-heures" 
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{ strings.modules.employes.paies.timeadjust.minutes }</InputAdornment>
                  }}
                  type="number" 
                  name="valeur-heures" 
                  defaultValue={this._getMinutes(newvaleur)} 
                  onChange={(event) => { this.setNewValeur('minutes', event.target.value) }} 
                />
              </div>
            </div>
            <div className="footer">
              <StdButton 
                identifier="modal-save" 
                elementclass="save" 
                icon={ false } 
                // disabled={ !readytovalidate }
                text={ strings.general.dialog.save } 
                onClick={this.saveTimeadjust} 
              />
            </div>
          </div>
          <Fab aria-label="close" size="small" className="close-button" onClick={ ()=>{this.resetPopin(); closeHandler()} }>
            <CloseIcon />
          </Fab>
        </div>
      </Modal>


    );
  }

}

class Paies extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      openTab: 0,
      view: 'mois',
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
      timeadjustOpen: false,
      tmaEmploye: null,
      tmaValeur: null
    }

    this.datesView = this.datesView.bind(this);
    this.changePeriode = this.changePeriode.bind(this);
    this.dateToday = this.dateToday.bind(this);
    this.getNomPeriode = this.getNomPeriode.bind(this);
    this.openTimeadjust = this.openTimeadjust.bind(this);
    this.closeTimeadjust = this.closeTimeadjust.bind(this);
  }

  componentDidMount() {
    this.props.getUsers();
    this.props.getAllPointages();
    this.props.getAllShifts();
    this.props.getAllTimeadjusts();
    this.props.getParametres();
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




  getPlanningTotal(shifts, types, date=null) {
    let total = 0;
    shifts.map(shift => {
      const type = types.find(t=>t.id==shift.poste);
      if (type.tps) {
        
        const start = shift.start.split(':');
        const end = shift.end.split(':');
        const debut = add(startOfToday(), {hours:Number(start[0]), minutes:Number(start[1])});
        const fin = add(startOfToday(), {hours:Number(end[0]), minutes:Number(end[1])});
        const now = new Date();

        // si la date n'est pas fournie, on additionne tout le shift
        if (date==null) {
          total += fin.getTime() - debut.getTime();
        }
        // si la date est fournie, on additionne uniquement le temps passé
        else {
          // si c'est avant aujourd'hui
          if (isBefore(startOfDay(date), startOfToday())) {
            total += fin.getTime() - debut.getTime();
          } 
          // si c'est aujourd'hui
          else if (isEqual(startOfDay(date), startOfToday())) {
            // si la fin du creneau est avant maintenant, on compte tout
            if (isBefore(fin, now)) {
              total += fin.getTime() - debut.getTime();
            }
            // si la fin n'est pas arrivée mais que le début a commencé
            else if (isBefore(debut, now)) {
              // on calcule le temps qui s'est écoulé depuis le début
              total += now.getTime() - debut.getTime();
            }
          }
        }

      }
    });
    return total;
  }

  getPlanningJour(date, shiftslist) {

    const __shifts = shiftslist.filter(sh => {

      let shdate = new Date(sh.date);
      let ok = true;

      // si le shift est récurrent
      if (sh.recurrence && sh.recurrence.periode!=='none') {
        // si la règle de récurrence n'est pas remplie
        // -> pas de shift
        // s'il y a une date de début de la règle
        if (isBefore(startOfDay(date), startOfDay(shdate))) ok = false;
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

  openTimeadjust(employe_id, valeur) {
    const {employes} = this.props;
    this.setState({timeadjustOpen:true, tmaEmploye:employes.find(e=>e.user_id==employe_id), tmaValeur: valeur});
  }
  closeTimeadjust() {
    this.setState({timeadjustOpen:false, tmaEmploye:null, tmaValeur:null});
  }


  render() {

    const { users, params, employes, pointages, shifts, adjusts, createTimeadjust, admin } = this.props;
    const { startDate, endDate, openTab, view, timeadjustOpen, tmaEmploye, tmaValeur } = this.state;
    const { shifttypes } = params || {shifttypes:null};


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
          prevurealtime: 0,
          ecart: 0, 
          adjust: 0,
          correction: 0,
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
            // console.log('ptn', {itv: `${differenceInDays(up.clockout, up.clockin)}j ${differenceInHours(up.clockout, up.clockin)}h ${differenceInSeconds(up.clockout, up.clockin)}s`, id:up.pointage_id});
          });
        }

        usr_obj.adjust = adjusts.filter(a=>(
          a.employe==usr.user_id &&
          a.date>=startDate.getTime() &&
          a.date<=endDate.getTime()
        ));
        if (usr_obj.adjust) {
          usr_obj.adjust.forEach(ua => {
            usr_obj.correction += ua.valeur;
          });
        }

        // conversion en heures
      //   usr_obj.reel /= (1000 * 3600);
        
        const jours = differenceInDays(endDate, startDate);

        // récup du temps prévu
       // usr_obj.shifts = [];

        const shiftlist = shifts.filter(sh=>sh.employe==usr.user_id);

        let sh = [];
        let shrt = [];

        if (jours>0) {
          [...Array(jours+1).keys()].forEach((v,i) => {
            // const __s = {date:, shifts: this.getPlanningJour(addDays(startDate, i), shiftlist)};
            sh.push({date:addDays(startDate, i), shifts: this.getPlanningJour(addDays(startDate, i), shiftlist)});
          });
        } else {
//          sh = this.getPlanningJour(startDate, shiftlist);
          sh.push({date:startDate, shifts: this.getPlanningJour(startDate, shiftlist)});
        }
        sh.forEach(s => {
          usr_obj.prevu += this.getPlanningTotal(s.shifts, shifttypes);
          usr_obj.prevurealtime += this.getPlanningTotal(s.shifts, shifttypes, s.date);
        });

        console.log(_ecartToHmm(usr_obj.prevu), _ecartToHmm(usr_obj.prevurealtime));

        /* TODO - filtrage et comptage des shifts de la période */

        // calcul de l'écart
//        usr_obj.ecart = usr_obj.reel - usr_obj.prevu;
        usr_obj.ecart = usr_obj.reel - usr_obj.prevurealtime;

        // temps de travail retenu (après application de l'ajustement)
        usr_obj.travail = usr_obj.reel + usr_obj.correction;
        
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
            <TableCell key={`hd-correction`} className="liste-correction">{ strings.modules.employes.paies.liste.correction }</TableCell>
            <TableCell key={`hd-travail`} className="liste-travail">{ strings.modules.employes.paies.liste.travail }</TableCell>
            <TableCell key={`hd-taux`} className="liste-taux">{ strings.modules.employes.paies.liste.taux }</TableCell>
            <TableCell key={`hd-salaire`} className="liste-salaire">{ strings.modules.employes.paies.liste.salaire }</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {liste.map((row, i) => (
            <TableRow key={row.id} className={ `${(i%2)?'odd':'even'}` }>
              <TableCell key={`${row.id}-nom`} className="liste-nom">{ row.nom }</TableCell>
              <TableCell key={`${row.id}-reel`} className="liste-reel">{ _ecartToHmm(row.reel) }</TableCell>
              {/* <TableCell key={`${row.id}-prevu`} className="liste-prevu">{ _ecartToHmm(row.prevu) }</TableCell> */}
              <TableCell key={`${row.id}-prevu`} className="liste-prevu">{ _ecartToHmm(row.prevurealtime) }</TableCell>
              <TableCell key={`${row.id}-ecart`} className={ `liste-ecart${ (row.ecart>0 ? ' over': (row.ecart==0 ? '':' under')) }`}>{ _ecartToHmm(row.ecart) }</TableCell>
              <TableCell key={`${row.id}-correction`} className={ `liste-correction`}><div className="ecart-correction" onClick={()=>{ this.openTimeadjust(row.id,row.ecart) }}>{ _ecartToHmm(row.correction) }</div></TableCell>
              <TableCell key={`${row.id}-travail`} className="liste-travail">{ _ecartToHmm(row.travail) }</TableCell>
              <TableCell key={`${row.id}-taux`} className="liste-taux">{ row.taux }</TableCell>
              <TableCell key={`${row.id}-salaire`} className="liste-salaire">{ _salaire(row.taux, row.travail) }</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
          </div>
        </div>
        <TimeadjustPopin 
          open={timeadjustOpen}
          user={admin.user_id}
          employe={tmaEmploye}
          periode={view}
          debut={startDate}
          fin={endDate}
          valeur={tmaValeur}
          closeHandler={this.closeTimeadjust}
          saveTimeadjust={createTimeadjust}
        />
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