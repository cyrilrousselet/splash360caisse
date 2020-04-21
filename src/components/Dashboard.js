import React, { Component } from 'react';
import LocalizedStrings from 'react-localization';
import {data} from '../constants/translations';
import LargeButton from './common/LargeButton';
import PropTypes from 'prop-types';
import LoadingSpinner from './common/LoadingSpinner';
import { Fab } from '@material-ui/core';
import ConnectIcon from './common/icon/ConnectIcon';

let strings = new LocalizedStrings(data);


class Dashboard extends Component {

  constructor(props) {
    super(props);

    // this.calculeCA = this.calculeCA.bind(this);
  }

  componentDidMount() {
  //  console.log('Dashboard.componentDidMount()');
    this.props.getCommandesList();
    // this.props.getAllActive();
    // this.props.getParametres();
    this.props.getCurrentPeriode();
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

    const { cashname, username, userid, modules, points, devise, onClickUseraccount, userLogout, onClickModule, periode } = this.props;
    const { ca, numtickets } = periode;
  
    if (ca==undefined) {
      return <LoadingSpinner className="Dashboard-loader" />;
    }


    
    const ca_eval = "good";

  //  console.log(ca);

    return (
      <div className="Dashboard">
        <div className="topzone">
          <div className="cashName">{ cashname }</div>
          <div className="userName" 
            // onClick={()=>{onClickUseraccount(userid)} }
          >{ username }</div>
          {/* <div className={ `points${points==null ? ' nopoint':''}` }>{ `${points}${strings.dashboard.points}` }</div> */}
          <Fab aria-label="disconnect" size="small" className="disconnect-button" onClick={userLogout}>
            <ConnectIcon />
          </Fab>
        </div>
        <div className="modules">
        {modules.map((module, i) =>
          <div className="module-item" key={ i }>
            <LargeButton identifier={ module.toUpperCase() } elementclass={ module } icon={ true } text={ strings.modules[module].nom } onClick={(value) => { onClickModule(value) }}></LargeButton>
          </div>
        )}
        </div>
        <div className="tickets">{ strings.dashboard.ticketsnum }<span>{ numtickets }</span></div>
        <div className="ca">{ strings.dashboard.ca }<span className={ ca_eval }>{ ca.toFixed(2).replace(/\./g,',') }{ devise }</span></div>
      </div>
    );
  }
};
Dashboard.propTypes = {
  cashname: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  points: PropTypes.number,
  modules: PropTypes.arrayOf(PropTypes.string).isRequired,
  getCommandesList: PropTypes.func.isRequired,
  getAllActive: PropTypes.func.isRequired,
  getParametres: PropTypes.func.isRequired,
  getCurrentPeriode: PropTypes.func.isRequired,
  commandeslist: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.object
}

export default Dashboard;