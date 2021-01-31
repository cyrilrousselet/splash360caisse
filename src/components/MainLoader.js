import React from 'react';

import LoadingSpinner from './common/LoadingSpinner';
import Logger from '../helpers/Logger';
import Swal from 'sweetalert2';

const logger = new Logger();


class MainLoader extends React.Component {
  

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

  componentDidMount() {

    logger.log('MainLoader.componentDidMount()');
    
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
      dbgetInit 
    } = this.props;

    let first_start = params ? params.first_start : null;

    let readytolaunch = dbupdated || null;
      // this.props.getParametres();
      // this.props.getCommandesList();
      // this.props.getCatalogue();
      // this.props.getCurrentPeriode();
      // this.props.getCloturesList();
      console.log('props', this.props);

     if (!paramLoaded) {
       logger.log('MainLoader.componentDidMount()', 'getParametres()');
       this.props.getParametres();
     }
    
    // logger.log('paramLoaded', paramLoaded);
    // logger.log('first_start', first_start);
    // logger.log('sseInit', sseInit);
    // logger.log('catLoaded', catLoaded);
    // logger.log('cmdLoaded', cmdLoaded);
    // logger.log('cloLoaded', cloLoaded);
    // if (paramLoaded===true && this.state.paramLoaded!==paramLoaded) {
    //   this.setState({paramLoaded: true});
    // }
    // if (first_start===true && this.state.first_start!==first_start) {
    //   this.setState({first_start: true});
    // }
    // if (sseInit===true && this.state.sseInit!==sseInit) {
    //   this.setState({sseInit: true});
    // }
    // if (catLoaded===true && this.state.catLoaded!==catLoaded) {
    //   this.setState({catLoaded: true});
    // }
    // if (cmdLoaded===true && this.state.cmdLoaded!==cmdLoaded) {
    //   this.setState({cmdLoaded: true});
    // }
    // if (cloLoaded===true && this.state.cloLoaded!==cloLoaded) {
    //   this.setState({cloLoaded: true});
    // }
    if (paramLoaded===true && sseInit===false) {
      first_start = params.first_start;
      logger.log('sse depuis componentDidMount');
      this.props.initSSE();
      this.props.setPOS();
      this.props.initSync();
      logger.log('first_start',first_start);
     if (first_start===true && dbgetInit===false) this.props.getDatabase();
    }
    if (first_start===false) {
      if (paramLoaded===true && sseInit===true && 
          catLoaded===false) {
        this.props.getCatalogue();
      }
      if (paramLoaded===true && sseInit===true && catLoaded===true) {
     //   this.props.getTodayCommandesList();
        // this.props.loadNumero();
      }
      if (paramLoaded===true && sseInit===true && catLoaded===true && 
          cloLoaded===false) {
        this.props.getCloturesList();
        this.props.getTodayCa();
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

  componentDidUpdate(prevProps, prevState) {
  //  logger.log('MainLoader.componentDidUpdate()', this.props);
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
      dbgetInit 
    } = this.props;

    let first_start = params ? params.first_start : null;

    let readytolauch = dbupdated || null;
    // let first_start = false;

    if (paramLoaded===false) {
      this.props.getParametres();
    }
    // logger.log('paramLoaded', paramLoaded);
    // logger.log('sseInit', sseInit);
    // logger.log('catLoaded', catLoaded);
    // logger.log('cmdLoaded', cmdLoaded);
    // logger.log('cloLoaded', cloLoaded);


    // let changess = [];
    // if (this.state.paramLoaded!==prevState.paramLoaded) changess.push('paramLoaded');
    // if (this.state.sseInit!==prevState.sseInit) changess.push('sseInit');
    // if (this.state.catLoaded!==prevState.catLoaded) changess.push('catLoaded');
    // if (this.state.cmdLoaded!==prevState.cmdLoaded) changess.push('cmdLoaded');
    // if (this.state.cloLoaded!==prevState.cloLoaded) changess.push('cloLoaded');


    // logger.log('changes state', changess.join(', '));

    // let changes = [];
    // if (paramLoaded!==prevProps.paramLoaded) changes.push('paramLoaded');
    // if (sseInit!==prevProps.sseInit) changes.push('sseInit');
    // if (catLoaded!==prevProps.catLoaded) changes.push('catLoaded');
    // if (cmdLoaded!==prevProps.cmdLoaded) changes.push('cmdLoaded');
    // if (cloLoaded!==prevProps.cloLoaded) changes.push('cloLoaded');
    // if (params!==prevProps.params) changes.push('params');

    // logger.log('changes props', changes.join(', '));

    // if (paramLoaded===true && prevProps.paramLoaded!==paramLoaded) {
    //   this.setState({paramLoaded: true});
    // }

    // if (sseInit===true && prevProps.sseInit!==sseInit) {
    //   this.setState({sseInit: true});
    // }
    // if (catLoaded===true && prevProps.catLoaded!==catLoaded) {
    //   this.setState({catLoaded: true});
    // }
    // if (cloLoaded===true && prevProps.cloLoaded!==cloLoaded) {
    //   this.setState({cloLoaded: true});
    // }
    if (paramLoaded===true && sseInit===false) {
      first_start = params.first_start;
      logger.log('sse depuis componentDidUpdate');
      this.props.initSSE();
      this.props.setPOS();
      this.props.initSync();
      logger.log('first_start',first_start);
     if (first_start===true && dbgetInit===false) this.props.getDatabase();
    }
    if (first_start===false) {
      if (paramLoaded===true && sseInit===true && 
          catLoaded===false) {
        this.props.getCatalogue();
      }
      if (paramLoaded===true && sseInit===true && catLoaded===true) {
      //  this.props.getTodayCommandesList();
        // this.props.loadNumero();
      }
      if (paramLoaded===true && sseInit===true && catLoaded===true && 
          cloLoaded===false) {
        this.props.getCloturesList();
        this.props.getCurrentPeriode();
      }
      if (paramLoaded===true && sseInit===true && catLoaded===true && cloLoaded===true) {
        if (readytolauch && readytolauch.length===2) {

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

        } else if (readytolauch===null) {
          this.props.initSyncCommandes();
          this.props.initSyncClotures();
          this.props.loadingComplete();
        }
      }
    }
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