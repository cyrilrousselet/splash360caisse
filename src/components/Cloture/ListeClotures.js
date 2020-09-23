import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import TopZone from '../../containers/TopZone';
import LoadingSpinner from '../common/LoadingSpinner';
import history from '../../helpers/history';
import paths from './../../constants/routes.json';

import 'date-fns';
import { format, compareAsc, compareDesc, startOfToday, endOfToday, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import PageviewIcon from '@material-ui/icons/Pageview';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';


import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import StdButton from '../common/StdButton';
import PrinterIcon from '../common/icon/PrinterIcon';
import { Modal, Fab, Input, Badge, ListItemAvatar } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import PillField from '../common/PillField';
import NumberKeyboard from '../common/NumberKeyboard';
import Swal from 'sweetalert2';

import Logger from '../../helpers/Logger';
import {devise} from '../../helpers/toolbox';

const logger = new Logger();

let strings = new LocalizedStrings(data);



class LocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "d MMM yyyy", { locale: this.locale });
  }
}


function TicketX(props) {
  const {cloture} = props;
  const __strimp = strings.modules.cloture.impression;
  const { periode } = cloture;


  let vndvnt = 0, vndrmb = 0, vndtotal = 0;
  periode.ventilation.vendeur.forEach(vendeur => {
      vndvnt += vendeur.ventes;
      vndrmb += vendeur.remboursements;
      vndtotal += (vendeur.ventes-vendeur.remboursements);
  });


  let tvaht = 0, tvamnt = 0, tvattc = 0;
  periode.ventilation.tva.forEach(tva => { 
      tvaht += tva.ht;
      tvamnt += tva.montant;
      tvattc += tva.ttc;
  });

  let moytotal = 0;
  periode.ventilation.moyen.forEach(moyen => { 
      moytotal += moyen.valeur;
  });


  return (

  <div className="ticket-x">
    <div className="blocwrapper">
      <div className="periode">
        <div className="ttl">{ __strimp.periode.titre }</div>
        <div className="val">{ `${format(new Date(periode.debut), "dd/MM/yyyy - HH:mm:ss", { locale: frLocale })}  ->  ${format(new Date(periode.fin), "dd/MM/yyyy - HH:mm:ss", { locale: frLocale })}` }</div>
        { periode.editeur && <div className="editeur">{ `${__strimp.editeur} ${periode.editeur.nom} (${periode.editeur.id})` }</div>}
      </div>
      <div className="sel">
        {(periode.vendeurs.length>1) && (<div className="val">{ `${__strimp.vendeurs[1]}${strings.vendeurs_all}` }</div>)}
        {(periode.vendeurs.length==1) && (<div className="val">{ `${__strimp.vendeurs[0]}${periode.vendeurs[0].nom} (${periode.vendeurs[0].id})` }</div>)}
        {(periode.caisses.length>1) && (<div className="val">{ `${__strimp.caisses[1]}${strings.caisses_all}` }</div>)}
        {(periode.caisses.length==1) && (<div className="val">{ `${__strimp.caisses[0]}${periode.caisses[0].nom} (${periode.caisses[0].id})` }</div>)}
      </div>
      <div className="recap">
        <div className="recap-item">
          <div className="nom">{ __strimp.depenses }</div>
          <div className="val">{ devise(periode.depenses) }</div>
        </div>
        <div className="recap-item">
          <div className="nom">{ __strimp.remboursements }</div>
          <div className="val">{ devise(periode.remboursements) }</div>
        </div>
        <div className="recap-item">
          <div className="nom">{ __strimp.encaissements }</div>
          <div className="val">{ devise(periode.ventes) }</div>
        </div>
        <div className="recap-item">
          <div className="nom">{ __strimp.mtcaisse }</div>
          <div className="val">{ devise(periode.mtcaisse) }</div>
        </div>
      </div>
      <div className="titre">
        { __strimp.titre.x }
      </div>
      <div className="detail">
        <div className="detail-item">
          <div className="nom">{__strimp.caption.ventes}</div>
          <div className="val">{devise(periode.ventes)}</div>
        </div>
        <div className="detail-item">
          <div className="nom">{__strimp.caption.remboursements}</div>
          <div className="val">{`-${devise(periode.remboursements)}`}</div>
        </div>
        <div className="detail-item pre-filet post-space">
          <div className="nom">{__strimp.caption.ca}</div>
          <div className="val">{devise(periode.ca)}</div>
        </div>
        <div className="detail-item total">
          <div className="nom">{__strimp.caption.numtickets}</div>
          <div className="val">{periode.numtickets}</div>
        </div>
        <div className="detail-item total">
          <div className="nom">{__strimp.caption.ticket_moyen}</div>
          <div className="val">{devise(periode.ticket_moyen)}</div>
        </div>
      </div>
      <div className="titre">
        { __strimp.ventilation.vendeur }
      </div>
      <div className="ventil intit ventil-vendeur">
        <div className="ventil-intit"></div>
        <div className="ventil-intit">{__strimp.caption.vente_short}</div>
        <div className="ventil-intit">{__strimp.caption.remboursements_short}</div>
        <div className="ventil-intit">{__strimp.caption.ca_short}</div>
      </div>
      {periode.ventilation.vendeur.map(vendeur => (
        <div className="ventil ventil-vendeur" key={`vnd-${vendeur.id}`}>
          <div className="ventil-nom">{`${vendeur.nom} (${vendeur.id})`}</div>
          <div className="ventil-val">{devise(vendeur.ventes)}</div>
          <div className="ventil-val">{`-${devise(vendeur.remboursements)}`}</div>
          <div className="ventil-val">{devise(vendeur.ventes-vendeur.remboursements)}</div>
        </div>
      ))}
      <div className="ventil ventil-vendeur total">
        <div className="ventil-nom">{__strimp.caption.total}</div>
        <div className="ventil-val">{devise(vndvnt)}</div>
        <div className="ventil-val">{`-${devise(vndrmb)}`}</div>
        <div className="ventil-val">{devise(vndtotal)}</div>
      </div>
      <div className="titre">
        { __strimp.ventilation.tva }
      </div>
      <div className="ventil intit ventil-tva">
        <div className="ventil-intit">{__strimp.caption.type}</div>
        <div className="ventil-intit">{__strimp.caption.ht}</div>
        <div className="ventil-intit">{__strimp.caption.tva}</div>
        <div className="ventil-intit">{__strimp.caption.ttc}</div>
      </div>
      {periode.ventilation.tva.map(tva => (
        <div className="ventil ventil-vendeur" key={ `ventil-${tva.id}` }>
          <div className="ventil-nom">{`${devise(tva.taux*100)}%`}</div>
          <div className="ventil-val">{devise(tva.ht)}</div>
          <div className="ventil-val">{devise(tva.montant)}</div>
          <div className="ventil-val">{devise(tva.ttc)}</div>
        </div>
      ))}
      <div className="ventil ventil-vendeur total">
        <div className="ventil-nom">{__strimp.caption.total}</div>
        <div className="ventil-val">{devise(tvaht)}</div>
        <div className="ventil-val">{devise(tvamnt)}</div>
        <div className="ventil-val">{devise(tvattc)}</div>
      </div>
      <div className="titre">
        { __strimp.ventilation.moyen }
      </div>
      {periode.ventilation.moyen.map(moyen => (
        <div className="ventil ventil-vendeur" key={ `ventil-${moyen.moyen}` }>
          <div className="ventil-nom">{__strimp.caption.moyens[moyen.moyen]}</div>
          <div className="ventil-val">{devise(moyen.valeur)}</div>
        </div>
      ))}
      <div className="ventil ventil-vendeur total">
        <div className="ventil-nom">{__strimp.caption.total}</div>
        <div className="ventil-val">{devise(moytotal)}</div>
      </div>
    </div>
  </div>


  );

}



