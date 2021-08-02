import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import TopZone from '../../containers/TopZone';
import { Table, TableHead, TableCell, TableBody, TableRow } from '@material-ui/core';
import StdButton from './../common/StdButton';
// import CrossIcon from './../common/icon/CrossIcon';

import 'date-fns';
import FicheClientCont from '../../containers/FicheClientCont';
import logger from '../../helpers/Logger';

let strings = new LocalizedStrings(data);


class Clients extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      client: null,
      editOpen: false,
      historiqueOpen: false
    }
    this.openEdit = this.openEdit.bind(this);
    this.closeEdit = this.closeEdit.bind(this);
    this.openHistorique = this.openHistorique.bind(this);
    this.closeHistorique = this.closeHistorique.bind(this);
    
  }
  componentDidMount() {
    this.props.getClients();
  }


  openEdit(clientid=null) {
    logger.info(clientid);
    if (clientid!==null) {
      const {clients} = this.props;
      const client = clients.find(c=>c.client_id===clientid);
      logger.info(client);
      this.setState({client: client, editOpen: true});
    }
    else {
      this.setState({client:null, editOpen: true});
    }
  }
  closeEdit() {
    this.setState({editOpen: false});
  }

  openHistorique(clientid) {
    logger.info(clientid);
  //  this.setState({client:clients_data[clientid], historiqueOpen: true});
  }
  closeHistorique() {
    this.setState({historiqueOpen: false});
  }

 render() {

  const { clients, clavier } = this.props;

  const { client, editOpen } = this.state;

  return (
    <div className="Clients container">
      <TopZone />
      <div className="MainZone">
        <div className="toolbar">
          <StdButton 
            identifier="adduser" 
            elementclass="adduser-btn" 
            icon={ false } 
            text={ strings.modules.clients.edition.ajouter } 
            onClick={() => { this.openEdit() }} 
          />
        </div>
        <div className="table-wrapper">
        <Table stickyHeader size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell key={`hd-nom`} className="liste-nom">{ strings.modules.clients.liste.nom }</TableCell>
                <TableCell key={`hd-prenom`} className="liste-prenom">{ strings.modules.clients.liste.prenom }</TableCell>
                <TableCell key={`hd-tel1`} className="liste-tel1">{ strings.modules.clients.liste.tel1 }</TableCell>
                <TableCell key={`hd-email`} className="liste-email">{ strings.modules.clients.liste.email }</TableCell>
                <TableCell key={`hd-codepostal`} className="liste-codepostal">{ strings.modules.clients.liste.codepostal }</TableCell>
                <TableCell key={`hd-ville`} className="liste-ville">{ strings.modules.clients.liste.ville }</TableCell>
                {/* <TableCell key={`hd-actions`} className="liste-actions">{ strings.modules.clients.liste.actions }</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((row, i) => (
                <TableRow key={row.client_id} className={`${(i%2?'odd':'even')}${((row.hasOwnProperty('bloque') && row.bloque) ? ' bloque' : '')}`}>
                  <TableCell key={`${i}-nom`} className="liste-nom"><div onClick={ () => { this.openEdit(row.client_id) } }>{ row.nom }</div></TableCell>
                  <TableCell key={`${i}-prenom`} className="liste-prenom"><div onClick={ () => { this.openEdit(row.client_id) } }>{ row.prenom }</div></TableCell>
                  <TableCell key={`${i}-tel1`} className="liste-tel1">{ row.telephone }</TableCell>
                  <TableCell key={`${i}-email`} className="liste-email">{ row.email }</TableCell>
                  <TableCell key={`${i}-codepostal`} className="liste-codepostal">{ row.codepostal }</TableCell>
                  <TableCell key={`${i}-ville`} className="liste-ville">{ row.ville }</TableCell>
                  {/* <TableCell key={`${i}-actions`} className="liste-actions"> */}
                    {/* <StdButton key={`${i}-supprimer`} identifier='supprimer' elementclass="action action-supprimer" icon={ <CrossIcon /> } noStroke={true} text='' onClick={() => { logger.info('confirm suppr.') }} /> */}
                    {/* <StdButton key={`${i}-historique`} identifier='historique' elementclass="action action-historique" icon={ <HistoriqueIcon /> } noStroke={true} text='' onClick={() => { this.openHistorique(i) }} /> */}
                  {/* </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <FicheClientCont open={editOpen} clavierOpen={ clavier } client={client} mode="fiche" contexte="liste" closeHandler={this.closeEdit} />
    </div>
    );
  }
}
export default Clients;

// Cloture.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
// }