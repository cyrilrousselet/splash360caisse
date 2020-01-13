import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../constants/translations';

import TopZone from '../containers/TopZone';
import LoadingSpinner from './common/LoadingSpinner';
import history from '../helpers/history';
import paths from './../constants/routes.json';

import 'date-fns';
import { format, compareAsc, startOfToday, endOfToday, startOfDay, endOfDay } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
//import TableContainer from '@material-ui/core/TableContainer';
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
import { Modal, Fab } from '@material-ui/core';
import CloseIcon from './common/icon/CloseIcon';

let strings = new LocalizedStrings(data);

class LocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "d MMM yyyy", { locale: this.locale });
  }
}


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
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
  const { liste, id, openReglement, openReprise, openPrint, ...other } = props;

  return (
    <Table size="small" key={id} aria-label="a dense table">
      <TableHead>
        <TableRow>
          <TableCell key={`${id}-hd-date`} className="liste-date">{ strings.modules.listecommandes.liste.date }</TableCell>
          <TableCell key={`${id}-hd-heure`} className="liste-heure">{ strings.modules.listecommandes.liste.heure }</TableCell>
          <TableCell key={`${id}-hd-numero`} className="liste-numero">{ strings.modules.listecommandes.liste.numero }</TableCell>
          <TableCell key={`${id}-hd-montant`} className="liste-montant">{ strings.modules.listecommandes.liste.montant }</TableCell>
          <TableCell key={`${id}-hd-client`} className="liste-client">{ strings.modules.listecommandes.liste.client }</TableCell>
          <TableCell key={`${id}-hd-actions`} className="liste-actions">{ strings.modules.listecommandes.liste.actions }</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {liste.map((row, i) => (
          <TableRow key={row.id} className={(i%2)?'odd':'even'}>
            <TableCell key={`${row.id}-date`} className="liste-date">{ row.commande.date }</TableCell>
            <TableCell key={`${row.id}-heure`} className="liste-heure">{ row.commande.heure }</TableCell>
            <TableCell key={`${row.id}-numero`} className="liste-numero">{ row.commande.id }</TableCell>
            <TableCell key={`${row.id}-montant`} className="liste-montant">{ row.commande.montant }</TableCell>
            <TableCell key={`${row.id}-client`} className="liste-client">{ row.commande.client }</TableCell>
            <TableCell key={`${row.id}-actions`} className="liste-actions">
              <StdButton key={`${row.id}-encaissement`} identifier='encaissement' elementclass="action action-encaissement" icon={ false } disabled={id==='confirmed'} noStroke={true} text={ strings.modules.listecommandes.actions.encaissement } onClick={ () => { openReglement(row.id) } } />
              <StdButton key={`${row.id}-annuler`} identifier='annuler' elementclass="action action-annuler" icon={ false } disabled={id!=='standby'} noStroke={true} text={ strings.modules.listecommandes.actions.annuler } onClick={(value) => { console.log(value) }} />
              <StdButton key={`${row.id}-reprise`} identifier='reprise' elementclass="action action-reprise" icon={ false } disabled={id!=='standby'} noStroke={true} text={ strings.modules.listecommandes.actions.reprise } onClick={() => { openReprise(row.id) }} />
              <StdButton key={`${row.id}-imprimer`} identifier='imprimer' elementclass="action action-imprimer" icon={ <PrinterIcon /> } noStroke={true} text='' onClick={() => { openPrint(row.id) }} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 


function ImpressionTicketPopin(props) {
  const { tickets, printOpen, closeHandler, commandeId, launchTicket } = props;

  const tous = strings.modules.listecommandes.impression.tous; 

  const _tickets = [tous , ...tickets];

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
          { _tickets.map((tkt,i) =>
            <StdButton identifier={ `${tkt}` } key={i} elementclass="ticket" icon={ false } text={ tkt } onClick={(value) => { launchTicket(tkt, commandeId) }} />
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
    this.state = {
      startDate: startOfToday(),
      endDate: endOfToday(),
      openTab: 0,
      reglementOpen: false,
      commandeId: null,
      printOpen: false
    };
    this.setSelectedDate = this.setSelectedDate.bind(this);
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.encaissementHandle = this.encaissementHandle.bind(this);
    this.repriseHandle = this.repriseHandle.bind(this);
    this.closeReglement = this.closeReglement.bind(this);
    this.openPrint = this.openPrint.bind(this);
    this.closePrint = this.closePrint.bind(this);
  }

  componentDidMount() {
    console.log('ListeCommandes.componentDidMount()');
    this.props.getCommandesList();
    this.props.getAllActive();
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

  
  closeReglement() {
    this.setState({reglementOpen: false});
  }

  encaissementHandle(value) {
    this.props.getCommande(value);
    this.setState({commandeId:value, reglementOpen: true});
  }

  repriseHandle(value) {
    this.props.getCommande(value);
    history.push(paths.ENCAISSEMENT);
  }

  handleChangeTab(event, newValue) {
    this.setState({openTab: newValue});
  };

  openPrint(cmdid) {
    this.setState({commandeId:cmdid, printOpen:true});
  }
  closePrint() {
    this.setState({printOpen:false});
  }
  launchTicket(ticket, cmdid) {
    console.log(`print ticket '${ticket}' pour #${cmdid}`);
  }

  render() {
    const { commandeslist, error, loading, tickets } = this.props;

    const { startDate, endDate, openTab, commandeId, printOpen } = this.state;

    let a_encaisserlist = [], standbylist = [], confirmedlist = [];
    
    for (let [key, value] of Object.entries(commandeslist)) {
      let cmd = {
        id: value.ticketId,
        date: format(new Date(value.createdAt), "d MMM yyyy", { locale: this.locale }),
        heure: format(new Date(value.createdAt), "H:mm:ss"),
        montant: `${value.total.toFixed(2).replace('.',',')} €`,
        client: 'Anonyme'
      };
      let __start = compareAsc(new Date(value.createdAt), startDate);
      let __end = compareAsc(new Date(value.createdAt), endDate);
      if (__start>-1 && __end<1) {
        if (value.status=='a_encaisser') a_encaisserlist.push({id: key, commande: cmd});
        if (value.status=='standby') standbylist.push({id: key, commande: cmd});
        if (value.status=='confirmed') confirmedlist.push({id: key, commande: cmd});
      }
    }
    
  
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
              onChange={date => { this.setSelectedDate('start', date) }}
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
              onChange={date => { this.setSelectedDate('end', date) }}
              KeyboardButtonProps={{ 'aria-label': 'change date' }}
              clearLabel={ strings.general.dialog.clear }
              cancelLabel={ strings.general.dialog.cancel }
              />
          </MuiPickersUtilsProvider>
        </div>

        <div className="listes">
          <AppBar position="static">
            <Tabs value={openTab} onChange={this.handleChangeTab} aria-label="simple tabs example">
              <Tab label={ strings.modules.listecommandes.status.a_encaisser } {...a11yProps(0)} />
              <Tab label={ strings.modules.listecommandes.status.standby } {...a11yProps(1)} />
              <Tab label={ strings.modules.listecommandes.status.confirmed } {...a11yProps(2)} />
            </Tabs>
          </AppBar>
          <TabPanel key="a_encaisser-panel" value={openTab} index={0}>
            <TableCommandes className="a_encaisser" id="a_encaisser" openReglement={ this.encaissementHandle } openPrint={ this.openPrint } liste={a_encaisserlist} />
          </TabPanel>
          <TabPanel key="standby-panel" value={openTab} index={1}>
            <TableCommandes className="standby" id="standby" openReglement={ this.encaissementHandle } openReprise={ this.repriseHandle } openPrint={ this.openPrint } liste={standbylist} />
          </TabPanel>
          <TabPanel key="confirmed-panel" value={openTab} index={2}>
            <TableCommandes className="confirmed" id="confirmed" openPrint={ this.openPrint } liste={confirmedlist} />
          </TabPanel>
        </div>

        <ReglementCont open={ this.state.reglementOpen } contClass="ListeCommandeReglement" commandeId={ this.state.commandeId } closeReglement={ this.closeReglement } />
        <ImpressionTicketPopin tickets={tickets} printOpen={printOpen} closeHandler={this.closePrint} commandeId={ this.state.commandeId } launchTicket={this.launchTicket} />
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
  getCommande: PropTypes.func.isRequired
};

