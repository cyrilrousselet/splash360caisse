// import LoadingSpinner from './common/LoadingSpinner';
import { Fab } from "@material-ui/core";
import PropTypes from "prop-types";
import React, { Component } from "react";
import LocalizedStrings from "react-localization";
import { data } from "../constants/translations";
import ErrorBoundary from "./common/ErrorBoundary";
// import {ErrorBoundary} from "@sentry/electron";
import ConnectIcon from "./common/icon/ConnectIcon";
import LargeButton from "./common/LargeButton";

// import Logger from "../helpers/Logger";
import logger from "../helpers/Logger";
import Swal from "sweetalert2";
import history from "../helpers/history";
import paths from "../constants/routes.json";

// const logger = new Logger();

let strings = new LocalizedStrings(data);

const DISABLED_MODULES = [];

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.userLogout = this.userLogout.bind(this);
  }

  componentDidMount() {
      logger.info('Dashboard.componentDidMount()');
    // this.props.getAllActive();
    this.props.getParametres();
  //  this.props.getTodayCommandesList();
    this.props.getTodayCa();
    this.props.getAvoirsList();
    this.props.getReglesPanierList();
    this.props.getReglesCatalogueList();
    this.props.getCommande();
    this.props.getPastNonConfirmed();
    this.props.testCloturesAuto();
    this.props.checkDateError();

  }

  // calculeCA(){

  //   const { commandeslist } = this.props;

  //   let __ca = 0;
  //   let __tickets = 0;
  //   if (commandeslist) {
  //     for (let [key,value] of Object.entries(commandeslist)) {
  //       __ca += value.total;
  //       logger.info(value.caisse.id);
  //       if (value.caisse.id==this.props.caisse.id) __tickets++;
  //     }
  //   }

  //   // évaluation du chiffre d'affaire vis à vis de l'objectif défini dans les settings
  //   logger.info('TODO: set ca_eval');

  //   return {chiffredaffaires: __ca, ca_eval:'good', ticketsNum: __tickets};
  // }

  userLogout() {
    Swal.fire({
      type: 'warning',
      title: strings.dashboard.logout.titre,
      text: strings.dashboard.logout.texte,
      showCancelButton: true,
      focusCancel: true,
      focusConfirm: false
    }).then((result)=> {
      if (result.value) {
        this.props.log('40', 'fermeture de session');
        history.push(paths.LOGIN);
      }
    });
  }

  render() {
    const {
      cashname,
      username,
      modules,
      devise,
      onClickModule,
      today_ca,
      today_numtickets,
      blocage_encaissement,
      blocage_commande,
      pastnonconfirmed,
      mandatoryError,
      dateError,
    } = this.props;

    // if (today_ca===undefined || ca===null) {
    //   return <LoadingSpinner className="Dashboard-loader" />;
    // }

    
    let modules_bloques = [...DISABLED_MODULES];
    if (blocage_encaissement===true) {
      if (!modules_bloques.includes('encaissement')) modules_bloques.push('encaissement');
    }
    if (mandatoryError===true) {
      if (!modules_bloques.includes('encaissement')) modules_bloques.push('encaissement');
      Swal.fire({
        title: strings.dashboard.alert.mandatory_error.titre,
        html: strings.dashboard.alert.mandatory_error.texte
      });
    }
    if (blocage_commande===true) {
      if (!modules_bloques.includes('encaissement')) modules_bloques.push('encaissement');
      Swal.fire({
        title: strings.dashboard.alert.blocked_cloture.titre,
        html: strings.dashboard.alert.blocked_cloture[pastnonconfirmed>0 ? 'texte_nc':'texte_c']
      }).then((result) => {
        history.push(pastnonconfirmed>0 ? paths.LISTECOMMANDES : paths.CLOTURE);
      });
    }
    if (dateError===true) {
      if (!modules_bloques.includes('encaissement')) modules_bloques.push('encaissement');
      Swal.fire({
        title: strings.dashboard.alert.date_error.titre,
        html: strings.dashboard.alert.date_error.texte
      });
    }

    

    const ca_eval = "good";

    // logger.timeEnd('clotureActions after getTodayCa');
    logger.dump("ca_eval",ca_eval);
    //  logger.info(ca);

    return (
      <ErrorBoundary fallback={'Une erreur est survenue.'}>
        <div className="Dashboard">
          <div className="topzone">
            <div className="cashName">{cashname}</div>
            <div className="userName">{username}</div>
            <Fab
              aria-label="disconnect"
              size="small"
              className="disconnect-button"
              onClick={this.userLogout}
            >
              <ConnectIcon />
            </Fab>
          </div>
          <div className="modules">
            {modules.map((module, i) => (
              <div className="module-item" key={i}>
                <LargeButton
                  identifier={module.toUpperCase()}
                  disabled={modules_bloques.indexOf(module) > -1}
                  elementclass={module}
                  icon={true}
                  text={strings.modules[module].nom}
                  onClick={(value) => {
                    onClickModule(value);
                  }}
                ></LargeButton>
              </div>
            ))}
          </div>
          {modules.indexOf("statistiques") > -1 && (
            <div className="tickets">
              {strings.dashboard.ticketsnum}
              <span>{today_numtickets}</span>
            </div>
          )}
          {modules.indexOf("statistiques") > -1 && (
            <div className="ca">
              {strings.dashboard.ca}
              <span className={ca_eval}>
                {today_ca.toFixed(2).replace(/\./g, ",")}
                {devise}
              </span>
            </div>
          )}
        </div>
      </ErrorBoundary>
    );
  }
}
Dashboard.propTypes = {
  cashname: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  points: PropTypes.number,
  modules: PropTypes.arrayOf(PropTypes.string).isRequired,
  getTodayCommandesList: PropTypes.func,
  getAllActive: PropTypes.func.isRequired,
  getParametres: PropTypes.func.isRequired,
  commandeslist: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.object,
};

export default Dashboard;
