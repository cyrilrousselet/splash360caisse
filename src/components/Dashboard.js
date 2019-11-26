import React, { Component } from 'react';
import LocalizedStrings from 'react-localization';
import {data} from '../constants/translations';
import LargeButton from './common/LargeButton';
import PropTypes from 'prop-types';

let strings = new LocalizedStrings(data);


class Dashboard extends Component {

  constructor(props) {
    super(props);

    this.calculeCA = this.calculeCA.bind(this);
  }

  componentDidMount() {
    console.log('Dashboard.componentDidMount()');
    this.props.getCommandesList();
  }


  calculeCA(){

    const { commandeslist } = this.props;
    let __ca = 0;
    let __tickets = 0;
    if (commandeslist) {
      for (let [key,value] of Object.entries(commandeslist)) {
        __ca += value.total;
        if (value.caisse==this.props.caisse) __tickets++;
      }
    }

    // évaluation du chiffre d'affaire vis à vis de l'objectif défini dans les settings
    console.log('TODO: set ca_eval');

    return {chiffredaffaires: __ca, ca_eval:'good', ticketsNum: __tickets};
  }


  render() {

    const { cashname, username, userid, modules, points, devise, onClickUseraccount, onClickModule } = this.props;
    const { chiffredaffaires, ca_eval, ticketsNum } = this.calculeCA();

    console.log(chiffredaffaires);

    return (
      <div className="Dashboard">
        <div className="topzone">
          <div className="cashName">{ cashname }</div>
          <div className="userName" onClick={()=>{onClickUseraccount(userid)} }>{ username }</div>
          {points!==null &&
            <div className="points">{ points }{ strings.dashboard.points }</div>
          }
        </div>
        <div className="modules">
        {modules.map((module, i) =>
          <div className="module-item" key={ i }>
            <LargeButton identifier={ module.toUpperCase() } elementclass={ module } icon={ true } text={ strings.modules[module].nom } onClick={(value) => { onClickModule(value) }}></LargeButton>
          </div>
        )}
        </div>
        <div className="tickets">{ strings.dashboard.ticketsnum }<span>{ ticketsNum }</span></div>
        <div className="ca">{ strings.dashboard.ca }<span className={ ca_eval }>{ chiffredaffaires.toFixed(2).replace(/\./g,',') }{ devise }</span></div>
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
  commandeslist: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.object
}

export default Dashboard;