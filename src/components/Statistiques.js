import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../constants/translations';
import TopZone from '../containers/TopZone';
import LoadingSpinner from './common/LoadingSpinner';
import 'date-fns';
import { format, compareAsc, startOfToday, endOfToday, startOfDay, endOfDay } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import StdButton from './common/StdButton';


import history from '../helpers/history';
import paths from '../constants/routes';

import fakecont from './../assets/images/fake_contenu_statistiques.png';

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


class Statistiques extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      openTab: 0,
      startDate: startOfToday(),
      endDate: new Date('2020-02-09')
    };
    this.shouldComponentRender = this.shouldComponentRender.bind(this);
  }

 componentWillMount() {
  // const { getAllActive } = this.props;
  // getAllActive();
 }

 shouldComponentRender() {
 //  const {loading} = this.props;
 //  if(loading===false) return false;
   return true;
 }

 render() {

 // const { catalogue, error, loading } = this.props;

 const { startDate, endDate, openTab } = this.state;

  if(!this.shouldComponentRender()) {
    return <LoadingSpinner />
  }


  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  return (
    <div className="Statistiques container">
      <TopZone />
      <div className="MainZone">
        

        <div className="listes">
          <AppBar position="static">
            <div className="dates">
              <MuiPickersUtilsProvider utils={LocalizedUtils} locale={ frLocale }>
                <div className="caption">Statistiques du</div>
                <KeyboardDatePicker
                  id="startdatepicker"
                  margin="normal"
                  value={ startDate }
                  format="d MMM yyyy"
                  onChange={date => void(0) }
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
                  onChange={date => void(0) }
                  KeyboardButtonProps={{ 'aria-label': 'change date' }}
                  clearLabel={ strings.general.dialog.clear }
                  cancelLabel={ strings.general.dialog.cancel }
                  />
              </MuiPickersUtilsProvider>
            </div>
            <Tabs value={openTab} onChange={this.handleChangeTab} aria-label="simple tabs example">
              <Tab label="Jour" {...a11yProps(0)} />
              <Tab label="Semaine" {...a11yProps(1)} />
              <Tab label="Mois" {...a11yProps(2)} />
            </Tabs>
          </AppBar>
          <TabPanel key="jour-panel" className="panel" value={openTab} index={0}>
            <div className="zonebtn">
              <StdButton key="ca" identifier='ca' elementclass="action action-ca" noStroke={false} text='CHIFFRE D’AFFAIRE 1&nbsp;564,60 €' onClick={ ()=>void(0) } />
              <StdButton key="nbrcmd" identifier='nbrcmd' elementclass="action action-nbrcmd" noStroke={false} text='NBR&nbsp;DE&nbsp;COMMANDES 47' onClick={ ()=>void(0) } />
              <StdButton key="cart" identifier='cart' elementclass="action action-cart" noStroke={false} text='PANIER MOYEN 33,29&nbsp;€' onClick={ ()=>void(0) } />
              <StdButton key="tpscmd" identifier='tpscmd' elementclass="action action-tpscmd" noStroke={false} text='PRISE DE COMMANDE 31,14&nbsp;sec' onClick={ ()=>void(0) } />
            </div>
            <img src={fakecont} width="auto" height="100%" className="fakeimg" />
            <div className="zonedeclic" onClick={()=>{ history.push(paths.STOCKS_ARTICLES) }}></div>
          </TabPanel>
          <TabPanel key="semaine-panel" className="panel" value={openTab} index={1}>
          </TabPanel>
          <TabPanel key="mois-panel" className="panel" value={openTab} index={2}>
          </TabPanel>
        </div>
      </div>
    </div>
    );
  }
}
export default Statistiques;

// Cloture.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
// }