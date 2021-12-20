import React from 'react';
import PropTypes from 'prop-types';

import {remote} from 'electron';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import TopZone from '../../containers/TopZone';
import history from '../../helpers/history';
import paths from './../../constants/routes.json';

import 'date-fns';
import { format, compareAsc, differenceInMinutes, startOfMonth, endOfMonth, set, add, sub, startOfYear, endOfYear } from "date-fns";
import frLocale from "date-fns/locale/fr";
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
import { Modal, Fab, AppBar, Tabs, Tab } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';

// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
import {devise} from '../../helpers/toolbox';

// const logger = new Logger();

let strings = new LocalizedStrings(data);

const {app, dialog} = remote;
const win = remote.getCurrentWindow();
// const now = new Date();

const dialogOptions = {
  title: strings.modules.listezcaisse.actions.dest,
  defaultPath: `${ app.getPath('desktop') }/`,
  buttonLabel: strings.modules.listezcaisse.actions.exportcpt
}


function TabPanel(props) {
  const { children, value, index, key, className } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      key={key}
      className={className}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};



function TicketX(props) {
  const {zcaisse} = props;
  const __strimp = strings.modules.cloture.impression;
  const { 
    ventilation, 
    caisse, 
    emission, 
    editeur, 
    ecarts, 
    comptage, 
    prelevement, 
    mouvements,
    depenses,
    remboursements,
    ventes,
    numtickets,
    ticket_moyen,
    ca,
    periode,
    ztype,
    createdAt,
  } = zcaisse;

  logger.info('ticket X');
  logger.info(zcaisse);

  const p = periode.split('|');
  const debut = p[0].substring(0,4)+"-"+p[0].substring(4,6)+"-"+p[0].substring(6,8)+' '+p[0].substring(8,10)+':'+p[0].substring(10,12)+':'+p[0].substring(12,14);      
  const fin = p[1].substring(0,4)+"-"+p[1].substring(4,6)+"-"+p[1].substring(6,8)+' '+p[1].substring(8,10)+':'+p[1].substring(10,12)+':'+p[1].substring(12,14);      



  let vndvnt = 0, vndrmb = 0, vndtotal = 0;
  Object.values(ventilation.vendeur).forEach(vendeur => {
      vndvnt += vendeur.ventes;
      vndrmb += vendeur.remboursements;
      vndtotal += (vendeur.ventes-vendeur.remboursements);
  });

  let cashtotal = 0;
  Object.values(ventilation.caisse).forEach(caisse => {
    cashtotal += caisse.ca;
  });


  let tvaht = 0, tvataxe = 0, tvattc = 0;
  Object.values(ventilation.tva).forEach(tva => { 
      tvaht += tva.ht;
      tvataxe += tva.taxe;
      tvattc += tva.ttc;
  });

  let moytotal = 0;
  Object.values(ventilation.moyen).forEach(moyen => { 
      moytotal += moyen.valeur;
  });
  moytotal -= emission;

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
        <div className="val" key="periode-val">{ `${format(new Date(debut), "dd/MM/yyyy - HH:mm:ss", { locale: frLocale })}  ->  ${format(new Date(fin), "dd/MM/yyyy - HH:mm:ss", { locale: frLocale })}` }</div>
        { editeur && <div className="editeur" key="periode-editeur">{ `${__strimp.editeur} ${ editeur.nom }` }</div>}
        <div className="edited" key="periode-edited">{ `${__strimp.edited}${ format(new Date(createdAt), "dd/MM/yyyy - HH:mm:ss", { locale: frLocale }) }` }</div>
      </div>
      <div className="sel" key="sel-hdr">
        {(Object.keys(ventilation.vendeur).length>1 || Object.keys(ventilation.vendeur).length===0) && (<div className="val" key="sel-val1">{ `${__strimp.vendeurs[1]}${__strimp.vendeurs_all}` }</div>)}
        {(Object.keys(ventilation.vendeur).length===1) && (<div className="val" key="sel-val1">{ `${__strimp.vendeurs[0]}${Object.values(ventilation.vendeur)[0].nom}` }</div>)}
        {/* (ventilation.caisse && Object.keys(ventilation.caisse).length>0) && (<div className="val" key="sel-val2">{ `${__strimp.caisses[(Object.keys(ventilation.caisse).length>1?1:0)]}${periode.caisses.join(', ')}` }</div>) */}
        {caisse && (<div className="val" key="sel-val2">{ `${__strimp.caisses[0]}${caisse}` }</div>)}
        {/* {(periode.caisses.length>1 || periode.caisses.length===0) && (<div className="val" key="sel-val2">{ `${__strimp.caisses[1]}${__strimp.caisses_all}` }</div>)} */}
        {/* {(periode.caisses.length===1) && (<div className="val" key="sel-val2">{ `${__strimp.caisses[0]}${periode.caisses[0].nom} (${periode.caisses[0].id})` }</div>)} */}
      </div>
      <div className="recap" key="recap-hdr">
        <div className="recap-item" key="recap-item-1">
          <div className="nom" key="recap-item-1-nom">{ __strimp.depenses }</div>
          <div className="val" key="recap-item-1-val">{ devise(depenses) }</div>
        </div>
        <div className="recap-item" key="recap-item-2">
          <div className="nom" key="recap-item-2-nom">{ __strimp.remboursements }</div>
          <div className="val" key="recap-item-2-val">{ devise(remboursements) }</div>
        </div>
        <div className="recap-item" key="recap-item-3">
          <div className="nom" key="recap-item-3-nom">{ __strimp.encaissements }</div>
          <div className="val" key="recap-item-3-val">{ devise(ventes) }</div>
        </div>
        {/* <div className="recap-item" key="recap-item-4">
          <div className="nom" key="recap-item-4-nom">{ __strimp.mtcaisse }</div>
          <div className="val" key="recap-item-4-val">{ devise(periode.mtcaisse) }</div>
        </div> */}
      </div>
      <div className="titre" key="detail-ttl">
      { __strimp.titre.z.replace('%TYPE%', __strimp.type[ztype]) }
      </div>
      <div className="detail" key="detail-hdr">
        <div className="detail-item" key="detail-item-1">
          <div className="nom" key="detail-item-1-nom">{__strimp.caption.ventes}</div>
          <div className="val" key="detail-item-1-val">{devise(ventes)}</div>
        </div>
        <div className="detail-item" key="detail-item-2">
          <div className="nom" key="detail-item-2-nom">{__strimp.caption.remboursements}</div>
          <div className="val" key="detail-item-2-val">{`-${devise(remboursements)}`}</div>
        </div>
        <div className="detail-item pre-filet post-space" key="detail-item-3">
          <div className="nom" key="detail-item-3-nom">{__strimp.caption.ca}</div>
          <div className="val" key="detail-item-3-val">{devise(ca)}</div>
        </div>
        <div className="detail-item total" key="detail-item-4">
          <div className="nom" key="detail-item-4-nom">{__strimp.caption.numtickets}</div>
          <div className="val" key="detail-item-4-val">{numtickets}</div>
        </div>
        <div className="detail-item total" key="detail-item-5">
          <div className="nom" key="detail-item-5-nom">{__strimp.caption.ticket_moyen}</div>
          <div className="val" key="detail-item-5-val">{devise(ticket_moyen)}</div>
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
      {Object.values(ventilation.vendeur).map(vendeur => (
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
      <div className="titre" key="ventil-caisse-ttl">
        { __strimp.ventilation.caisse }
      </div>
      <div className="ventil intit ventil-caisse" key="ventil-caisse-header">
        <div className="ventil-intit" key="ventil-caisse-intit1"></div>
        <div className="ventil-intit" key="ventil-caisse-intit2">{__strimp.caption.ca_short}</div>
      </div>
      {Object.values(ventilation.caisse).map(caisse => (
        <div className="ventil ventil-caisse" key={`vnd-${caisse.id}`}>
          <div className="ventil-nom" key={`vnd-${caisse.id}-nom`}>{ caisse.nom }</div>
          <div className="ventil-val" key={`vnd-${caisse.id}-val1`}>{devise(caisse.ca / 100)}</div>
        </div>
      ))}
      <div className="ventil ventil-caisse total" key="ventil-caisse-total">
        <div className="ventil-nom" key="ventil-vendeur-caisse-nom">{__strimp.caption.total}</div>
        <div className="ventil-val" key="ventil-vendeur-total-val1">{devise(cashtotal / 100)}</div>
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
      {Object.entries(ventilation.tva).map(([taux,tva]) => (
        <div className="ventil ventil-vendeur" key={ `ventil-tva-${taux}` }>
          {/* <div className="ventil-nom">{`${devise(tva.taux*100)}%`}</div> */}
          <div className="ventil-nom" key={`ventil-tva-${tva.id}-nom`}>{tva.taux}%</div>
          <div className="ventil-val" key={`ventil-tva-${tva.id}-val1`}>{devise(tva.ht/100)}</div>
          <div className="ventil-val" key={`ventil-tva-${tva.id}-val2`}>{devise(tva.taxe/100)}</div>
          <div className="ventil-val" key={`ventil-tva-${tva.id}-val3`}>{devise(tva.ttc/100)}</div>
        </div>
      ))}
      <div className="ventil ventil-vendeur total" key="ventil-tva-total">
        <div className="ventil-nom" key="ventil-tva-total-nom">{__strimp.caption.total}</div>
        <div className="ventil-val" key="ventil-tva-total-val1">{devise(tvaht / 100)}</div>
        <div className="ventil-val" key="ventil-tva-total-val2">{devise(tvataxe / 100)}</div>
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
      {Object.values(ventilation.moyen).map(moyen => {

        let __moy = moyen.moyen;
        let __moy_o = '';
        if (moyen.moyen.includes('_')) {
          const __moy_r = moyen.moyen.split('_');
          __moy = __moy_r[0];
          __moy_o = ` (${__moy_r[1]})`;
        }

        const __moy_ecart = (ecarts && ecarts.hasOwnProperty(moyen.moyen) && ecarts[moyen.moyen]!==null) ? ecarts[moyen.moyen].valeur : 0;
        
        return (
        <>
        <div className="ventil ventil-moyen" key={ `ventil-${moyen.moyen}` }>
          <div className="ventil-nom" key={ `ventil-${moyen.moyen}-nom` }>{`${__strimp.caption.moyens[__moy]}${__moy_o}`}</div>
          <div className="ventil-val" key={ `ventil-${moyen.moyen}-val1` }>{ (moyen.moyen==='ticket') ? devise(moyen.valeur - Number(emission)) : devise(moyen.valeur) }</div>
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



      {(emission>0) && (
        <div className="titre" key="ventil-emission-ttl">
          { __strimp.caption.emission }{ devise(emission)}
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



function ZCaissePopin(props) {
  const { zcaisse, open, closeHandler, printZCaisse } = props;

  return (
    <Modal
      open={ open }
      >
      <div className="ViewCloturePopin">
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.listezcaisse.view.titre }</div>
          </div>
          <div className={ `body`}>
            {zcaisse && <TicketX zcaisse={zcaisse} className="ticket-x" />}
          </div>
          <div className="footer">
            {zcaisse && <StdButton identifier="none" elementclass="print-cloture" icon={ false } noStroke={true} text={ strings.general.dialog.print } onClick={() => { printZCaisse(zcaisse) }} />}
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>
  );
}




function TableZCaisse(props) {
  const { liste, id, openZCaisseId, printZCaisseId } = props;

  console.log('TableZCaisse liste',liste);

  liste.sort((a,b) => {
    let da = new Date(a.debut), db = new Date(b.debut);
    return compareAsc(da, db);
  });

  return (
    <TableContainer className="table-cont">
      <Table size="small" key={id} aria-label="a dense table" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell key={`${id}-hd-date`} className="liste-date">{ strings.modules.listezcaisse.liste.date }</TableCell>
            <TableCell key={`${id}-hd-station`} className="liste-station">{ strings.modules.listezcaisse.liste.station }</TableCell>
            <TableCell key={`${id}-hd-debut`} className="liste-debut">{ strings.modules.listezcaisse.liste.debut }</TableCell>
            <TableCell key={`${id}-hd-fin`} className="liste-fin">{ strings.modules.listezcaisse.liste.fin }</TableCell>
            <TableCell key={`${id}-hd-ht`} className="liste-ht">{ strings.modules.listezcaisse.liste.ht }</TableCell>
            <TableCell key={`${id}-hd-ventes`} className="liste-ventes">{ strings.modules.listezcaisse.liste.ventes }</TableCell>
            <TableCell key={`${id}-hd-nombre`} className="liste-nombre">{ strings.modules.listezcaisse.liste.nombre }</TableCell>
            <TableCell key={`${id}-hd-actions`} className="liste-actions">{ strings.modules.listezcaisse.liste.actions }</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {liste.map((row, i) => (
            <TableRow key={row.id} className={ `${(i%2)?'odd':'even'}` }>
              <TableCell key={`${row.id}-date`} className="liste-date">{ format(new Date(row.date), "d MMM yyyy à HH:mm", { locale: frLocale }) }</TableCell>
              <TableCell key={`${row.id}-station`} className="liste-station">{ row.caisse }</TableCell>
              <TableCell key={`${row.id}-debut`} className="liste-debut">{ format(new Date(row.debut), "d MMM yyyy à HH:mm", { locale: frLocale }) }</TableCell>
              <TableCell key={`${row.id}-fin`} className="liste-fin">{ format(new Date(row.fin), "d MMM yyyy à HH:mm", { locale: frLocale }) }</TableCell>
              <TableCell key={`${row.id}-ht`} className="liste-ht">{ `${row.ht} €` }</TableCell>
              <TableCell key={`${row.id}-ventes`} className="liste-ventes">{ `${row.ventes} €` }</TableCell>
              <TableCell key={`${row.id}-nombre`} className="liste-nombre">{ row.nombre }</TableCell>
              <TableCell key={`${row.id}-actions`} className="liste-actions">
                <StdButton key={`${row.id}-view`} identifier='view' elementclass="action action-view" icon={ <PageviewIcon htmlColor="#ffffff" /> } noStroke={true} text={ '' } onClick={ () => { openZCaisseId(row.id) } } />
                <StdButton key={`${row.id}-print`} identifier='print' elementclass="action action-print" icon={ <PrinterIcon htmlColor="#ffffff" /> } noStroke={true} text={ '' } onClick={() => { printZCaisseId(row.id) }} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 



class ListeZCaisse extends React.Component {
  
  
  constructor(props) {
    super(props);
    this.openZCaisse = this.openZCaisse.bind(this);
    this.openZCaisseId = this.openZCaisseId.bind(this);
    this.closeZCaisse = this.closeZCaisse.bind(this);
    this.printZCaisse = this.printZCaisse.bind(this);
    this.printZCaisseId = this.printZCaisseId.bind(this);
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.exportComptable = this.exportComptable.bind(this);
    this.prevMonth = this.prevMonth.bind(this);
    this.nextMonth = this.nextMonth.bind(this);
    this.nextYear = this.nextYear.bind(this);
    this.nextYear = this.nextYear.bind(this);
    this.thisMonth = this.thisMonth.bind(this);
    this.thisYear =  this.thisYear.bind(this);

    const {heure_fin} = props;
   
    const __fin_hm = heure_fin.split(':');

    const __start = set(startOfMonth(new Date()), {hours:parseInt(__fin_hm[0]), minutes:parseInt(__fin_hm[1])});
    const __end = add(endOfMonth(new Date()), {hours:parseInt(__fin_hm[0]), minutes:parseInt(__fin_hm[1])});


    this.state = {
      startDate: __start,
      endDate: __end,
      ztype: 'intermediaire',
      zcaisse: null,
      zcaisseId: null,
      zcaisseOpen: false,
      openTab: 0
    };
  }
    
  componentDidMount() {
    logger.info('ListeZCaisse.componentDidMount()');
    this.getBoundedZCaisseList();
  }

  getBoundedZCaisseList(start=null, end=null, type=null) {

    const {startDate, endDate, ztype} = this.state;

    const __sp = start || startDate;
    const __ep = end || endDate;
    const __tp = type || ztype;

    const __start = format(__sp,'yyyyMMdd050000');
    const __end = format(__ep,'yyyyMMdd050000');

    const __query = {
      "$expr" : {
        "$and":[ 
          {"$eq":["$ztype", __tp]},
          {"$gte" : [
            {"$toDouble": 
              {"$arrayElemAt":[
                {"$split":["$periode","|"]}, 
                0
              ]}
            },
            parseInt(__start)
          ]},
          {"$lt" : [
            {"$toDouble": 
              {"$arrayElemAt":[
                {"$split":["$periode","|"]}, 
                1
              ]}
            }, 
            parseInt(__end)
          ]}
        ]
      }
    };

    console.log('getBoundedZCaisseList', __tp, __query);

    this.props.getZCaisse(__query);

  }


  openZCaisse(zcaisse) {
    this.setState({zcaisse: zcaisse, zcaisseOpen: true});
  }

  async openZCaisseId(zid) {
    const {fonddecaisse_activation, getServiceMouvements, zcaisselist} = this.props;
    const _zcaisse = zcaisselist.find(z=>z.zId===zid);

    const p = _zcaisse.periode.split('|');
    const debut = p[0].substring(0,4)+"-"+p[0].substring(4,6)+"-"+p[0].substring(6,8)+' '+p[0].substring(8,10)+':'+p[0].substring(10,12)+':'+p[0].substring(12,14);      

    logger.info('clolist : fonddecaisse_activation',fonddecaisse_activation);

    const { tresorslist } = fonddecaisse_activation ? await getServiceMouvements( {caisseId: _zcaisse.caisse, debut: new Date(debut).getTime()} ) : {tresorslist: null};

    if (_zcaisse) {
      this.setState({zcaisseId: zid, zcaisse: {..._zcaisse, mouvements: tresorslist}, zcaisseOpen: true});
    } else {
      logger.error('ListeZCaisse.openZCaisseId()', `zcaisse zcaisseId=${zid} inconnue`);
    }
  }

  closeZCaisse() {
    this.setState({zcaisseId: null, zcaisse:null, zcaisseOpen: false});
  }

  printZCaisse(zcaisse) {
    logger.info('printZCaisse()');
    if (zcaisse) {
      this.props.printZCaisse(zcaisse);
    } else {
      logger.error('ListeZCaisse.printZCaisse()', `zcaisse nulle`);
    }
  }

  printZCaisseId(zid) {
    logger.info('printZCaisseId()', zid);
    const _zcaisse = this.props.zcaisselist.find(z=>z.zId===zid);
    if (_zcaisse) {
      this.props.printZCaisse(_zcaisse);
    } else {
      logger.error('ListeZCaisse.printZCaisseId()', `zcaisse zcaisseId=${zid} inconnue`);
    }
  }

  async exportComptable() {

    const {startDate, endDate} = this.state;

    const __opt = {
      ...dialogOptions,
      defaultPath: dialogOptions.defaultPath + `${ format(new Date(),'yyMMdd') }_exportcomptable_${ format(startDate, 'MM-yyyy') }.csv`
    };
    
    const __target = await dialog.showSaveDialog(win, __opt);
    console.log('💾 Export Comptable : ',__target.filePath);
    
    this.props.exportComptable(__target.filePath, startDate, endDate);
  }

  handleChangeTab(event, newValue) {
    const __ztype = newValue===0 ? 'intermediaire': (newValue===1 ? 'jour' : 'mois');
    console.log('handleChangeTab', newValue, __ztype);
    this.setState({openTab: newValue, ztype: __ztype});
    this.getBoundedZCaisseList(null, null, __ztype);

  };

  prevMonth() {
    
    const {heure_fin} = this.props;
    const __fin_hm = heure_fin.split(':');

    const {startDate} = this.state;
    const newStartDate = sub(startDate,{months:1});
    const newEndDate = add(endOfMonth(newStartDate), {hours:parseInt(__fin_hm[0]), minutes:parseInt(__fin_hm[1])});

    this.setState({
      startDate: newStartDate,
      endDate: newEndDate
    });
    this.getBoundedZCaisseList(newStartDate, newEndDate);

  }

  nextMonth() {

    const {heure_fin} = this.props;
    const __fin_hm = heure_fin.split(':');

    const {startDate} = this.state;
    const newStartDate = add(startDate,{months:1});
    const newEndDate = add(endOfMonth(newStartDate), {hours:parseInt(__fin_hm[0]), minutes:parseInt(__fin_hm[1])});

    this.setState({
      startDate: newStartDate,
      endDate: newEndDate
    });
    this.getBoundedZCaisseList(newStartDate, newEndDate);

  }

  prevYear() {
    
    const {heure_fin} = this.props;
    const __fin_hm = heure_fin.split(':');

    const {startDate} = this.state;
    const newStartDate = sub(startOfYear(startDate),{years:1});
    const newEndDate = add(endOfYear(newStartDate), {hours:parseInt(__fin_hm[0]), minutes:parseInt(__fin_hm[1])});

    this.setState({
      startDate: newStartDate,
      endDate: newEndDate
    });
    this.getBoundedZCaisseList(newStartDate, newEndDate);

  }

  nextYear() {

    const {heure_fin} = this.props;
    const __fin_hm = heure_fin.split(':');

    const {startDate} = this.state;
    const newStartDate = add(startOfYear(startDate),{years:1});
    const newEndDate = add(endOfYear(newStartDate), {hours:parseInt(__fin_hm[0]), minutes:parseInt(__fin_hm[1])});

    this.setState({
      startDate: newStartDate,
      endDate: newEndDate
    });
    this.getBoundedZCaisseList(newStartDate, newEndDate);

  }

  thisMonth() {

    const {heure_fin} = this.props;
    const __fin_hm = heure_fin.split(':');

    const newStartDate = set(startOfMonth(new Date()), {hours:parseInt(__fin_hm[0]), minutes:parseInt(__fin_hm[1])});
    const newEndDate = add(endOfMonth(newStartDate), {hours:parseInt(__fin_hm[0]), minutes:parseInt(__fin_hm[1])});

    this.setState({
      startDate: newStartDate,
      endDate: newEndDate
    });
    this.getBoundedZCaisseList(newStartDate, newEndDate);

  }

  thisYear() {

    const {heure_fin} = this.props;
    const __fin_hm = heure_fin.split(':');

    const newStartDate = set(startOfYear(new Date()), {hours:parseInt(__fin_hm[0]), minutes:parseInt(__fin_hm[1])});
    const newEndDate = add(endOfYear(newStartDate), {hours:parseInt(__fin_hm[0]), minutes:parseInt(__fin_hm[1])});

    this.setState({
      startDate: newStartDate,
      endDate: newEndDate
    });
    this.getBoundedZCaisseList(newStartDate, newEndDate);

  }

  render() {
    const { zcaisselist } = this.props;
    const { startDate, endDate, zcaisse, zcaisseOpen, openTab } = this.state;

    let listez = [];

    // console.log('ListeZCaisse zcaisselist', zcaisselist ? zcaisselist.length : 'ø');

    const a11yProps = (index) => {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
    }

    if (zcaisselist) {
      zcaisselist.forEach((value)=> {

        const p = value.periode.split('|');
        const debut = p[0].substring(0,4)+"-"+p[0].substring(4,6)+"-"+p[0].substring(6,8)+' '+p[0].substring(8,10)+':'+p[0].substring(10,12)+':'+p[0].substring(12,14);
        const fin = p[1].substring(0,4)+"-"+p[1].substring(4,6)+"-"+p[1].substring(6,8)+' '+p[1].substring(8,10)+':'+p[1].substring(10,12)+':'+p[1].substring(12,14);      
       
        let __d = new Date(debut);
        let __f = new Date(fin);

        if (startDate!==null && 
            endDate!==null &&
            differenceInMinutes(__d, startDate)>=0 && 
            differenceInMinutes(__f, endDate)<=0
        ) {
          
          let clotureht = 0;
          Object.values(value.ventilation.tva).forEach(t => { clotureht += t.hasOwnProperty('ht') ? t.ht/100 : 0; });
  
          listez.push({
            id:value.zId,
            date: value.createdAt,
            caisse: value.caisse || '',
            type: value.ztype,
            debut: __d,
            fin: __f,
            ht: devise(clotureht),
            ventes: devise(value.ca),
            nombre: value.numtickets
          });
        } 
      });
    }

    // console.log('listez',listez);

    return (
      <div className="ListeZCaisse container">
        <TopZone />
        <div className="MainZone">
        {/*
          <div className="dates">
             <div className="date-pickers">
              <MuiPickersUtilsProvider utils={LocalizedUtils} locale={ frLocale }>
                <div className="caption space-left">{ strings.modules.listezcaisse.dates.start}</div>
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
                <div className="caption">{ strings.modules.listezcaisse.dates.end}</div>
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
            <StdButton identifier="btnsynthese" elementclass="btnsynthese" key="btnsynthese" text={ strings.modules.listezcaisse.actions.synthese } onClick={ () => { this.getSynthese(clotures) }} />
          </div>
        */}
          <div className="listes">
            <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text={ strings.general.dialog.back } onClick={ () => { history.push(paths.CLOTURE) }} />
            <AppBar position="static">
              <Tabs value={openTab} onChange={this.handleChangeTab} aria-label="simple tabs example">
                <Tab label={strings.modules.listezcaisse.intervalle.intermediaire} {...a11yProps[0]} />
                <Tab label={strings.modules.listezcaisse.intervalle.jour} {...a11yProps[1]} />
                <Tab label={strings.modules.listezcaisse.intervalle.mois} {...a11yProps[2]} />
              </Tabs>
            </AppBar>
            <TabPanel className="panel" value={openTab} index={0}>
              <div className="date">
                <StdButton identifier="prevmonth" elementclass="prevmonth" key="prevmonth" text="<" onClick={()=>{this.prevMonth()}} />
                <div className="currentmonth" onClick={() => {this.thisMonth()}}>{ format(startDate, 'MMMM yyyy', { locale: frLocale }) }</div>
                <StdButton identifier="nextmonth" elementclass="nextmonth" key="nextmonth" text=">" onClick={()=>{this.nextMonth()}} />
              </div>
              <TableZCaisse className="intermediaire liste-zcaisse" id="liste-zcaisse" printZCaisseId={ this.printZCaisseId } openZCaisseId={ this.openZCaisseId } liste={listez} />
            </TabPanel>
            <TabPanel className="panel" value={openTab} index={1}>
              <div className="date">
                <StdButton identifier="prevmonth" elementclass="prevmonth" key="prevmonth" text="<" onClick={()=>{this.prevMonth()}} />
                <div className="groupe-titre">
                  <div className="currentmonth" onClick={() => {this.thisMonth()}}>{ format(startDate, 'MMMM yyyy', { locale: frLocale }) }</div>
                  <StdButton identifier="btnfec" elementclass="btnfec" key="btnfec" text={ strings.modules.listezcaisse.actions.exportcpt } onClick={ this.exportComptable } />
                </div>
                <StdButton identifier="nextmonth" elementclass="nextmonth" key="nextmonth" text=">" onClick={()=>{this.nextMonth()}} />
              </div>
              <TableZCaisse className="jour liste-zcaisse" id="liste-zcaisse" printZCaisseId={ this.printZCaisseId } openZCaisseId={ this.openZCaisseId } liste={listez} />
            </TabPanel>
            <TabPanel className="panel" value={openTab} index={2}>
              <div className="date">
                <StdButton identifier="prevyear" elementclass="prevyear" key="prevyear" text="<" onClick={()=>{this.prevYear()}} />
                <div className="currentyear" onClick={() => {this.thisYear()}}>{ format(startDate, 'yyyy', { locale: frLocale }) }</div>
                <StdButton identifier="nextyear" elementclass="nextyear" key="nextyear" text=">" onClick={()=>{this.nextYear()}} />
              </div>
              <TableZCaisse className="mois liste-zcaisse" id="liste-zcaisse" printZCaisseId={ this.printZCaisseId } openZCaisseId={ this.openZCaisseId } liste={listez} />
            </TabPanel>
          </div>
          <ZCaissePopin zcaisse={ zcaisse } open={zcaisseOpen} closeHandler={ this.closeZCaisse } printZCaisse={ this.printZCaisse} />
        </div>
      </div>
    )
  }
};

export default ListeZCaisse;

