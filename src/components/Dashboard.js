// import LoadingSpinner from './common/LoadingSpinner';
import { Fab } from "@material-ui/core";
import PropTypes from "prop-types";
import React, { Component } from "react";
import LocalizedStrings from "react-localization";
import { data } from "../constants/translations";
import ErrorBoundary from "./common/ErrorBoundary";
import ConnectIcon from "./common/icon/ConnectIcon";
import LargeButton from "./common/LargeButton";

let strings = new LocalizedStrings(data);

const DISABLED_MODULES = ["stocks"];

class Dashboard extends Component {
  componentDidMount() {
    //  console.log('Dashboard.componentDidMount()');
    this.props.getCommandesList();
    // this.props.getAllActive();
    this.props.getParametres();
    this.props.getTodayCa();
    this.props.getAvoirsList();
    // this.props.deleteCurrentCommande();
    this.props.getCommande();
  }

  // calculeCA(){

  //   const { commandeslist } = this.props;

  //   let __ca = 0;
  //   let __tickets = 0;
  //   if (commandeslist) {
  //     for (let [key,value] of Object.entries(commandeslist)) {
  //       __ca += value.total;
  //       console.log(value.caisse.id);
  //       if (value.caisse.id==this.props.caisse.id) __tickets++;
  //     }
  //   }

  //   // évaluation du chiffre d'affaire vis à vis de l'objectif défini dans les settings
  //   console.log('TODO: set ca_eval');

  //   return {chiffredaffaires: __ca, ca_eval:'good', ticketsNum: __tickets};
  // }

  render() {
    const {
      cashname,
      username,
      modules,
      devise,
      userLogout,
      onClickModule,
      today_ca,
      today_numtickets,
    } = this.props;

    // if (today_ca===undefined || ca===null) {
    //   return <LoadingSpinner className="Dashboard-loader" />;
    // }

    const ca_eval = "good";

    //  console.log(ca);

    return (
      <ErrorBoundary>
        <div className="Dashboard">
          <div className="topzone">
            <div className="cashName">{cashname}</div>
            <div className="userName">{username}</div>
            <Fab
              aria-label="disconnect"
              size="small"
              className="disconnect-button"
              onClick={userLogout}
            >
              <ConnectIcon />
            </Fab>
          </div>
          <div className="modules">
            {modules.map((module, i) => (
              <div className="module-item" key={i}>
                <LargeButton
                  identifier={module.toUpperCase()}
                  disabled={DISABLED_MODULES.indexOf(module) > -1}
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
  getCommandesList: PropTypes.func,
  getAllActive: PropTypes.func.isRequired,
  getParametres: PropTypes.func.isRequired,
  getCurrentPeriode: PropTypes.func,
  commandeslist: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.object,
};

export default Dashboard;
