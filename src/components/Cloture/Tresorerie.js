import React from 'react';


import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import TopZone from '../../containers/TopZone';
import history from '../../helpers/history';
import paths from './../../constants/routes.json';

import 'date-fns';
import { format, compareAsc } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {devise} from '../../helpers/toolbox';


import StdButton from '../common/StdButton';
// import PageviewIcon from '@material-ui/icons/Pageview';

import MouvementPopin from './MouvementPopin';
import { dateBounds } from '../../helpers/toolbox';

import Logger from '../../helpers/Logger';
// import {devise} from '../../helpers/toolbox';

const logger = new Logger();

let strings = new LocalizedStrings(data);


class LocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "d MMM yyyy", { locale: this.locale });
  }
}




function TableMouvements(props) {
  // const { liste, id, openMouvementId, caisses } = props;
  const { liste, id, caisses } = props;


  let _mouvements = [];
  if (liste) {
    _mouvements = Object.values(liste).map((m) => m);

    _mouvements.sort((a,b) => {
      let da = new Date(a.createdAt), db = new Date(b.createdAt);
      return compareAsc(da, db);
    });
  }

  const _getNomCaisse = (id) => {
    const csh = caisses.find((c) => c.uniqid === id);
    if (csh) {
      return csh.nom;
    } else {
      return id;
    }
  }

  // let _prevSolde = 0;

  // const _calculeSolde = (mvt) => {

  //   if ((["ouverture","cloture"]).includes(mvt.type)) {
  //     _prevSolde = mvt.solde;
  //   } else {
  //     _prevSolde += mvt.credit;
  //     _prevSolde -= mvt.debit;
  //   }
  //   return _prevSolde;
  // }

  const _hasEcart = (mvt) => {
    return (mvt.type==="ouverture" && (mvt.credit>0 || mvt.debit>0));
  }

  return (
    <TableContainer className="table-cont">
      <Table size="small" key={id} aria-label="a dense table" stickyHeader>
        <TableHead>
          <TableRow>
            {/* <TableCell key={`${id}-hd-id`} className="liste-id">{ strings.modules.tresor.liste.id }</TableCell> */}
            <TableCell key={`${id}-hd-date`} className="liste-date">{ strings.modules.tresor.liste.date }</TableCell>
            <TableCell key={`${id}-hd-origine`} className="liste-origine">{ strings.modules.tresor.liste.origine }</TableCell>
            <TableCell key={`${id}-hd-destination`} className="liste-destination">{ strings.modules.tresor.liste.destination }</TableCell>
            <TableCell key={`${id}-hd-debit`} className="liste-debit">{ strings.modules.tresor.liste.debit }</TableCell>
            <TableCell key={`${id}-hd-credit`} className="liste-credit">{ strings.modules.tresor.liste.credit }</TableCell>
            <TableCell key={`${id}-hd-montant`} className="liste-montant">{ strings.modules.tresor.liste.montant }</TableCell>
            <TableCell key={`${id}-hd-type`} className="liste-type">{ strings.modules.tresor.liste.type }</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {_mouvements.map((row, i) => (
            <TableRow key={row.id} className={ `${(i%2)?'odd':'even'} type-${row.type} ${_hasEcart(row) && 'ecart'}` } >
              {/* <TableCell key={`${row.id}-id`} className="liste-id">{ row.tresorId }</TableCell> */}
              <TableCell key={`${row.id}-date`} className="liste-date">{ format(new Date(row.createdAt), "d MMM yyyy à HH:mm", { locale: frLocale }) }</TableCell>
              <TableCell key={`${row.id}-origine`} className="liste-origine">{ ((["cloture","sortie"]).includes(row.type))? _getNomCaisse(row.origine) : row.origine }</TableCell>
              <TableCell key={`${row.id}-destination`} className="liste-destination">{ ((["ouverture","entree"]).includes(row.type))? _getNomCaisse(row.destination) : row.destination }</TableCell>
              <TableCell key={`${row.id}-debit`} className="liste-debit">{ (row.type==="ouverture") ? (row.debit>0 ? `- ${devise(row.debit/100)} €` : '') : `- ${devise(row.debit/100)} €` }</TableCell>
              <TableCell key={`${row.id}-credit`} className="liste-credit">{ (row.type==="ouverture") ? (row.credit>0 ? `+ ${devise(row.credit/100)} €` : '') : `+ ${devise(row.credit/100)} €` }</TableCell>
              <TableCell key={`${row.id}-montant`} className="liste-montant">{ `${devise(row.solde/100)} €` }</TableCell>
              <TableCell key={`${row.id}-type`} className="liste-type">{ strings.modules.tresor.types[row.type] }</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 


class Tresorerie extends React.Component {

  constructor(props) {
    super(props);
    this.newMouvement = this.newMouvement.bind(this);
    // this.openMouvementId = this.openMouvementId.bind(this);
    this.closeMouvement = this.closeMouvement.bind(this);
    this.saveMouvement = this.saveMouvement.bind(this);
    this.setSelectedDate = this.setSelectedDate.bind(this);
    this.getBoundedMouvementsList = this.getBoundedMouvementsList.bind(this);

    const {heure_fin} = props;
    const __todayBounds = dateBounds(new Date(), heure_fin);

    this.state = {
      startDate: __todayBounds.debut,
      endDate: __todayBounds.fin,
      mouvement: null,
      mouvementType: null,
      mouvementOpen: false,
    }
  }

  componentDidMount() {
    logger.log('Tresorerie.componentDidMount()');
    const {caisse, getLastOuvertureAndAfter} = this.props;
    getLastOuvertureAndAfter(caisse.uniqid);
  }



  getBoundedMouvementsList(start, end) {

    const {startDate, endDate} = this.state;

    this.props.getTresors({
      $and: [
        {createdAt: { $gt: start || startDate } }, 
        {createdAt: { $lte: end || endDate } }
      ]});
  }

  setSelectedDate(bound,date) {
    const { startDate, endDate } = this.state;
    const {heure_fin} = this.props;
    const __bd = dateBounds(date, heure_fin);
    
    let d = startDate;
    let f = endDate;

    if (bound==='start') {
      d = (date<=endDate)?__bd.debut:endDate;
      this.setState({startDate: d});
    }
    if (bound==='end') {
      f = (date>=startDate)?__bd.fin:startDate;
      this.setState({endDate:f});
    }

    console.log(
      'setSelectedDate('+bound+')', 
      '('+format(d, "dd/MM/yyyy HH:mm")+' -> '+format(f, "dd/MM/yyyy HH:mm")+')'
    );

    this.getBoundedMouvementsList(d,f);
  }


  newMouvement(type) {
    this.setState({mouvement: null, mouvementOpen: true, mouvementType: type});
  }
  // openMouvementId(mvtid) {
  //   const mouvement = this.props.mouvements[mvtid];
  //   if (mouvement) {
  //     this.setState({mouvement: mouvement, mouvementOpen: true, mouvementType: 'view'});
  //   } else {
  //     logger.error('Tresorerie.openMouvementId()', `mouvement mouvementId=${mvtid} inconnue`);
  //   }
  // }

  closeMouvement() {
    this.setState({mouvement: null, mouvementOpen: false, mouvementType: null});
  }

  saveMouvement(mouvement) {
    const __csh = (["entree", "ouverture"]).includes(mouvement.type) ? mouvement.destination : mouvement.origine;
    this.props.getLastMouvement(__csh)
              .then(__lastmvt => {
                const __lastsolde = __lastmvt ? __lastmvt.lastmouvement.solde : 0;
                console.log('saveMouvement lastSolde: ',__lastsolde);
                const __newsolde = 
                (["entree", "sortie"]).includes(mouvement.type) 
                ? __lastsolde + mouvement.credit - mouvement.debit 
                : mouvement.solde;
                console.log('saveMouvement newSolde: ',__newsolde);
                this.props.addTresor({...mouvement, solde: __newsolde});
                this.closeMouvement();
              });
  }




  render() {

    const { mouvements, caisses } = this.props;
    const { mouvement, mouvementOpen, mouvementType } = this.state;
    const startDate = new Date();
    const endDate = new Date();

    return (
      <div className="Tresorerie container">
        <TopZone />
        <div className="MainZone">
          <div className="dates">
            <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text={ strings.general.dialog.back } onClick={ () => { history.push(paths.CLOTURE) }} />
            <div className="date-pickers">
              <MuiPickersUtilsProvider utils={LocalizedUtils} locale={ frLocale }>
                <div className="caption space-left">{ strings.modules.tresor.dates.start}</div>
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
                <div className="caption">{ strings.modules.tresor.dates.end}</div>
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
            <StdButton identifier="btnentree" elementclass="btnentree" key="btnentree" text={ strings.modules.tresor.actions.entree } onClick={ () => { this.newMouvement('entree') }} />
            <StdButton identifier="btnsortie" elementclass="btnsortie" key="btnsortie" text={ strings.modules.tresor.actions.sortie } onClick={ () => { this.newMouvement('sortie') }} />
          </div>
          <TableMouvements 
            className="liste-mouvements" 
            id="liste-mouvements" 
            // openMouvementId={ this.openMouvementId } 
            liste={mouvements}
            caisses={ caisses } 
          />
        </div>
        <MouvementPopin 
          open={ mouvementOpen } 
          type={ mouvementType } 
          mouvement={ mouvement } 
          caisse={ null }
          caisses={ caisses }
          closeHandler={ this.closeMouvement }
          saveMouvement={ this.saveMouvement }
        />
      </div>
    );
  }

}


export default Tresorerie;