function CloturePopin(props) {
  const { cloture, open, closeHandler, printCloture } = props;

  return (
    <Modal
      open={ open }
      >
      <div className="ViewCloturePopin">
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.listeclotures.view.titre }</div>
          </div>
          <div className="body">
            {cloture && <TicketX cloture={cloture} className="ticket-x" />}
          </div>
          <div className="footer">
            {cloture && <StdButton identifier="none" elementclass="print-cloture" icon={ false } noStroke={true} text={ strings.general.dialog.print } onClick={() => { printCloture(cloture) }} />}
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>
  );
}




function TableClotures(props) {
  const { liste, id, openClotureId, printClotureId, ...other } = props;

  liste.sort((a,b) => {
    let da = new Date(a.cloture.debut), db = new Date(b.cloture.debut);
    return compareAsc(da, db);
  });

  return (
    <TableContainer className="table-cont">
      <Table size="small" key={id} aria-label="a dense table" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell key={`${id}-hd-id`} className="liste-id">{ strings.modules.listeclotures.liste.id }</TableCell>
            <TableCell key={`${id}-hd-debut`} className="liste-debut">{ strings.modules.listeclotures.liste.debut }</TableCell>
            <TableCell key={`${id}-hd-fin`} className="liste-fin">{ strings.modules.listeclotures.liste.fin }</TableCell>
            <TableCell key={`${id}-hd-ht`} className="liste-ht">{ strings.modules.listeclotures.liste.ht }</TableCell>
            <TableCell key={`${id}-hd-ventes`} className="liste-ventes">{ strings.modules.listeclotures.liste.ventes }</TableCell>
            <TableCell key={`${id}-hd-nombre`} className="liste-nombre">{ strings.modules.listeclotures.liste.nombre }</TableCell>
            <TableCell key={`${id}-hd-actions`} className="liste-actions">{ strings.modules.listeclotures.liste.actions }</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {liste.map((row, i) => (
            <TableRow key={row.id} className={ `${(i%2)?'odd':'even'}` }>
              <TableCell key={`${row.id}-id`} className="liste-id">{ row.cloture.clotureId }</TableCell>
              <TableCell key={`${row.id}-debut`} className="liste-debut">{ format(new Date(row.cloture.debut), "d MMM yyyy à HH:mm", { locale: frLocale }) }</TableCell>
              <TableCell key={`${row.id}-fin`} className="liste-fin">{ format(new Date(row.cloture.fin), "d MMM yyyy à HH:mm", { locale: frLocale }) }</TableCell>
              <TableCell key={`${row.id}-ht`} className="liste-ht">{ `${row.cloture.ht} €` }</TableCell>
              <TableCell key={`${row.id}-ventes`} className="liste-ventes">{ `${row.cloture.ventes} €` }</TableCell>
              <TableCell key={`${row.id}-nombre`} className="liste-nombre">{ row.cloture.nombre }</TableCell>
              <TableCell key={`${row.id}-actions`} className="liste-actions">
                <StdButton key={`${row.id}-view`} identifier='view' elementclass="action action-view" icon={ <PageviewIcon htmlColor="#ffffff" /> } noStroke={true} text={ '' } onClick={ () => { openClotureId(row.cloture.clotureId) } } />
                <StdButton key={`${row.id}-print`} identifier='print' elementclass="action action-print" icon={ <PrinterIcon htmlColor="#ffffff" /> } noStroke={true} text={ '' } onClick={() => { printClotureId(row.cloture.clotureId) }} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 



class ListeClotures extends React.Component {
  
  
  constructor(props) {
    super(props);
    this.state = {
      startDate: startOfToday(),
      endDate: endOfToday(),
      cloture: null,
      clotureId: null,
      clotureOpen: false
    };
    this.setSelectedDate = this.setSelectedDate.bind(this);
    this.openCloture = this.openCloture.bind(this);
    this.openClotureId = this.openClotureId.bind(this);
    this.closeCloture = this.closeCloture.bind(this);
    this.printCloture = this.printCloture.bind(this);
    this.printClotureId = this.printClotureId.bind(this);
  }
    
  componentDidMount() {
    logger.log('ListeClotures.componentDidMount()');
    this.props.getCloturesList();
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

  openCloture(cloture) {
    this.setState({cloture: cloture, clotureOpen: true});
  }
  openClotureId(cloid) {
    const cloture = this.props.clotureslist[cloid];
    if (cloture) {
      this.setState({clotureId: cloid, cloture: cloture, clotureOpen: true});
  } else {
    logger.error('ListeClotures.openClotureId()', `cloture clotureId=${cloid} inconnue`);
  }
  }

  closeCloture() {
    this.setState({clotureId: null, cloture:null, clotureOpen: false});
  }

  printCloture(cloture) {
    logger.log('printCloture()');
    if (cloture) {
      this.props.printCloture(cloture);
    } else {
      logger.error('ListeClotures.printCloture()', `cloture nulle`);
    }
  }

  printClotureId(cloid) {
    logger.log('printClotureId()', cloid);
    const cloture = this.props.clotureslist[cloid];
    if (cloture) {
      // changement du format des dates :
      let periode = cloture.periode;
      periode.debut = new Date(periode.debut);
      periode.fin = new Date(periode.fin);
      this.props.printCloture({periode:periode});
    } else {
      logger.error('ListeClotures.printClotureId()', `cloture clotureId=${cloid} inconnue`);
    }
  }

  getSynthese(clotures) {
    logger.log('getSynthese()');

    if (clotures.length>0) {

      let __start = startOfToday() 
         ,__end = startOfDay(new Date('2000-01-01'))
         ,__vnd = []
         ,__csh = []
         ,__dep = 0
         ,__rmb = 0
         ,__vnt = 0
         ,__mtc = 0
         ,__ca = 0
         ,__ntk = 0
         ,__tkm = 0
         ,__vvnd = []
         ,__vtva = []
         ,__vmoy = []
         ;

      clotures.forEach(cl => {
        const periode = this.props.clotureslist[cl.id].periode;
        
        // récup des dates extrêmes de la liste des clotures
        if ( isBefore(new Date(periode.debut), __start) ) __start = new Date(periode.debut);
        if ( isAfter(new Date(periode.fin), __end) ) __end = new Date(periode.fin);

        // récup de la liste des vendeurs
        // s'il n'y a qu'un seul vendeur dans la période et dans la liste
        // on vérifie si c'est le même
        if (periode.vendeurs.length==1 && __vnd.length==1) {
          let __v = __vnd.filter(v => v.id==periode.vendeurs[0].id);
          if (__v) __vnd = __v;
        } else {
          __vnd = __vnd.concat(periode.vendeurs);
        }
        // récup de la liste des caisses
        // s'il n'y a qu'une seule caisses dans la période et dans la liste
        // on vérifie si c'est la même
        if (periode.caisses.length==1 && __csh.length==1) {
          let __c = __csh.filter(c => c.id==periode.caisses[0].id);
          if (__c) __csh = __c;
        } else {
          __csh = __csh.concat(periode.caisses);
        }

        // addition des dépenses
        __dep += periode.depenses;
        // addition des remboursements
        __rmb += periode.remboursements;
        // addition des ventes
        __vnt += periode.ventes;
        // addition des montants caisse
        __mtc += periode.mtcaisse;
        // addition des chiffres d'affaires
        __ca += periode.ca;
        // addition du nombre de tickets
        __ntk += periode.numtickets;
        // addition des valeurs du ticket moyen
        __tkm += periode.ticket_moyen;

        // compilation des ventilations

        // ventilation vendeurs
        periode.ventilation.vendeur.forEach(v => {

          let __vv = __vvnd.find(vv => vv.id==v.id);
          let __vvi = __vvnd.findIndex(vv => vv.id==v.id);
          // si le vendeur n'est pas encore récupéré, on l'ajoute
          if (__vv==undefined) {
            __vvnd.push(v);
          }
          // si le vendeur est déjà récupéré, on additionne les valeurs des clôtures
           else {
            __vv.ventes += v.ventes;
            __vv.remboursements += v.remboursements;
            __vvnd[__vvi] = __vv;
          }
        });

        // ventilation tva
        periode.ventilation.tva.forEach(t => {

          let __tt = __vtva.find(tt => tt.id==t.id);
          let __tti = __vtva.findIndex(tt => tt.id==t.id);
          // si la tva n'est pas encore récupérée, on l'ajoute
          if (__tt==undefined) {
            __vtva.push(t);
          }
          // si la tva est déjà récupérée, on additionne les valeurs des clôtures
           else {
            __tt.ht += t.ht;
            __tt.montant += t.montant;
            __tt.ttc += t.ttc;
            __vtva[__tti] = __tt;
          }
        });

        // ventilation moyens de paiement
        periode.ventilation.moyen.forEach(m => {

          let __mm = __vmoy.find(mm => mm.moyen==m.moyen);
          let __mmi = __vmoy.findIndex(mm => mm.moyen==m.moyen);
          // si le moyen n'est pas encore récupéré, on l'ajoute
          if (__mm==undefined) {
            __vmoy.push(m);
          }
          // si le moyen est déjà récupéré, on additionne les valeurs des clôtures
           else {
            __mm.valeur += m.valeur;
            __vmoy[__mmi] = __mm;
          }
        });
      
      })
      
      let synthese = {
        debut: __start.getTime(),
        fin: __end.getTime(),
        editeur: {nom:'-Synthèse-'},
        vendeurs: __vnd,
        caisses: __csh,
        depenses: __dep,
        remboursements: __rmb,
        ventes: __vnt,
        mtcaisse: __mtc,
        ca: __ca,
        numtickets: __ntk,
        ticket_moyen: __tkm/clotures.length,
        ventilation: {
          vendeur: __vvnd, 
          tva: __vtva,
          moyen: __vmoy
        }
      };
      
      this.openCloture({periode:synthese});

    }

  }

  render() {
    const { clotureslist, error, loading } = this.props;
    const { startDate, endDate, clotureId, cloture, clotureOpen } = this.state;

    const self = this;

    let clotures = [];

    if (clotureslist) {
      Object.entries(clotureslist).forEach(([key,value])=> {

        let __d = new Date(value.periode.debut);
        let __f = new Date(value.periode.fin);

        if (startDate!==null && 
            endDate!==null &&
            isAfter(__d, startDate) && 
            isBefore(__f, endDate)
        ) {
          
          let ht = 0;
          value.periode.ventilation.tva.forEach(t => { ht += t.hasOwnProperty('ht') ? t.ht : 0; });
          
          clotures.push({
            id:key,
            cloture: {
              clotureId: value.clotureId,
              debut: value.periode.debut,
              fin: value.periode.fin,
              ht: devise(ht),
              ventes: devise(value.periode.ca),
              nombre: value.archivedcommandesid.length
            }
          });
        } 
      });
    }

    return (
      <div className="ListeClotures container">
        <TopZone />
        <div className="MainZone">
          <div className="dates">
            <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text={ strings.general.dialog.back } onClick={ () => { history.push(paths.CLOTURE) }} />
            <div className="date-pickers">
              <MuiPickersUtilsProvider utils={LocalizedUtils} locale={ frLocale }>
                <div className="caption space-left">{ strings.modules.listeclotures.dates.start}</div>
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
                <div className="caption">{ strings.modules.listeclotures.dates.end}</div>
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
            <StdButton identifier="btnsynthese" elementclass="btnsynthese" key="btnsynthese" text={ strings.modules.listeclotures.actions.synthese } onClick={ () => { this.getSynthese(clotures) }} />
          </div>
          <TableClotures className="liste-clotures" id="liste-clotures" printClotureId={ this.printClotureId } openClotureId={ this.openClotureId } liste={clotures} />
        </div>
        <CloturePopin cloture={ cloture } open={clotureOpen} closeHandler={ this.closeCloture } printCloture={ this.printCloture} />
      </div>
    )
  }
};

export default ListeClotures;

