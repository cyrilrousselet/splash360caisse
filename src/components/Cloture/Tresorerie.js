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


import StdButton from '../common/StdButton';
// import { Modal, Fab } from '@material-ui/core';
// import CloseIcon from '../common/icon/CloseIcon';
// import PageviewIcon from '@material-ui/icons/Pageview';

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
  const { liste, id, openMouvementId } = props;



  if (liste) {

    Object.values(liste).sort((a,b) => {
      let da = new Date(a.createdAt), db = new Date(b.createdAt);
      return compareAsc(da, db);
    });
  }

  return (
    <TableContainer className="table-cont">
      <Table size="small" key={id} aria-label="a dense table" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell key={`${id}-hd-id`} className="liste-id">{ strings.modules.tresor.liste.id }</TableCell>
            <TableCell key={`${id}-hd-date`} className="liste-date">{ strings.modules.tresor.liste.date }</TableCell>
            <TableCell key={`${id}-hd-origine`} className="liste-origine">{ strings.modules.tresor.liste.origine }</TableCell>
            <TableCell key={`${id}-hd-destination`} className="liste-destination">{ strings.modules.tresor.liste.destination }</TableCell>
            <TableCell key={`${id}-hd-debit`} className="liste-debit">{ strings.modules.tresor.liste.debit }</TableCell>
            <TableCell key={`${id}-hd-credit`} className="liste-credit">{ strings.modules.tresor.liste.credit }</TableCell>
            <TableCell key={`${id}-hd-type`} className="liste-type">{ strings.modules.tresor.liste.type }</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.values(liste).map((row, i) => (
            <TableRow key={row.id} className={ `${(i%2)?'odd':'even'}` } onClick={ () => { openMouvementId(row.tresorId)} }>
              <TableCell key={`${row.id}-id`} className="liste-id">{ row.tresorId }</TableCell>
              <TableCell key={`${row.id}-date`} className="liste-debut">{ format(new Date(row.createdAt), "d MMM yyyy à HH:mm", { locale: frLocale }) }</TableCell>
              <TableCell key={`${row.id}-origine`} className="liste-fin">{ row.origine }</TableCell>
              <TableCell key={`${row.id}-destination`} className="liste-ht">{ row.destination }</TableCell>
              <TableCell key={`${row.id}-debit`} className="liste-ventes">{ `${row.debit} €` }</TableCell>
              <TableCell key={`${row.id}-credit`} className="liste-nombre">{ `${row.credit} €` }</TableCell>
              <TableCell key={`${row.id}-type`} className="liste-actions">{ row.type }</TableCell>
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
    this.state = {
      mouvement: null,
      mouvementId: null
    }
    this.openMouvement = this.openMouvement.bind(this);
    this.openMouvementId = this.openMouvementId.bind(this);
  }

  openMouvement(mouvement) {
    this.setState({mouvement: mouvement, mouvementOpen: true});
  }
  openMouvementId(mvtid) {
    const mouvement = this.props.mouvements[mvtid];
    if (mouvement) {
      this.setState({mouvementId: mvtid, mouvement: mouvement, mouvementOpen: true});
    } else {
      logger.error('Tresorerie.openMouvementId()', `mouvement mouvementId=${mvtid} inconnue`);
    }
  }

  closeCloture() {
    this.setState({clotureId: null, cloture:null, clotureOpen: false});
  }



  render() {

    logger.log('tresorerie');

    const { mouvements } = this.props;
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
            {/* <StdButton identifier="btnsynthese" elementclass="btnsynthese" key="btnsynthese" text={ strings.modules.listeclotures.actions.synthese } onClick={ () => { this.getSynthese(clotures) }} /> */}
          </div>
          <TableMouvements className="liste-mouvements" id="liste-mouvements" openMouvementId={ this.openMouvementId } liste={mouvements} />
        </div>
      </div>
    );
  }

}


export default Tresorerie;