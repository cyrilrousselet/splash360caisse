import React from 'react';

import LoadingSpinner from './common/LoadingSpinner';
import Logger from '../helpers/Logger';
import Swal from 'sweetalert2';
import schedule from 'node-schedule';

const logger = new Logger();



class MainLoader extends React.Component {
  
  _findeservice_job = null;

  constructor(props) {
    super(props);


    let first_start = props.params ? props.params.first_start : null;

    this.state = {
      first_start: first_start,
      paramLoaded: props.paramLoaded,
      sseInit: props.sseInit,
      catLoaded: props.catLoaded,
      cmdLoaded: true,
      cloLoaded: props.cloLoaded,
      inspect: false
    };
  }

  checkInstallation(mode) {
    const { 
      paramLoaded, 
      catLoaded, 
      // catLoading, 
      // cmdLoaded, 
      // cmdLoading, 
      cloLoaded, 
      sseInit, 
      params, 
      dbupdated, 
      dbgetInit,
      checkFinDeService
    } = this.props;

    if (this._findeservice_job===null && mode==="mount") {  
      this._findeservice_job = schedule.scheduleJob('0 30 5 * * *', () => {
        checkFinDeService();
      });
    }

    let first_start = params ? params.first_start : null;
    let readytolaunch = dbupdated || null;

    if (!paramLoaded) {
      this.props.getParametres();
    }

    if (paramLoaded===true && sseInit===false) {
      first_start = params.first_start;
      this.props.initSSE();
      this.props.setPOS();
      this.props.initSync();

      checkFinDeService();
  
      if (first_start===true && dbgetInit===false) this.props.getDatabase();
    }

    if (first_start===false) {
      if (paramLoaded===true && sseInit===true && 
          catLoaded===false) {
        this.props.getCatalogue();
        this.props.getLastClotureAndAfter();
      }
      if (paramLoaded===true && sseInit===true && catLoaded===true) {
     //   this.props.getTodayCommandesList();
        // this.props.loadNumero();
      }
      if (paramLoaded===true && sseInit===true && catLoaded===true && 
          cloLoaded===false) {
        this.props.getCloturesList();
        if(mode==="mount") {
          this.props.getTodayCa();
        }
        this.props.getCurrentPeriode();
      }
      if (paramLoaded===true && sseInit===true && catLoaded===true && cloLoaded===true) {
        if (readytolaunch && readytolaunch.length===2) {

          Swal.fire({
            type: 'warning',
            title:'Installation prête',
            text: 'Vous devez redémarrer l’application pour terminer l’installation',
            showCancelButton: false,
            focusConfirm: true,
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then((result)=> {
            if (result.value) {
              this.props.quitApp();
            }
          });

        } else if (readytolaunch===null) {
          this.props.initSyncCommandes();
          this.props.initSyncClotures();
          this.props.loadingComplete();
        }
      }
    }
  }

  componentDidMount() {
    this.checkInstallation("mount");
  }

  componentDidUpdate(prevProps, prevState) {
  this.checkInstallation("update");
  }

  render() {
    // const { 
    //   paramLoaded, 
    //   catLoaded, 
    //   // cmdLoaded, 
    //   cloLoaded, 
    //   sseInit, 
    //   first_start 
    // } = this.state;
  //  const { paramLoaded, paramLoading, catLoaded, catLoading, cmdLoaded, cmdLoading, cloLoaded, cloLoading, sseInit, params, dbupdated } = this.props;
    const { 
      paramLoaded, 
      catLoaded, 
      cloLoaded,
      sseInit,
      // dbgetInit,
      first_start
    } = this.props;

  // if (!paramLoaded || !catLoaded || !cmdLoaded || !cloLoaded || !sseInit) this.setState({inspect: true});

  // const param_charge = paramLoaded;

    return (      
      <div>
        <LoadingSpinner className="MainLoader-loading" />
        <div className="MainLoader-items">
          {first_start && <p className="MainLoader-item">Acquisition de la base de données...</p>}
          {paramLoaded && <p className="MainLoader-item">Paramètres chargés</p>}
          {sseInit && <p className="MainLoader-item">SSE initialisé</p>}
          {catLoaded && <p className="MainLoader-item">Catalogue chargés</p>}
          {/* {cmdLoaded && <p className="MainLoader-item">Commandes chargées</p>} */}
          {cloLoaded && <p className="MainLoader-item">Clotures chargées</p>}
        </div>
      </div>
    );
  }
}

export default MainLoader;