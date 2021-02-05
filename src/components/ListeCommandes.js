import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../constants/translations';

import TopZone from '../containers/TopZone';
import LoadingSpinner from './common/LoadingSpinner';
import history from '../helpers/history';
import paths from './../constants/routes.json';

import 'date-fns';
import { format, compareAsc, compareDesc } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';


import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import StdButton from './common/StdButton';
import PrinterIcon from './common/icon/PrinterIcon';
import ReglementCont from '../containers/ReglementCont';
import { Modal, Fab, Badge } from '@material-ui/core';
import CloseIcon from './common/icon/CloseIcon';
import PillField from './common/PillField';
import NumberKeyboard from './common/NumberKeyboard';
import Swal from 'sweetalert2';
import DeliveryIcon from './common/icon/DeliveryIcon';
import PaymentIcon from './common/icon/PaymentIcon';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from './common/icon/EditIcon';

import { decodetable } from '../constants/decodetable';
import { dateBounds } from '../helpers/toolbox';

import Logger from '../helpers/Logger';

const logger = new Logger();

let strings = new LocalizedStrings(data);



class LocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "d MMM yyyy", { locale: this.locale });
  }
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


function TableCommandes(props) {
  const { liste, id, openReglement, openReprise, deleteCommande, openPrint, openLivreurs, thiscash } = props;

  liste.sort((a,b) => {
    let da = new Date(a.commande.createdAt), db = new Date(b.commande.createdAt);
    return compareDesc(da, db);
  });

  return (
    <TableContainer className="table-cont">
      <Table size="small" key={id} aria-label="a dense table" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell key={`${id}-hd-date`} className="liste-date">{ strings.modules.listecommandes.liste.date }</TableCell>
            <TableCell key={`${id}-hd-heure`} className="liste-heure">{ strings.modules.listecommandes.liste.heure }</TableCell>
            <TableCell key={`${id}-hd-numero`} className="liste-numero">{ strings.modules.listecommandes.liste.numero }</TableCell>
            <TableCell key={`${id}-hd-montant`} className="liste-montant">{ strings.modules.listecommandes.liste.montant }</TableCell>
            <TableCell key={`${id}-hd-caisse`} className="liste-caisse">{ strings.modules.listecommandes.liste.caisse }</TableCell>
            <TableCell key={`${id}-hd-client`} className="liste-client">{ strings.modules.listecommandes.liste.client }</TableCell>
            <TableCell key={`${id}-hd-mode`} className="liste-mode">{ strings.modules.listecommandes.liste.mode }</TableCell>
            <TableCell key={`${id}-hd-actions`} className="liste-actions">{ strings.modules.listecommandes.liste.actions }</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {liste.map((row, i) => (
            <TableRow key={row.id} className={ `${(i%2)?'odd':'even'} color-${(row.commande.caisse.id===thiscash.id)?'0':'autre'} ${(row.commande.centre==='uber'?'autrecentre':'')}` }>
              <TableCell key={`${row.id}-date`} className="liste-date">{ row.commande.date }</TableCell>
              <TableCell key={`${row.id}-heure`} className="liste-heure">{ row.commande.heure }</TableCell>
              <TableCell key={`${row.id}-numero`} className="liste-numero">{ row.commande.numero }</TableCell>
              <TableCell key={`${row.id}-montant`} className="liste-montant">{ row.commande.montant }</TableCell>
              <TableCell key={`${row.id}-caisse`} className="liste-caisse">{ row.commande.caisse.nom }</TableCell>
              <TableCell key={`${row.id}-client`} className="liste-client">{ row.commande.client }</TableCell>
              <TableCell key={`${row.id}-mode`} className="liste-mode">{ strings.modules.listecommandes.liste.modes[row.commande.mode] }</TableCell>
              <TableCell key={`${row.id}-actions`} className="liste-actions">
                {(row.commande.mode==='livraison' && id!=='standby') && <StdButton key={`${row.id}-livreur`} identifier='livreur' elementclass={ `action action-livreur${(row.commande.livreur?' lvr-active':'')}` } icon={ <DeliveryIcon htmlColor={(row.commande.livreur?'#FF2D55':'#666666')} /> } noStroke={true} text='' onClick={() => { openLivreurs(row.id) }} />}
                <StdButton key={`${row.id}-encaissement`} identifier='encaissement' elementclass="action action-encaissement" icon={ <PaymentIcon htmlColor="#ffffff" /> } disabled={false} noStroke={true} text={ '' } onClick={ () => { openReglement(row.id) } } />
                <StdButton key={`${row.id}-annuler`} identifier='annuler' elementclass="action action-annuler" icon={ <DeleteIcon htmlColor="#ffffff" /> } disabled={id==='confirmed'} noStroke={true} text={ '' } onClick={() => { deleteCommande(row.id) }} />
                <StdButton key={`${row.id}-reprise`} identifier='reprise' elementclass="action action-reprise" icon={ <EditIcon htmlColor="#ffffff" /> } disabled={id==='confirmed' || (row.commande.livreur!==null && row.commande.livreur!==undefined)} noStroke={true} text={ '' } onClick={() => { openReprise(row.id) }} />
                <StdButton key={`${row.id}-imprimer`} identifier='imprimer' elementclass="action action-imprimer" icon={ <PrinterIcon /> } disabled={id==='standby'} noStroke={true} text='' onClick={() => { openPrint(row.id) }} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 

function LivreurPopin(props) {
  const { livreurs, livreurOpen, closeHandler, commandeId, commandeLivreur, setLivreur } = props;

  return (
    <Modal
      open={ livreurOpen }
      >
      <div className="LivreursModal">
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.listecommandes.livreurs.titre }</div>
          </div>
          <div className="body">
          { livreurs.map((lvr,i) =>
            <StdButton identifier={ lvr.user_id } key={i} elementclass={ `livreur${((commandeLivreur && commandeLivreur.id===lvr.user_id)?' activated':'')}`} icon={ false } noStroke={true} text={ `${lvr.nom}${(lvr.coordonnees && ` (${lvr.coordonnees})`)}` } onClick={(value) => { setLivreur({commandeId:commandeId, livreur:{nom:lvr.nom, id:lvr.user_id}}); closeHandler(); }} />
            )}
            <StdButton identifier="none" key={livreurs.length} elementclass="livreur livreur-none" icon={ false } noStroke={true} text={ strings.modules.listecommandes.livreurs.aucun } onClick={(value) => { setLivreur({commandeId:commandeId, livreur:null}); closeHandler(); }} />
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>
  );
}


function ImpressionTicketPopin(props) {
  const { tickets, printOpen, closeHandler, launchTicket } = props;


  return (
    <Modal
      open={ printOpen }
      >
      <div className="ImpressionTicket">
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.listecommandes.impression.titre }</div>
          </div>
          <div className="body">
            <StdButton identifier="all" key={tickets.length} elementclass="ticket" icon={ false } text={ strings.modules.listecommandes.impression.tous } onClick={(value) => { launchTicket("all") }} />
          { tickets.map((tkt,i) =>
            <StdButton identifier={ tkt.ticket_id } key={i} elementclass="ticket" icon={ false } text={ tkt.nom } onClick={(value) => { launchTicket({ids:[tkt.ticket_id]}) }} />
          )}
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>
  );
}



class ListeCommandes extends React.Component {
  
  
  constructor(props) {
    super(props);
    this.setSelectedDate = this.setSelectedDate.bind(this);
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.encaissementHandle = this.encaissementHandle.bind(this);
    this.repriseHandle = this.repriseHandle.bind(this);
    this.closeReglement = this.closeReglement.bind(this);
    this.openPrint = this.openPrint.bind(this);
    this.closePrint = this.closePrint.bind(this);
    this.searchHandler = this.searchHandler.bind(this);
    this.searchBtn = this.searchBtn.bind(this);
    this.send_to_search = this.send_to_search.bind(this);
    this.keyboardButtonHandler = this.keyboardButtonHandler.bind(this);
    this.closeKeyboard = this.closeKeyboard.bind(this);
    this.deleteCommande = this.deleteCommande.bind(this);
    this.openLivreurs = this.openLivreurs.bind(this);
    this.closeLivreurs = this.closeLivreurs.bind(this);
    this.getBoundedCommandesList = this.getBoundedCommandesList.bind(this);

    const {heure_fin} = props;
    const __todayBounds = dateBounds(new Date(), heure_fin);

    this.state = {
      startDate: __todayBounds.debut,
      endDate: __todayBounds.fin,
      openTab: 0,
      reglementOpen: false,
      commandeId: null,
      printOpen: false,
      searchval:'',
      inputfocus: true,
      keyboardOpen: false,
      livreurOpen: false
    };
  }
  
  lock = false;
  search_tmo = -1;
  
  componentDidMount() {
    logger.log('ListeCommandes.componentDidMount()');
    this.getBoundedCommandesList();
    this.props.getAllActive();
    this.props.getClientsList();
    this.props.getUsers();
  }

  

  getBoundedCommandesList(start, end) {

    const {startDate, endDate} = this.state;

    this.props.getCommandesList({
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

    this.getBoundedCommandesList(d,f);
  }

  
  closeReglement() {
    logger.log('ListeCmd.closeReglement()');
    this.props.deleteCurrentCommande();
    this.setState({reglementOpen: false, commandeId: null});
  }

  encaissementHandle(value) {
    this.props.getCommande(value);
    this.setState({commandeId:value, reglementOpen: true});
  }

  repriseHandle(value) {
    logger.log('repriseHandle('+value+')');
    this.props.getCommande(value);
    history.push(paths.ENCAISSEMENT);
  }

  handleChangeTab(event, newValue) {
    this.setState({openTab: newValue});
  };

  openPrint(cmdid) {
    this.props.getCommande(cmdid);
    this.setState({commandeId:cmdid, printOpen:true});
  }
  closePrint() {
    this.setState({printOpen:false, commandeId: null});
  }
  launchTicket(ticket, cmdid) {
    logger.log(`print ticket '${ticket}' pour #${cmdid}`);
  }


  searchHandler(event) {
    if (event.keyCode===13) {
      logger.log(event.target.value);
      this.decodeQRCode(event.target.value);
      event.target.value = '';
    }    
  }

  searchBtn() {
    if (this.state.searchval==='') {
      this.setState({keyboardOpen: true});
    } else {
      this.setState({searchval: ''});
      this.refs.searchInput.value = '';
    }
  }

  send_to_search(value) {
    logger.log('send_to_search',value);
    this.setState({searchval: value});
  }

  decodeQRCode(value) {

    const platform = process.platform==='darwin' ? 'darwin' : 'win';

    let decoded = '';
    for (let caractere of value) {
      if (!decodetable[platform].hasOwnProperty(caractere)) {
        continue;
      }
      decoded += decodetable[platform][caractere];
    }
    if (String(decoded).length>0) {
      this.send_to_search(decoded);
    }
    return false;
  }

  // action on buttons (fill in passphrase)
  keyboardButtonHandler(text) {
    const { searchval} = this.state;
    if (text!=='c') {
      this.setState({searchval: searchval+text});
    } else {
      this.setState({searchval: searchval.slice(0,-1)});
    }
  }

  closeKeyboard() {
    this.setState({keyboardOpen: false});
  }

  deleteCommande(id) {

    Swal.fire({
      type: 'warning',
      title: strings.modules.listecommandes.alerte.annuler.titre,
      html: strings.modules.listecommandes.alerte.annuler.texte,
      showCancelButton: true,
      focusCancel: true,
      focusConfirm: false
    }).then((result)=> {
      if (result.value) {
        this.props.deleteCommande({ticketId:id, motif:'annulation'});
      }
    });

  }
  openLivreurs(cmdid) {
    this.props.getCommande(cmdid);
    this.setState({commandeId:cmdid, livreurOpen:true});
  }
  closeLivreurs(cmdid) {
    this.setState({livreurOpen:false, commandeId: null});
  }

  render() {
    const { commandeslist, loading, tickets, printTicket, thiscash, livreurs, setLivreur } = this.props;

    const { startDate, endDate, openTab, commandeId, printOpen, searchval, inputfocus, keyboardOpen, livreurOpen } = this.state;

    const self = this;

    const commandeLivreur = commandeId!=null ? commandeslist[commandeId].livreur : null;


    let a_encaisserlist = [], standbylist = [], confirmedlist = [];
    
    for (let [key, value] of Object.entries(commandeslist)) {

      let cmdnum = value.ticketId;
      if (value.numero) {
        cmdnum = value.numero.value;
        if (value.numero.hex===true) {
          cmdnum = value.numero.value.toString(16);
        }
      }

      let cmd = {
        id: value.ticketId,
        numero: cmdnum,
        createdAt: value.createdAt,
        date: format(new Date(value.createdAt), "d MMM yyyy", { locale: this.locale }),
        heure: format(new Date(value.createdAt), "H:mm:ss"),
        montant: `${value.total.toFixed(2).replace('.',',')} €`,
        client: value.client ? value.client.nom+' '+value.client.prenom : 'Anonyme',
        mode: value.mode,
        caisse: value.caisse,
        livreur: value.livreur,
        centre: value.centre_revenu ? value.centre_revenu : 'restaurant'
      };
      let __start = compareAsc(new Date(value.createdAt), startDate);
      let __end = compareAsc(new Date(value.createdAt), endDate);
      if ((__start>-1 && __end<1) && (searchval==='' || cmd.id.indexOf(searchval)>-1)) {
        if (value.status==='a_encaisser') a_encaisserlist.push({id: key, commande: cmd});
        if (value.status==='standby') standbylist.push({id: key, commande: cmd});
        if (value.status==='confirmed') confirmedlist.push({id: key, commande: cmd});
      }
    }
    logger.log('searchval :',searchval!=='');
    
  
    if(loading) {
      return <LoadingSpinner />
    }
  
    if (undefined === commandeslist) {
      return (
        <div className="ListeCommandes subcontent">
          <div className="SelecteurEmpty">{ strings.modules.encaissement.selecteur.empty }</div>
        </div>
      );
    }
   

    const a11yProps = (index) => {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
    }

    setInterval(function(){
      if (inputfocus) {
        if (self.refs.searchInput) self.refs.searchInput.focus();
      }
    },200);

    return (
     <div className="ListeCommandes container">
      <TopZone />
      <div className="MainZone">
        <div className="dates">
          <MuiPickersUtilsProvider utils={LocalizedUtils} locale={ frLocale }>
            <div className="caption">{ strings.modules.listecommandes.dates.start}</div>
            <KeyboardDatePicker
              id="startdatepicker"
              margin="normal"
              value={ startDate }
              format="d MMM yyyy"
              onChange={date => { this.setSelectedDate('start', date.setHours(12,0)) }}
              KeyboardButtonProps={{ 'aria-label': 'change date' }}
              clearLabel={ strings.general.dialog.clear }
              cancelLabel={ strings.general.dialog.cancel }
              />
            <div className="caption">{ strings.modules.listecommandes.dates.end}</div>
            <KeyboardDatePicker
              id="enddatepicker"
              margin="normal"
              value={ endDate }
              format="d MMM yyyy"
              onChange={date => { this.setSelectedDate('end', date.setHours(12,0)) }}
              KeyboardButtonProps={{ 'aria-label': 'change date' }}
              clearLabel={ strings.general.dialog.clear }
              cancelLabel={ strings.general.dialog.cancel }
              />
          </MuiPickersUtilsProvider>
        </div>

        <div className="listes">
          <input className="search-input" ref="searchInput" onKeyUp={this.searchHandler} />
          <AppBar position="static">
            <Tabs value={openTab} onChange={this.handleChangeTab} aria-label="simple tabs example">
              <Tab label={<Badge color="primary" badgeContent={standbylist.length}>{ strings.modules.listecommandes.status.standby }</Badge>} {...a11yProps(0)} />
              <Tab label={<Badge color="primary" badgeContent={a_encaisserlist.length}>{ strings.modules.listecommandes.status.a_encaisser }</Badge>} {...a11yProps(1)} />
              <Tab label={<Badge color="primary" badgeContent={confirmedlist.length}>{ strings.modules.listecommandes.status.confirmed }</Badge>} {...a11yProps(2)} />
            </Tabs>
            <PillField value={searchval} type="text" className="displayId" innerButton={ `${searchval==='' ? 'keyboard' : 'delete'}`} innerButtonHandler={this.searchBtn} />
          </AppBar>
          <TabPanel className="panel" value={openTab} index={0}>
            <TableCommandes className="standby" id="standby" thiscash={thiscash} openReglement={ this.encaissementHandle } openReprise={ this.repriseHandle } openPrint={ this.openPrint } deleteCommande={ this.deleteCommande } liste={standbylist} />
          </TabPanel>
          <TabPanel className="panel" value={openTab} index={1}>
            <TableCommandes className="a_encaisser" id="a_encaisser" thiscash={thiscash} openReglement={ this.encaissementHandle } openReprise={ this.repriseHandle } openPrint={ this.openPrint } deleteCommande={ this.deleteCommande } openLivreurs={ this.openLivreurs } liste={a_encaisserlist} />
          </TabPanel>
          <TabPanel className="panel" value={openTab} index={2}>
            <TableCommandes className="confirmed" id="confirmed" thiscash={thiscash} openReglement={ this.encaissementHandle } openPrint={ this.openPrint } openLivreurs={ this.openLivreurs } liste={confirmedlist} />
          </TabPanel>
        </div>

        <ReglementCont open={ this.state.reglementOpen } contClass="ListeCommandeReglement" commandeId={ this.state.commandeId } closeReglement={ this.closeReglement } modif={openTab===2} />
        <NumberKeyboard open={keyboardOpen} numbersOnly={true} buttonHandler={this.keyboardButtonHandler} closeHandler={this.closeKeyboard} />
        <ImpressionTicketPopin tickets={tickets} printOpen={printOpen} closeHandler={this.closePrint} commandeId={ this.state.commandeId } launchTicket={printTicket} />
        <LivreurPopin livreurs={livreurs} livreurOpen={livreurOpen} setLivreur={setLivreur} closeHandler={this.closeLivreurs} commandeId={ this.state.commandeId } commandeLivreur={commandeLivreur} launchTicket={printTicket} />
      </div>
    </div>
    );
   }
  };
export default ListeCommandes;

ListeCommandes.propTypes = {
  commandeslist: PropTypes.object,
  tickets: PropTypes.array,
  getCommandesList: PropTypes.func.isRequired,
  getCommande: PropTypes.func.isRequired,
  printTicket: PropTypes.func.isRequired
};

