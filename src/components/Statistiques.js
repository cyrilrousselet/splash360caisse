import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../constants/translations';
import TopZone from '../containers/TopZone';
import LoadingSpinner from './common/LoadingSpinner';
import 'date-fns';
import { format, compareAsc, startOfToday, endOfToday, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import StdButton from './common/StdButton';
import { Doughnut, Bar, HorizontalBar, Bubble } from 'react-chartjs-2';
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
      endDate: endOfToday()
    };
    // this.shouldComponentRender = this.shouldComponentRender.bind(this);
  }

  componentDidMount() {
    console.log('Statistiques.componentDidMount()');
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

  datesShortcut(short) {
    let startDate, endDate;
    switch (short) {
      case "jour":
        startDate = startOfToday();
        endDate = endOfToday();
        break;
      case "semaine":
        startDate = startOfWeek(new Date(), {weekStartsOn:1});
        endDate = endOfWeek(new Date(), {weekStartsOn:1});
        break;
      case "mois":
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
        break;
    }
    this.setState({startDate:startDate, endDate:endDate});
    
  }

 render() {

  const { commandeslist, error, loading } = this.props;
  const { startDate, endDate, openTab } = this.state;

  let ca_total = 0, ca_confirmes = 0, nbre_total = 0, nbre_confirmes = 0, moy = 0, tps_total = 0, canal = {}, moyen = {}, vendeur = {}, mode = {}, modes = {};
  for (let [key, value] of Object.entries(commandeslist)) {
    // let cmd = {
    //   id: value.ticketId,
    //   createdAt: value.createdAt,
    //   date: format(new Date(value.createdAt), "d MMM yyyy", { locale: this.locale }),
    //   heure: format(new Date(value.createdAt), "H:mm:ss"),
    //   montant: `${value.total.toFixed(2).replace('.',',')} €`,
    //   client: 'Anonyme',
    //   caisse: value.caisse
    // };
    let __start = compareAsc(new Date(value.createdAt), startDate);
    let __end = compareAsc(new Date(value.createdAt), endDate);
    if (__start>-1 && __end<1) {

      if (value.status=='confirmed') {
        ca_confirmes += value.total;
        nbre_confirmes++;
      }
      nbre_total++;
      ca_total += value.total;
      tps_total += value.chrono || 0;
    }

    // par mode
    if (!mode.hasOwnProperty(value.mode)) { mode[value.mode] = 0; }
    mode[value.mode] += value.total;
    
    // par moyen
    value.reglements.forEach(rgl => {
      if (!moyen.hasOwnProperty(rgl.moyen)) { moyen[rgl.moyen] = 0; }
      moyen[rgl.moyen] += rgl.valeur;
    });

    // par canal
    if (!canal.hasOwnProperty(value.caisse)) { canal[value.caisse] = 0; }
    canal[value.caisse] += value.total;

    // par vendeur
    if (!vendeur.hasOwnProperty(value.operator)) { vendeur[value.operator.nom] = 0; }
    vendeur[value.operator.nom] += value.total;

  }



  if(loading) {
    return <LoadingSpinner />
  }


  const _colorWheel = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56'
  ];


  // on boucle sur la liste

  // ventilation par moyen de paiement
  let moyen_data = {
    labels: [],
    datasets: [
      {
        label: '',
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
        hoverBorderColor: 'rgba(255,99,132,1)',
        data: [30,30]
      }
    ]
  };
  let i = 0;
  for(let [id,val] of Object.entries(moyen)) {
    moyen_data.labels.push(id);
    moyen_data.datasets[0].backgroundColor.push(_colorWheel[i++]);
    moyen_data.datasets[0].data.push(Math.round(val));
  }


  const moyen_options = {
    maintainAspectRation: true,
    responsive: true,
    legend: {
      display: false
    }
  }

  // ventilation par mode de commande
  const mode_data = {
    labels: [],
    datasets: [
      {
        label: 'CA',
        fill: true,
        lineTension: 0.1,
        backgroundColor: [],
        borderColor: 'transparent',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: []
      }
    ]
  };
  i = 0;
  for(let [id,val] of Object.entries(mode)) {
    mode_data.labels.push(id);
    mode_data.datasets[0].backgroundColor.push(_colorWheel[i++]);
    mode_data.datasets[0].data.push(
      {
        x: i,
        y: Math.round(val),
        r: Math.min(5, Math.min(80, Math.round(val/10)))
      });
  }

  const mode_options = {
    maintainAspectRation: true,
    responsive: true,
    legend: {
      display: false
    }
  }

  // ventilation par vendeur
  const vendeur_data = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }]
  };
  i = 0;
  for(let [id,val] of Object.entries(vendeur)) {
    vendeur_data.labels.push(`${id} ${val.toFixed(2).replace('.',',')}€`);
    vendeur_data.datasets[0].data.push(Math.round(val));
    vendeur_data.datasets[0].backgroundColor.push(_colorWheel[i]);
    vendeur_data.datasets[0].hoverBackgroundColor.push(_colorWheel[i++]);
  }

  const vendeur_options = {
    maintainAspectRation: true,
    responsive: true,
    legend: {
      position: 'right'
    },
      cutoutPercentage: 75
  }

  // ventilation par canal
  const canal_data = {
    labels: [],
    datasets: [
      {
        label: '',
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
        hoverBorderColor: 'rgba(255,99,132,1)',
        data: []
      }
    ]
  };

  i = 0;
  for(let [id,val] of Object.entries(canal)) {
    canal_data.labels.push(`${id} ${val.toFixed(2).replace('.',',')}€`);
    canal_data.datasets[0].data.push(Math.round(val));
    canal_data.datasets[0].backgroundColor.push(_colorWheel[i++]);
  }

  const canal_options = {
    maintainAspectRation: true,
    responsive: true,
    legend: {
      display: false
    }
  }


  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const panier_moyen = Number(ca_confirmes / nbre_confirmes) || 0;
  const nbsp = String.fromCharCode(160);

  return (
    <div className="Statistiques container">
      <TopZone />
      <div className="MainZone">
        

        <div className="listes">
          <AppBar position="static" className="liste-header">
            <div className="dates">
              <MuiPickersUtilsProvider utils={LocalizedUtils} locale={ frLocale }>
                <div className="caption">{ strings.modules.statistiques.pickers.du }</div>
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
                <div className="caption">{ strings.modules.statistiques.pickers.au }</div>
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
            <div className="shortcuts">
              <StdButton key="short-jour" identifier="jour" elementclass="shortcut shortcut-jour" text={ strings.modules.statistiques.shortcut.jour } noStroke={true} onClick={ ()=>{ this.datesShortcut('jour') } } />
              <StdButton key="short-semaine" identifier="semaine" elementclass="shortcut shortcut-semaine" text={ strings.modules.statistiques.shortcut.semaine } noStroke={true} onClick={ ()=>{ this.datesShortcut('semaine') } } />
              <StdButton key="short-mois" identifier="mois" elementclass="shortcut shortcut-mois" text={ strings.modules.statistiques.shortcut.mois } noStroke={true} onClick={ ()=>{ this.datesShortcut('mois') } } />
            </div>
          </AppBar>
          
          <div className="panel">
            <div className="zonebtn">
              <StdButton key="ca" identifier='ca' elementclass="action action-ca" noStroke={false} text={ `${ strings.modules.statistiques.totaux.ca } ${ ca_confirmes.toFixed(2).replace('.',',') + nbsp }€` } onClick={ ()=>void(0) } />
              <StdButton key="nbrcmd" identifier='nbrcmd' elementclass="action action-nbrcmd" noStroke={false} text={ `${ strings.modules.statistiques.totaux.tickets } ${nbre_confirmes}` } onClick={ ()=>void(0) } />
              <StdButton key="cart" identifier='cart' elementclass="action action-cart" noStroke={false} text={ `${ strings.modules.statistiques.totaux.moyen } ${ panier_moyen.toFixed(2).replace('.',',') + nbsp }€` } onClick={ ()=>void(0) } />
              <StdButton key="tpscmd" identifier='tpscmd' elementclass="action action-tpscmd" noStroke={false} text={ `${ strings.modules.statistiques.totaux.chrono } ${ Number(tps_total/nbre_total).toFixed(2).replace('.',',') + nbsp }SEC` } onClick={ ()=>void(0) } />
            </div>
            <div className="zonecharts">
              <div className="chartblock chart-canal">
                <div className="chart-titre">{ strings.modules.statistiques.charts.canal }</div>
                <div className="chartcont">
                  <HorizontalBar data={canal_data} options={canal_options} />
                </div>
              </div>
              <div className="chartblock chart-moyen">
                <div className="chart-titre">{ strings.modules.statistiques.charts.moyen }</div>
                <div className="chartcont">
                  <Bar data={moyen_data} options={moyen_options} />
                </div>
              </div>
              <div className="chartblock chart-mode">
                <div className="chart-titre">{ strings.modules.statistiques.charts.mode }</div>
                <div className="chartcont">
                  <Bubble data={mode_data} options={mode_options} />
                </div>
              </div>
              <div className="chartblock chart-vendeur">
                <div className="chart-titre">{ strings.modules.statistiques.charts.vendeur }</div>
                <div className="chartcont">
                  <Doughnut data={vendeur_data} options={vendeur_options} />
                </div>
              </div>
            </div>
          </div>
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