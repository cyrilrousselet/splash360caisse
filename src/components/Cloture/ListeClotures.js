import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import TopZone from '../../containers/TopZone';
import history from '../../helpers/history';
import paths from './../../constants/routes.json';

import 'date-fns';
import { format, compareAsc, startOfToday, startOfDay, isAfter, isBefore, differenceInMinutes, startOfMonth } from "date-fns";
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


import StdButton from '../common/StdButton';
import PrinterIcon from '../common/icon/PrinterIcon';
import { Modal, Fab } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';

// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
import {devise, dateBounds} from '../../helpers/toolbox';
import {last} from 'lodash';

// const logger = new Logger();

let strings = new LocalizedStrings(data);



class LocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "d MMM yyyy", { locale: this.locale });
  }
}


function TicketX(props) {
  const {cloture} = props;
  const __strimp = strings.modules.cloture.impression;
  const { periode, ecarts, comptage, prelevement, mouvements } = cloture;

  logger.info('ticket X');
  logger.info(cloture);


  let vndvnt = 0, vndrmb = 0, vndtotal = 0;
  Object.values(periode.ventilation.vendeur).forEach(vendeur => {
      vndvnt += vendeur.ventes;
      vndrmb += vendeur.remboursements;
      vndtotal += (vendeur.ventes-vendeur.remboursements);
  });


  let tvaht = 0, tvamnt = 0, tvattc = 0;
  Object.values(periode.ventilation.tva).forEach(tva => { 
      tvaht += tva.ht;
      tvamnt += tva.tva;
      tvattc += tva.ttc;
  });

  let moytotal = 0;
  Object.values(periode.ventilation.moyen).forEach(moyen => { 
      moytotal += moyen.valeur;
  });
  moytotal -= periode.emission;

  let ecarttotal = 0;
  if (ecarts) {
    Object.values(ecarts).forEach(ecart=> {
      if (ecart!==null) ecarttotal += ecart.valeur;
    });
  }


  return (

  <div className="ticket-x">
    <div className="blocwrapper">
      <div className="periode" key="periode-hdr">
        <div className="ttl" key="periode-ttl">{ __strimp.periode.titre }</div>
        <div className="val" key="periode-val">{ `${format(new Date(periode.debut), "dd/MM/yyyy - HH:mm:ss", { locale: frLocale })}  ->  ${format(new Date(periode.fin), "dd/MM/yyyy - HH:mm:ss", { locale: frLocale })}` }</div>
        { periode.editeur && <div className="editeur" key="periode-editeur">{ `${__strimp.editeur} ${ periode.editeur.nom }` }</div>}
      </div>
      <div className="sel" key="sel-hdr">
        {(periode.vendeurs.length>1 || periode.vendeurs.length===0) && (<div className="val" key="sel-val1">{ `${__strimp.vendeurs[1]}${__strimp.vendeurs_all}` }</div>)}
        {(periode.vendeurs.length===1) && (<div className="val" key="sel-val1">{ `${__strimp.vendeurs[0]}${periode.vendeurs[0].nom}` }</div>)}
        {(periode.caisses && periode.caisses.length>0) && (<div className="val" key="sel-val2">{ `${__strimp.caisses[(periode.caisses.length>1?1:0)]}${periode.caisses.join(', ')}` }</div>)}
        {periode.caisse && (<div className="val" key="sel-val2">{ `${__strimp.caisses[0]}${periode.caisse.nom}` }</div>)}
        {/* {(periode.caisses.length>1 || periode.caisses.length===0) && (<div className="val" key="sel-val2">{ `${__strimp.caisses[1]}${__strimp.caisses_all}` }</div>)} */}
        {/* {(periode.caisses.length===1) && (<div className="val" key="sel-val2">{ `${__strimp.caisses[0]}${periode.caisses[0].nom} (${periode.caisses[0].id})` }</div>)} */}
      </div>
      <div className="recap" key="recap-hdr">
        <div className="recap-item" key="recap-item-1">
          <div className="nom" key="recap-item-1-nom">{ __strimp.depenses }</div>
          <div className="val" key="recap-item-1-val">{ devise(periode.depenses) }</div>
        </div>
        <div className="recap-item" key="recap-item-2">
          <div className="nom" key="recap-item-2-nom">{ __strimp.remboursements }</div>
          <div className="val" key="recap-item-2-val">{ devise(periode.remboursements) }</div>
        </div>
        <div className="recap-item" key="recap-item-3">
          <div className="nom" key="recap-item-3-nom">{ __strimp.encaissements }</div>
          <div className="val" key="recap-item-3-val">{ devise(periode.ventes) }</div>
        </div>
        {/* <div className="recap-item" key="recap-item-4">
          <div className="nom" key="recap-item-4-nom">{ __strimp.mtcaisse }</div>
          <div className="val" key="recap-item-4-val">{ devise(periode.mtcaisse) }</div>
        </div> */}
      </div>
      <div className="titre" key="detail-ttl">
        { __strimp.titre.x }
      </div>
      <div className="detail" key="detail-hdr">
        <div className="detail-item" key="detail-item-1">
          <div className="nom" key="detail-item-1-nom">{__strimp.caption.ventes}</div>
          <div className="val" key="detail-item-1-val">{devise(periode.ventes)}</div>
        </div>
        <div className="detail-item" key="detail-item-2">
          <div className="nom" key="detail-item-2-nom">{__strimp.caption.remboursements}</div>
          <div className="val" key="detail-item-2-val">{`-${devise(periode.remboursements)}`}</div>
        </div>
        <div className="detail-item pre-filet post-space" key="detail-item-3">
          <div className="nom" key="detail-item-3-nom">{__strimp.caption.ca}</div>
          <div className="val" key="detail-item-3-val">{devise(periode.ca)}</div>
        </div>
        <div className="detail-item total" key="detail-item-4">
          <div className="nom" key="detail-item-4-nom">{__strimp.caption.numtickets}</div>
          <div className="val" key="detail-item-4-val">{periode.numtickets}</div>
        </div>
        <div className="detail-item total" key="detail-item-5">
          <div className="nom" key="detail-item-5-nom">{__strimp.caption.ticket_moyen}</div>
          <div className="val" key="detail-item-5-val">{devise(periode.ticket_moyen)}</div>
        </div>
      </div>
      <div className="titre" key="ventil-vendeur-ttl">
        { __strimp.ventilation.vendeur }
      </div>
      <div className="ventil intit ventil-vendeur" key="ventil-vendeur-header">
        <div className="ventil-intit" key="ventil-vendeur-intit1"></div>
        <div className="ventil-intit" key="ventil-vendeur-intit2">{__strimp.caption.vente_short}</div>
        <div className="ventil-intit" key="ventil-vendeur-intit3">{__strimp.caption.remboursements_short}</div>
        <div className="ventil-intit" key="ventil-vendeur-intit4">{__strimp.caption.ca_short}</div>
      </div>
      {Object.values(periode.ventilation.vendeur).map(vendeur => (
        <div className="ventil ventil-vendeur" key={`vnd-${vendeur.id}`}>
          <div className="ventil-nom" key={`vnd-${vendeur.id}-nom`}>{ vendeur.nom }</div>
          <div className="ventil-val" key={`vnd-${vendeur.id}-val1`}>{devise(vendeur.ventes / 100)}</div>
          <div className="ventil-val" key={`vnd-${vendeur.id}-val2`}>{`-${devise(vendeur.remboursements / 100)}`}</div>
          <div className="ventil-val" key={`vnd-${vendeur.id}-val3`}>{devise((vendeur.ventes - vendeur.remboursements) / 100)}</div>
        </div>
      ))}
      <div className="ventil ventil-vendeur total" key="ventil-vendeur-total">
        <div className="ventil-nom" key="ventil-vendeur-total-nom">{__strimp.caption.total}</div>
        <div className="ventil-val" key="ventil-vendeur-total-val1">{devise(vndvnt / 100)}</div>
        <div className="ventil-val" key="ventil-vendeur-total-val2">{`-${devise(vndrmb / 100)}`}</div>
        <div className="ventil-val" key="ventil-vendeur-total-val3">{devise(vndtotal / 100)}</div>
      </div>
      <div className="titre" key="ventil-tva-ttl">
        { __strimp.ventilation.tva }
      </div>
      <div className="ventil intit ventil-tva" key="ventil-tva-header">
        <div className="ventil-intit" key="ventil-tva-intit1">{__strimp.caption.type}</div>
        <div className="ventil-intit" key="ventil-tva-intit2">{__strimp.caption.ht}</div>
        <div className="ventil-intit" key="ventil-tva-intit3">{__strimp.caption.tva}</div>
        <div className="ventil-intit" key="ventil-tva-intit4">{__strimp.caption.ttc}</div>
      </div>
      {Object.values(periode.ventilation.tva).map(tva => (
        <div className="ventil ventil-vendeur" key={ `ventil-tva-${tva.id}` }>
          {/* <div className="ventil-nom">{`${devise(tva.taux*100)}%`}</div> */}
          <div className="ventil-nom" key={`ventil-tva-${tva.id}-nom`}>{tva.taux * 100}%</div>
          <div className="ventil-val" key={`ventil-tva-${tva.id}-val1`}>{devise(tva.ht/100)}</div>
          <div className="ventil-val" key={`ventil-tva-${tva.id}-val2`}>{devise(tva.tva/100)}</div>
          <div className="ventil-val" key={`ventil-tva-${tva.id}-val3`}>{devise(tva.ttc/100)}</div>
        </div>
      ))}
      <div className="ventil ventil-vendeur total" key="ventil-tva-total">
        <div className="ventil-nom" key="ventil-tva-total-nom">{__strimp.caption.total}</div>
        <div className="ventil-val" key="ventil-tva-total-val1">{devise(tvaht / 100)}</div>
        <div className="ventil-val" key="ventil-tva-total-val2">{devise(tvamnt / 100)}</div>
        <div className="ventil-val" key="ventil-tva-total-val3">{devise(tvattc / 100)}</div>
      </div>
      <div className="titre" key="ventil-moyen-ttl">
        { __strimp.ventilation.moyen }
      </div>
      <div className="ventil intit ventil-moyen" key="ventil-moyen-header">
        <div className="ventil-intit" key="ventil-moyen-intit1">{__strimp.caption.moyens_th.moyen}</div>
        <div className="ventil-intit" key="ventil-moyen-intit2">{__strimp.caption.moyens_th.theorique}</div>
        <div className="ventil-intit" key="ventil-moyen-intit3">{__strimp.caption.moyens_th.comptage}</div>
        <div className="ventil-intit" key="ventil-moyen-intit4">{__strimp.caption.moyens_th.ecart}</div>
      </div>
      {Object.values(periode.ventilation.moyen).map(moyen => {

        const __moy_ecart = (ecarts && ecarts.hasOwnProperty(moyen.moyen) && ecarts[moyen.moyen]!==null) ? ecarts[moyen.moyen].valeur : 0;
        
        return (
        <>
        <div className="ventil ventil-moyen" key={ `ventil-${moyen.moyen}` }>
          <div className="ventil-nom" key={ `ventil-${moyen.moyen}-nom` }>{__strimp.caption.moyens[moyen.moyen]}</div>
          <div className="ventil-val" key={ `ventil-${moyen.moyen}-val1` }>{ (moyen.moyen==='ticket') ? devise(moyen.valeur - Number(periode.emission)) : devise(moyen.valeur) }</div>
          <div className="ventil-val" key={ `ventil-${moyen.moyen}-val2` }>{ comptage[moyen.moyen] ? devise(comptage[moyen.moyen]) : devise(0) }</div>
          <div className="ventil-val" key={ `ventil-${moyen.moyen}-val3` }>{ __moy_ecart===0 ? '' : `${ (Number(__moy_ecart)>0) ? '+' : '' }${ devise(__moy_ecart) }` }</div>
          {(ecarts && ecarts[moyen.moyen] && ecarts[moyen.moyen].motif) &&
          <div className="ventil-ecart-motif" key={ `ventil-${moyen.moyen}-motif` }>{ `* ${__strimp.caption.ecart.motif} ${ecarts[moyen.moyen].motif} *` }</div>
          }
        </div>
        </>
        )
      })}


      <div className="ventil ventil-vendeur total" key="ventil-moyen-total">
        <div className="ventil-nom" key="ventil-moyen-total-nom">{__strimp.caption.total}</div>
        <div className="ventil-val" key="ventil-moyen-total-val1">{devise(moytotal)}</div>
        <div className="ventil-val" key="ventil-moyen-total-val2">{devise(comptage.total)}</div>
        <div className="ventil-val" key="ventil-moyen-total-val3">{devise(ecarttotal)}</div>
      </div>

      {(periode.emission>0) && (
        <div className="titre" key="ventil-emission-ttl">
          { __strimp.caption.emission }{ devise(periode.emission)}
        </div>
      )}
      { (mouvements && mouvements[0]!==null) && (
      <>
      <div className="titre" key="ventil-mouvements-ttl">
        { __strimp.mouvements.titre }
      </div>
      <div className="ventil intit ventil-mouvements" key="ventil-mouvements-header">
        <div className="ventil-intit" key="ventil-mouvements-intit1">{__strimp.mouvements.type}</div>
        <div className="ventil-intit" key="ventil-mouvements-intit2">{__strimp.mouvements.debit}</div>
        <div className="ventil-intit" key="ventil-mouvements-intit3">{__strimp.mouvements.credit}</div>
        <div className="ventil-intit" key="ventil-mouvements-intit4">{__strimp.mouvements.solde}</div>
      </div>
      </>
      )}
      { (mouvements && mouvements[0]!==null) && mouvements.map(mvt => {
        return (
          <>
          <div className="ventil ventil-mouvement" key={ `ventil-mvt-${mvt.tresorId}` }>
            <div className="ventil-val" key={ `ventil-mvt-${mvt.tresorId}-val1` }>{__strimp.mouvements.types[mvt.type] }</div>
            <div className="ventil-val" key={ `ventil-mvt-${mvt.tresorId}-val2` }>{ (mvt.debit>0) ? `- ${devise(mvt.debit/100)}` : '---' }</div>
            <div className="ventil-val" key={ `ventil-mvt-${mvt.tresorId}-val3` }>{ (mvt.credit>0) ? `+ ${devise(mvt.credit/100)}`: '---' }</div>
            <div className="ventil-val" key={ `ventil-mvt-${mvt.tresorId}-val4` }>{ devise(mvt.solde/100) }</div>
          </div>
          </>
        );
      })}
      <div className="titre" key="ventil-mouvements-ttl">
        { __strimp.prelevement } : { devise(prelevement) }
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
            <div className="title">{ (cloture && (!cloture.cloupd?'⚠️  ':'')) + strings.modules.listeclotures.view.titre + (cloture && (!cloture.cloupd?'  ⚠️':'')) }</div>
          </div>
          <div className={ `body${(cloture && (!cloture.cloupd?' outofdate':''))}`}>
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
  const { liste, id, openClotureId, printClotureId } = props;

  liste.sort((a,b) => {
    let da = new Date(a.cloture.debut), db = new Date(b.cloture.debut);
    return compareAsc(da, db);
  });

  return (
    <TableContainer className="table-cont">
      <Table size="small" key={id} aria-label="a dense table" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell key={`${id}-hd-date`} className="liste-date">{ strings.modules.listeclotures.liste.date }</TableCell>
            <TableCell key={`${id}-hd-station`} className="liste-station">{ strings.modules.listeclotures.liste.station }</TableCell>
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
            <TableRow key={row.id} className={ `${(i%2)?'odd':'even'}${(row.cloupd ? '' : ' outofdate')}` }>
              <TableCell key={`${row.id}-date`} className="liste-date">{ format(new Date(row.date), "d MMM yyyy à HH:mm", { locale: frLocale }) }</TableCell>
              <TableCell key={`${row.id}-station`} className="liste-station">{ row.caisse }</TableCell>
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
    this.setSelectedDate = this.setSelectedDate.bind(this);
    this.openCloture = this.openCloture.bind(this);
    this.openClotureId = this.openClotureId.bind(this);
    this.closeCloture = this.closeCloture.bind(this);
    this.printCloture = this.printCloture.bind(this);
    this.printClotureId = this.printClotureId.bind(this);
    this.getBoundedClotureList = this.getBoundedClotureList.bind(this);

    const {heure_fin} = props;
    const __startmonthBounds = dateBounds(startOfMonth(new Date()), heure_fin);
    const __todayBounds = dateBounds(new Date(), heure_fin);

    this.state = {
      startDate: __startmonthBounds.debut,
      endDate: __todayBounds.fin,
      cloture: null,
      clotureId: null,
      clotureOpen: false
    };
  }
    
  componentDidMount() {
    logger.info('ListeClotures.componentDidMount()');
    this.getBoundedClotureList();
  }

  getBoundedClotureList(start, end) {

    const {startDate, endDate} = this.state;

    this.props.getCloturesList({
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

    logger.info(
      'setSelectedDate('+bound+')', 
      '('+format(d, "dd/MM/yyyy HH:mm")+' -> '+format(f, "dd/MM/yyyy HH:mm")+')'
    );

    this.getBoundedClotureList(d,f);

  }

  openCloture(cloture) {
    this.setState({cloture: cloture, clotureOpen: true});
  }
  async openClotureId(cloid) {
    const {fonddecaisse_activation, getServiceMouvements, clotureslist} = this.props;
    const cloture = clotureslist[cloid];

    logger.info('clolist : fonddecaisse_activation',fonddecaisse_activation);

    const { tresorslist } = fonddecaisse_activation ? await getServiceMouvements( {caisseId: cloture.periode.caisse.uniqid, debut: new Date(cloture.periode.debut).getTime()} ) : {tresorslist: null};

    if (cloture) {
      this.setState({clotureId: cloid, cloture: {...cloture, mouvements: tresorslist}, clotureOpen: true});
  } else {
    logger.error('ListeClotures.openClotureId()', `cloture clotureId=${cloid} inconnue`);
  }
  }

  closeCloture() {
    this.setState({clotureId: null, cloture:null, clotureOpen: false});
  }

  printCloture(cloture) {
    logger.info('printCloture()');
    if (cloture) {
      this.props.printCloture(cloture);
    } else {
      logger.error('ListeClotures.printCloture()', `cloture nulle`);
    }
  }

  printClotureId(cloid) {
    logger.info('printClotureId()', cloid);
    const cloture = this.props.clotureslist[cloid];
    if (cloture) {
      // changement du format des dates :
      let periode = cloture.periode;
      periode.debut = new Date(periode.debut);
      periode.fin = new Date(periode.fin);
//      this.props.printCloture({periode:periode});
      this.props.printCloture(cloture);
    } else {
      logger.error('ListeClotures.printClotureId()', `cloture clotureId=${cloid} inconnue`);
    }
  }

  getSynthese(clotures) {
 //   logger.info('getSynthese()', clotures);


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
         ,__prv = 0
         ,__vvnd = []
         ,__vtva = []
         ,__vmoy = []
         ,__ecarts = {
            especes: null,
            carte: null,
            ticket: null,
            cheque: null,
            avoir: null
         }
         ,__comptage = {
            especes: 0,
            carte: 0,
            ticket: 0,
            cheque: 0,
            avoir: 0
         }
         ,__emission = 0
         ;

      clotures.forEach(cl => {
        const { periode, ecarts, comptage, prelevement, cloupd } = this.props.clotureslist[cl.id];

        // logger.info('ecarts', ecarts);

        if (cloupd) {
        
          // récup des dates extrêmes de la liste des clotures
          if ( isBefore(new Date(periode.debut), __start) ) __start = new Date(periode.debut);
          if ( isAfter(new Date(periode.fin), __end) ) __end = new Date(periode.fin);

          // récup de la liste des vendeurs
          // s'il n'y a qu'un seul vendeur dans la période et dans la liste
          // on vérifie si c'est le même
          if ((periode.vendeurs && periode.vendeurs.length===1) && __vnd.length===1) {
            let __v = __vnd.filter(v => v.id===periode.vendeurs[0].id);
            if (__v) __vnd = __v;
          } else {
            __vnd = __vnd.concat(periode.vendeurs);
          }


          // récup de la liste des caisses
          // s'il n'y a qu'une seule caisses dans la période et dans la liste
          // on vérifie si c'est la même

          // if ((periode.caisses && periode.caisses.length===1) && __csh.length===1) {
          //   let __c = __csh.filter(c => c.id===periode.caisses[0].id);
          //   if (__c) __csh = __c;
          // } else {
          //   __csh = __csh.concat(periode.caisses);
          // }

          if (periode.caisse) {
            if (!__csh.includes(periode.caisse.nom)) __csh = [...__csh, periode.caisse.nom];
          }

          // addition des dépenses
          __dep += periode.depenses;
          // addition des remboursements
          __rmb += periode.remboursements;
          // addition des ventes
          __vnt += periode.ventes;
          // addition des montants caisse
          // __mtc += periode.mtcaisse;
          __mtc += periode.ca;
          // addition des chiffres d'affaires
          __ca += periode.ca;
          // addition du nombre de tickets
          __ntk += periode.numtickets;
          // addition des valeurs du ticket moyen
          __tkm += periode.ticket_moyen;
          // addition des prélèvements
          __prv += prelevement;

          // compilation des ventilations

          // ventilation vendeurs
          Object.values(periode.ventilation.vendeur).forEach(v => {

            let __vv = __vvnd.find(vv => vv.id===v.id);
            let __vvi = __vvnd.findIndex(vv => vv.id===v.id);
            // si le vendeur n'est pas encore récupéré, on l'ajoute
            if (__vv===undefined) {
              __vvnd.push({...v});
            }
            // si le vendeur est déjà récupéré, on additionne les valeurs des clôtures
            else {
              __vv.ventes += v.ventes;
              __vv.remboursements += v.remboursements;
              __vvnd[__vvi] = __vv;
            }
          });

          // ventilation tva
          Object.values(periode.ventilation.tva).forEach(t => {

            let __tt = __vtva.find(tt => tt.id===t.id);
            let __tti = __vtva.findIndex(tt => tt.id===t.id);
            // si la tva n'est pas encore récupérée, on l'ajoute
            if (__tt===undefined) {
              __vtva.push({...t});
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
          Object.values(periode.ventilation.moyen).forEach(m => {

            let __mm = __vmoy.find(mm => mm.moyen===m.moyen);
            let __mmi = __vmoy.findIndex(mm => mm.moyen===m.moyen);
            // si le moyen n'est pas encore récupéré, on l'ajoute
            if (__mm===undefined) {
              __vmoy.push({...m});
            }
            // si le moyen est déjà récupéré, on additionne les valeurs des clôtures
            else {
              __mm.valeur += m.valeur;
              __vmoy[__mmi] = __mm;
            }
          });

          if (comptage) {
            Object.entries(comptage).forEach(([moyen,valeur])=> {
              if (!__comptage.hasOwnProperty(moyen)) {
                __comptage[moyen] = 0;
              }
              __comptage[moyen] += valeur
            });
          }
          if (ecarts) {
            Object.entries(ecarts).forEach(([moyen,val])=> {
              if (val) {
                if (!__ecarts[moyen]) {
                  __ecarts[moyen] = {valeur: 0, motif: ''};
                }
                __ecarts[moyen].valeur += val.valeur;
              }
            });
          }

          __emission += periode.emission;
        }
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
        mtcaisse: __mtc + this.props.clotureslist[last(clotures).id].periode.fdcaisse,
        ca: __ca,
        numtickets: __ntk,
        ticket_moyen: __tkm/clotures.length,
        ventilation: {
          vendeur: __vvnd, 
          tva: __vtva,
          moyen: __vmoy
        },
        emission: __emission
      };
      
      this.openCloture({
        periode: synthese,
        ecarts: __ecarts,
        cloupd: true,
        comptage: __comptage,
        prelevement: __prv,
        mouvements: null
      });

    }

  }

  render() {
    const { clotureslist } = this.props;
    const { startDate, endDate, cloture, clotureOpen } = this.state;

    let clotures = [];

    if (clotureslist) {
      Object.entries(clotureslist).forEach(([key,value])=> {

        let __d = new Date(value.periode.debut);
        let __f = new Date(value.periode.fin);

        if (startDate!==null && 
            endDate!==null &&
            differenceInMinutes(__d, startDate)>=0 && 
            differenceInMinutes(__f, endDate)<=0
        ) {
          
          let clotureht = 0;
          if (value.caht) {
            clotureht = value.caht;
          } else {
            Object.values(value.periode.ventilation.tva).forEach(t => { clotureht += t.hasOwnProperty('ht') ? t.ht/100 : 0; });
          }
          
          clotures.push({
            id:key,
            date: value.createdAt,
            caisse: value.periode.hasOwnProperty('caisse') ? value.periode.caisse.nom : '',
            cloupd: value.cloupd,
            cloture: {
              clotureId: value.clotureId,
              debut: value.periode.debut,
              fin: value.periode.fin,
              ht: devise(clotureht),
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

