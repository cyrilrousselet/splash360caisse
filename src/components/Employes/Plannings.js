import React from 'react';


import { Modal, Fab, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, FormControl, Select, MenuItem, TextField } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import history from '../../helpers/history';
import paths from '../../constants/routes';

import 'date-fns';
import { format, startOfWeek, isToday, addDays, getDay, getWeek, isFirstDayOfMonth, isLastDayOfMonth, isAfter, getMonth, startOfToday, add, addWeeks, subWeeks, startOfDay } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers';

import { endOfWeek, isBefore, isSameDay } from 'date-fns/esm';
import Swal from 'sweetalert2';
import NextIcon from '../common/icon/NextIcon';
import BackIcon from '../common/icon/BackIcon';
import LockIcon from '../common/icon/LockIcon';
import LockOpenIcon from '../common/icon/LockOpenIcon';

// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
// const logger = new Logger();




let strings = new LocalizedStrings(data);


class LocalizedWeekUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return `Semaine du ${format(startOfWeek(date, {weekStartsOn:1}), "d MMMM", {locale:this.locale})}`
  }
}

class LocalizedDayUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "d MMM yyyy", { locale: frLocale });
  }
}

const JourCheckbox = ({checked, label, key, className, changeHandler}) => {

  const inputChange = (event) => { changeHandler(event.currentTarget.checked) };

  return(
    <div className={ `jour-checkbox ${className}${(checked?' checked':'')}` } key={key}>
      <span className="jour-check-label">{label}</span>
      <input type="checkbox" checked={ checked } name={key} onClick={inputChange} />
    </div>
  )
};


class ShiftEditModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shift_id: null,
      employe: null,
      poste: null,
      start: null,
      end: null,
      date: null,
      recurrence: null
    };


    this.updateValue = this.updateValue.bind(this);
    this.updateRecurrence = this.updateRecurrence.bind(this);
    this.updateRecurrenceJours = this.updateRecurrenceJours.bind(this);
    this.getValues = this.getValues.bind(this);
    this.saveShift = this.saveShift.bind(this);
    this.deleteShift = this.deleteShift.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
    this.checkHour = this.checkHour.bind(this);
  }

  componentDidMount() {
    const st = {
      shift_id: this.props.shift && this.props.shift.shift_id,
      employe: this.props.shift && this.props.shift.employe,
      poste: this.props.shift && this.props.shift.poste,
      start: this.props.shift && this.props.shift.start,
      end: this.props.shift && this.props.shift.end,
      date: this.props.shift && this.props.shift.date,
      recurrence: this.props.shift && this.props.shift.recurrence
    }
    logger.info('componentDidMount', st);
    this.setState(st);
  }

  getValues() {
    const { shift_id, employe, poste, start, end, date, recurrence } = this.props.shift || { shift_id:null, employe:null, poste:null, start:null, end:null, date:null, recurrence:{periode:'none',rythme:1, jours:[],limite:null} };
    const { shiftdate } = this.props;

    const sshift_id = this.state.shift_id;
    const semploye = this.state.employe;
    const sposte = this.state.poste;
    const sstart = this.state.start;
    const send = this.state.end;
    const sdate = this.state.date || shiftdate;
    const srecurrence = this.state.recurrence;

    return { 
      shift_id: sshift_id || shift_id,
      employe: semploye || employe,
      poste: sposte || poste,
      start: sstart || start,
      end: send || end,
      date: sdate || date,
      recurrence: srecurrence || recurrence
    };
  }



  updateValue(value) {
    logger.info('updateValue', value);
    this.setState(value);
  }

  updateRecurrence(value) {
    logger.info('updateRecurrence', value);
    const {recurrence} = this.getValues();

    if (recurrence.periode!=='none') {
      this.setState({recurrence:{...recurrence, ...value}});
    } else {
      logger.info('uu rr',{...value, rythme:1, jours:[], limite:null});
      this.setState({recurrence:{...value, rythme:1, jours:[], limite:null}});
    }
  }
  updateRecurrenceJours(add,jour) {
    const {recurrence} = this.getValues();
    const {jours} = recurrence;
    if (add) {
      this.setState({recurrence: { ...recurrence, jours:[...jours,jour] } });
    } else {
      this.setState({recurrence: { ...recurrence, jours:jours.filter(j=>j!==jour) } });
    }
  }


  resetPopin() {
    const st = { shift_id:null, poste:null, employe:null, start:null, end:null, date:null, recurrence:null };
    this.setState(st);
  }

  saveShift() {

    const shift_id = (this.props.shift && this.props.shift.shift_id) || null;
    let params = this.getValues();
    if (params.date && (params.date === 'object')) params.date = format(params.date, 'yyyy-MM-dd');
    if (shift_id===null || shift_id===undefined) {
      params.date = format(params.date, 'yyyy-MM-dd');
    }
    if (params.recurrence.limite) {
      if (typeof params.recurrence.limite === 'object') params.recurrence.limite = format(params.recurrence.limite, 'yyyy-MM-dd');
    }
 
    this.props.saveShift(shift_id, params);
    this.resetPopin();
    this.props.closeHandler();

  }

  deleteShift() {
    const {shift, deleteShift} = this.props;
    if (shift) {


      Swal.fire({
        title: strings.modules.employes.planning.edit.suppression.alerte.titre,
        text: strings.modules.employes.planning.edit.suppression.alerte.texte,
        focusConfirm: true,
        showCancelButton: true,
        customClass: 'deleteconfirm',
        confirmButtonText: strings.general.dialog.delete,
        cancelButtonText: strings.general.dialog.cancel,
        buttonsStyling: false 
      })
      .then((result) => {
        if (result.value) {
          deleteShift(shift.shift_id);
        }
      });

    }
  }

  checkHour(heure,which) {
    const { start, end } = this.getValues();
    let erreur = null;
    if (which==="start") {
      if (isAfter(heure, end)) {
        erreur = 'start';
      } else {
        this.setState({start: format(heure, 'HH:mm:ss')});
      }
    }
    else if (which==="end") {
      if (isBefore(heure, start)) {
        erreur = 'end';
      } else {
        this.setState({end: format(heure, 'HH:mm:ss')});
      }
    }
    if (erreur) {
      Swal.fire({
        title: strings.modules.employes.planning.edit.error.titre,
        text: strings.modules.employes.planning.edit.error.texte[erreur],
        focusConfirm: true,
        showCancelButton: false,
        customClass: 'heureerror',
        confirmButtonText: 'OK',
        buttonsStyling: false 
      });
    }
  }

  
  render() {
    const {open, shift, closeHandler, types, employes} = this.props;
    const { poste, employe, start, end, date, recurrence } = this.getValues();

    let nom_employe = '';
    if (shift && shift.employe) {
      nom_employe = employes.find(emp=>emp.user_id===shift.employe)['nom'];
    }
    
    // valeurs de récurrence
    let periode = 'none';
    if (recurrence) { periode = recurrence.periode };
    let rythme = 1;
    if (recurrence) { rythme = recurrence.rythme };
    let jours = [];
    if (recurrence) { jours = recurrence.jours };
    let limite = [];
    if (recurrence) { limite = recurrence.limite };

    let display_start = null; 
    if (start) {
      const start_r = start.split(':');
      display_start = add(startOfToday(),{hours:start_r[0], minutes:start_r[1], seconds:start_r[2]});
    }
    let display_end = null;
    if (end) {
      const end_r = end.split(':');
      display_end = add(startOfToday(),{hours:end_r[0], minutes:end_r[1], seconds:end_r[2]});
    }

    
    const joursdelasemaine = [1,2,3,4,5,6,0];
    const joursdumois = [...Array(31).keys()].map((v,i)=>i+1);

    const readytovalidate = (poste && employe && start && end && recurrence && recurrence.periode);
    

    logger.info('recurrence', recurrence, shift && shift.recurrence);
    
    return (
      <Modal
        open={open}
        >
        <div className={ `PlanningShiftEditModal`}>
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ strings.modules.employes.planning.edit[shift?'titre_edit':'titre_new'] }</div>
            </div>
            <div className="body">
              { !shift && (
                <FormControl variant="outlined" className="selecteur-group selecteur-employe">
                  <div className="select-label">{ strings.modules.employes.planning.edit.employe }</div>
                  <Select value={employe} onChange={(event) => { this.updateValue({employe: event.target.value}) }} className="selecteur selecteur-employe">
                    {employes.map(emp => (
                      <MenuItem key={ `emp-${emp.user_id}`} value={ emp.user_id }>{ emp.nom }</MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
              {(shift && shift.employe) && <div className="form-group">
                <div className="label">{ strings.modules.employes.planning.edit.employe }</div>
                <div className="valeur nom-employe">{ nom_employe }</div>
              </div>}

              
              <FormControl variant="outlined" className="selecteur-group selecteur-poste">
                <div className="select-label">{ strings.modules.employes.planning.edit.poste }</div>
                <Select value={poste} onChange={(event) => { this.updateValue({poste: event.target.value}) }} className="selecteur selecteur-poste">
                  {types.map(typ => (
                    <MenuItem key={ `emp-${typ.id}`} value={ typ.id }>{ typ.nom }</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <div className="form-group date">
                    <div className="label">{ strings.modules.employes.planning.edit.date }</div>
                    <MuiPickersUtilsProvider utils={LocalizedDayUtils} locale={ frLocale }>
                      <KeyboardDatePicker
                        id="limite"
                        margin="dense"
                        value={ date }
                        format="d MMM yyyy"
                        onChange={(val) => { this.updateValue({date: val})}}
                        KeyboardButtonProps={{ 'aria-label': 'change date' }}
                        clearLabel={ strings.general.dialog.clear }
                        cancelLabel={ strings.general.dialog.cancel }
                      />
                    </MuiPickersUtilsProvider>
                  </div>
              <div className="heures">
                <MuiPickersUtilsProvider utils={LocalizedDayUtils} locale={frLocale}>

                  <KeyboardTimePicker
                            margin="dense"
                            id="start"
                            ampm={false}
                            className="heure"
                            label={ strings.modules.employes.planning.edit.start }
                            value={display_start}
                            onChange={(heure) => { this.checkHour(heure,'start') }}
                            KeyboardButtonProps={{
                              'aria-label': 'change time',
                            }}
                          />
                  <KeyboardTimePicker
                            margin="dense"
                            id="end"
                            ampm={false}
                            className="heure"
                            label={ strings.modules.employes.planning.edit.end }
                            value={display_end}
                            onChange={(heure) => { this.checkHour(heure,'end') }}
                            KeyboardButtonProps={{
                              'aria-label': 'change time',
                            }}
                          />
                </MuiPickersUtilsProvider>
              </div>

              <FormControl variant="outlined" className="selecteur-group selecteur-recurrence-periode">
                <div className="select-label">{ strings.modules.employes.planning.edit.recurrence.nom }</div>
                <Select value={periode} onChange={(event) => { this.updateRecurrence({periode: event.target.value}) }} className="selecteur selecteur-recurrence-periode">
                  {Object.entries(strings.modules.employes.planning.edit.recurrence.choix).map(([recid,recnom]) => (
                    <MenuItem key={ `emp-${recid}`} value={ recid }>{ recnom }</MenuItem>
                    ))}
                </Select>
              </FormControl>
              {periode!=='none' && <div className="form-group rythme">
                  <div className="label">{ strings.modules.employes.planning.edit.recurrence.rythme[periode][0] }</div><TextField className="rythme-val" type="number" name="rythme" defaultValue={rythme} onChange={(event) => { this.updateRecurrence({rythme: event.target.value}) }} /><div className="label">{ strings.modules.employes.planning.edit.recurrence.rythme[periode][1] }</div>
              </div>
              }
              <div className="recurrence-params">
                {periode==='semaine' && <div className="form-group jours semaine">
                    <div className="label">{ strings.modules.employes.planning.edit.recurrence.jours.semaine }</div>
                    <div className="jours-semaine">
                      {joursdelasemaine.map(jourid=>(
                        <JourCheckbox label={ strings.general.jours[jourid].substr(0,1) } key={jourid} checked={jours.indexOf(jourid)>-1} className="jour" changeHandler={(val)=>{ this.updateRecurrenceJours(val,jourid) } } />
                      ))}
                    </div>
                </div>
                }
                {periode==='mois' && <div className="form-group jours mois">
                  <div className="label">{ strings.modules.employes.planning.edit.recurrence.jours.mois }</div>
                  <div className="jours-mois">
                    {joursdumois.map(jourid=>(
                      <JourCheckbox label={ jourid } key={jourid} checked={jours.indexOf(jourid)>-1} className="jour" changeHandler={(val) => { this.updateRecurrenceJours(val,jourid) }} />
                    ))}
                  </div>
                </div>}
                {periode!=='none' && <div className="form-group limite">
                    <div className="label">{ strings.modules.employes.planning.edit.recurrence.limite }</div>
                    <MuiPickersUtilsProvider utils={LocalizedDayUtils} locale={ frLocale }>
                      <KeyboardDatePicker
                        id="limite"
                        margin="normal"
                        value={ limite }
                        format="d MMM yyyy"
                        onChange={(val) => { this.updateRecurrence({limite: val})}}
                        KeyboardButtonProps={{ 'aria-label': 'change date' }}
                        clearLabel={ strings.general.dialog.clear }
                        cancelLabel={ strings.general.dialog.cancel }
                      />
                    </MuiPickersUtilsProvider>
                  </div>
                }
              </div>

            </div>
            <div className="footer">
            <StdButton 
                identifier="modal-suppr" 
                elementclass="suppr" 
                icon={ false } 
                disabled={ shift===null || shift===undefined }
                text={ strings.modules.employes.planning.edit.suppression.bouton } 
                onClick={this.deleteShift} 
              />
              <StdButton 
                identifier="modal-save" 
                elementclass="save" 
                icon={ false } 
                disabled={ !readytovalidate }
                text={ strings.general.dialog.save } 
                onClick={this.saveShift} 
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

};

class PlanningSemaine extends React.Component {

  constructor(props) {
    super(props);
    this.state={
      lockColonnes: [0,1,2,3,4,5,6]
    }
    this.getJours = this.getJours.bind(this);
    this.getPlanning = this.getPlanning.bind(this);
    this.setPosteToShift = this.setPosteToShift.bind(this);
    this.lockHandler = this.lockHandler.bind(this);
  }

  getJours() {
    const {startDate} = this.props;

    return ([1,2,3,4,5,6,0]).map((jr,i)=>(
      {
        date: addDays(startDate, i),
        nom: format(addDays(startDate, i),"EEEE';'d/MM", {locale:frLocale}), 
        today: isToday(addDays(startDate, i))
      }
    ));
  }

  getPlanning() {
    const {liste, startDate} = this.props;

    return liste.map(emp => {
      const jours = ([1,2,3,4,5,6,0]).map((jr,i)=>this.getPlanningJour(addDays(startDate, i), emp.shifts));
      return {
        employe: emp.nom,
        id: emp.user_id,
        jours: jours,
        total: this.getPlanningTotal(jours)
      }
    })

  }
  
  getPlanningTotal(jours) {
    let total = 0;
    jours.forEach(jour=> {
      jour.shifts.forEach(shift => {
        const start = shift.start.split(':');
        const end = shift.end.split(':');
        logger.info('start-end', start, end);
        logger.info('shift poste tps', shift.poste);
        if (shift.poste.tps) {
          total += add(startOfToday(), {hours:Number(end[0]), minutes:Number(end[1])}).getTime() - add(startOfToday(), {hours:Number(start[0]), minutes:Number(start[1])}).getTime();
        }
      });
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
          if (sh.recurrence.periode==='semaine') {
            // si la semaine en cours ne tombe pas sur celle du shift 
            // ou si le jour n'est pas dans la liste du shift
            // -> pas de shift
            if ((((getWeek(date) - getWeek(shdate)) % Number(sh.recurrence.rythme))!==0) || (sh.recurrence.jours.indexOf(getDay(date))===-1)) ok = false;
          } 
          // • par mois
          if (sh.recurrence.periode==='mois') {
            
            // si le mois en cours ne tombe pas sur celle du shift
            // ou si le jour n'est pas dans la liste du shift (premier jour du mois, dernier jour du mois ou un jour de la liste)
            // -> pas de shift
            if (
              ((getMonth(date) - getMonth(shdate)) % Number(sh.recurrence.rythme))!==0 || 
              (sh.recurrence.jours[0]===0 && isFirstDayOfMonth(shdate)) ||
              (sh.recurrence.jours[0]===-1 && isLastDayOfMonth(shdate)) ||
              (sh.recurrence.jours.indexOf(getDay(shdate))===-1)
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

    return {
      date: date,
      shifts: this.setPosteToShift(__shifts),
      today: isToday(date)
    }
  }

  setPosteToShift(shifts) {
    logger.info(shifts.length);
    const {shifttypes} = this.props;
    return shifts.map(sh=>{ return {...sh, poste:shifttypes.find(st=>st.id===sh.poste)} });
  }

  lockHandler(colonne) {
    const {lockColonnes} = this.state;
    if (lockColonnes.indexOf(colonne)>-1) {
      this.setState({lockColonnes: lockColonnes.filter(c=>c!==colonne)});
    } else {
      this.setState({lockColonnes: [...lockColonnes, colonne]});
    }
  }

  render() {
    const { liste, startDate, openEditor } = this.props;
    const { lockColonnes } = this.state;

    const jours = (startDate) ? this.getJours() : null;
    const planning = (liste) ? this.getPlanning() : null;

    const addShiftHandler = (date, colonne) => {
      if (lockColonnes.indexOf(colonne)===-1) {
        openEditor(null,date);
      }
    }
    const editShiftHandler = (shift_id, colonne) => {
      if (lockColonnes.indexOf(colonne)===-1) {
        openEditor(shift_id);
      }
    }


    const _ecartToHmm = (ms) => {
      const h = 3600 * 1000;
      const s = ms<0 ? '-':'';
      const dh = Math.floor(Math.abs(ms)/h);
      const dm = Math.round((Math.abs(ms)%h)/60000).toString().padStart(2, '0');
      return `${s} ${dh}h${(dm!=='00'?dm:'')}`;
    }

    logger.info('planning', planning);

    return(
      <TableContainer className="planning-week">
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell key="h-employe" className="h-employe">{ strings.modules.employes.planning.grille.employes }</TableCell>
              {jours.map((jour,i) => (
                <TableCell key={ `h-jour-${i}` } className={ `h-jour${(jour.today?' jour-today':'')}` }>
                  <div className="nom">{ jour.nom.split(';')[0] }<br />{ jour.nom.split(';')[1] }</div>
                  <div className="btns">
                  <div className={ `add-btn${(lockColonnes.indexOf(i)>-1 ? ' closed':'')}` } onClick={()=>{ addShiftHandler(jour.date, i)}}>+</div>
                  <div className={ `lock-btn${(lockColonnes.indexOf(i)>-1 ? ' closed':'')}` } onClick={()=>{ this.lockHandler(i)}}>
                    <LockIcon className="lock" htmlColor="#F7F7F7" />
                    <LockOpenIcon className="lockopen" htmlColor="#F7F7F7" />
                  </div>
                  </div>
                </TableCell>
              ))}
              <TableCell key="h-total" className="h-total">{ strings.modules.employes.planning.grille.total }</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {planning.map((pl,rowindex) => (
            <TableRow key={ rowindex }>
              <TableCell key={ `b-employe-${pl.id}` } className="b-employe"><div className="nom">{ pl.employe }</div></TableCell>
              {pl.jours.map((pljr,j) => (
                <TableCell key={ `b-jour-${j}` } className={ `b-jour${(pljr.today?' jour-today':'')}${(lockColonnes.indexOf(j)>-1 ? ' closed':'')}` }>
                  {pljr.shifts.map((sh,k) => (
                    <div key={ `sh-${k}`} className={ `shift color-${sh.poste.couleur}` } onClick={()=>{ editShiftHandler(sh.shift_id, j) }}>
                      <div className="creneau">{ `${sh.start.substr(0,5)}-${sh.end.substr(0,5)}` }</div>
                      <div className="poste">{ sh.poste.nom }</div>
                    </div>
                  ))}
                </TableCell>
              ))}
              <TableCell key="h-total" className="h-total">{ _ecartToHmm(pl.total) }</TableCell>
            </TableRow>))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}


class Plannings extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      view: 'semaine',
      startDate: startOfWeek(new Date(), {weekStartsOn:1}),
      endDate: endOfWeek(new Date(), {weekStartsOn:1}),
      editOpen: false,
      editShift: null,
      editDate: null
    };
    this.setSelectedDate = this.setSelectedDate.bind(this);
    this.changeStartDate = this.changeStartDate.bind(this);
    this.getListe = this.getListe.bind(this);
    this.formatWeekSelectLabel = this.formatWeekSelectLabel.bind(this);
    this.openEditor = this.openEditor.bind(this);
    this.closeEditor = this.closeEditor.bind(this);
    this.saveShift = this.saveShift.bind(this);
  }

  componentDidMount() {
    this.props.getAllPointages();
    this.props.getAllShifts();
    this.props.getParametres();
    this.props.getUsers();
  }
 
  changeStartDate(suivant) {
    const {startDate} = this.state;
    const start = startOfWeek(suivant?addWeeks(startDate,1):subWeeks(startDate,1), {weekStartsOn:1});
    this.setState({startDate:start});
  }

  setSelectedDate(date) {
      this.setState({startDate:startOfWeek(date, {weekStartsOn:1})});
  }
  formatWeekSelectLabel = (date) => {

    return `Semaine du ${format(startOfWeek(date, {weekStartsOn:1}), "d MMMM", {locale:frLocale})}`
  };

  getListe() {
    const { shifts, employes } = this.props;

    return employes.map((emp) => (
      {
        nom: emp.nom,
        user_id: emp.user_id,
        status: emp.status,
        shifts: shifts.filter(sh=>sh.employe===emp.user_id)
      }
    ))

  }

  openEditor(shift_id, date=null) {
    const { shifts } = this.props;
    const shift = shifts.find(sh => sh.shift_id===shift_id)
    this.setState({editOpen:true, editShift:shift, editDate:date});
  }

  closeEditor() {
    this.setState({editOpen:false, editShift:null, editDate:null});
  }

  saveShift(shift_id, params) {
    if (shift_id==null) {
      this.props.createShift(params);
    } else {
      this.props.updateShift(params);
    }
  }

 render() {

  const { employes, params, deleteShift } = this.props;
  const { view, startDate, editOpen, editShift, editDate } = this.state;

  const { shifttypes } = params || {shifttypes:null};

  const liste = this.getListe();

  return (
    <div className="Plannings">
      <div className="zoneBoutons">
        <div className="buttons">
          <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text="Retour" onClick={ () => { history.push(paths.EMPLOYES) }} />
        </div>
        <div class="dates">
            <Fab aria-label="previous" size="small" className="previous-button" onClick={ () => { this.changeStartDate(false) }}>
              <BackIcon />
            </Fab>
          <div className="titre">Planning</div>
          <MuiPickersUtilsProvider utils={LocalizedWeekUtils} locale={ frLocale }>
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
            <Fab aria-label="next" size="small" className="next-button" onClick={ () => { this.changeStartDate(true) }}>
              <NextIcon />
            </Fab>
        </div>
        {/* <div className="taille">
          <StdButton identifier="btnjour" elementclass="btnjour" key="btnjour" text="Jour" noStroke={true} onClick={ () => void(0) } />
          <StdButton identifier="btnsemaine" elementclass="btnsemaine" key="btnsemaine" text="Semaine" noStroke={true} onClick={ () => void(0) } />
          <StdButton identifier="btnmois" elementclass="btnmois" key="btnmois" text="Mois" noStroke={true} onClick={ () => void(0) } />
        </div> */}
      </div>
      <div className="zoneliste">
        <div className="wrapper">
          {view==='semaine'&&(
            <PlanningSemaine 
              liste={liste} 
              startDate={startDate} 
              shifttypes={ shifttypes }
              openEditor={this.openEditor}  
            />
          )}
        </div>
      </div>
      <ShiftEditModal 
        open={ editOpen }
        shift={editShift}
        shiftdate={editDate}
        types={shifttypes}
        employes={employes}
        closeHandler={ this.closeEditor } 
        saveShift={this.saveShift} 
        deleteShift={deleteShift}
      />
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