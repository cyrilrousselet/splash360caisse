import React from 'react';

import {data} from '../constants/translations';
import LocalizedStrings from 'react-localization';
import LoadingSpinner from './common/LoadingSpinner';
import Logger from '../helpers/Logger';
import Swal from 'sweetalert2';

const logger = new Logger();

let strings = new LocalizedStrings(data);

class MainLoader extends React.Component {
  

  constructor(props) {
    super(props);
  }

  componentDidMount() {

    logger.log('MainLoader.componentDidMount()');
    
      // this.props.getParametres();
      // this.props.getCommandesList();
      // this.props.getCatalogue();
      // this.props.getCurrentPeriode();
      // this.props.getCloturesList();
  }

  render() {
    const { paramLoaded, paramLoading, catLoaded, catLoading, cmdLoaded, cmdLoading, cloLoaded, cloLoading, sseInit, params, dbupdated } = this.props;

    let first_start = params ? params.first_start : null;

    let readytolauch = dbupdated || null;
    // let first_start = false;

    if (!paramLoaded) {
      this.props.getParametres();
    }
    if (paramLoaded && !sseInit) {
      first_start = params.first_start;
      this.props.initSSE();
      this.props.setPOS();
      this.props.initSync();
      logger.log('first_start',first_start);
     if (first_start===true) this.props.getDatabase();
    }
    if (first_start===false) {
      if (paramLoaded && sseInit && !catLoaded && !catLoading) {
        this.props.getCatalogue();
      }
      if (paramLoaded && sseInit && catLoaded && !cmdLoaded && !cmdLoading) {
        this.props.getCommandesList();
      }
      if (paramLoaded && sseInit && catLoaded && cmdLoaded && !cloLoaded && !cloLoading) {
        this.props.getCloturesList();
        this.props.getCurrentPeriode();
      }
      if (paramLoaded && sseInit && catLoaded && cmdLoaded && cloLoaded) {
        if (readytolauch && readytolauch.length==2) {

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
          this.props.loadingComplete();
        }
      }
    }
    return (      
      <div>
        <LoadingSpinner className="MainLoader-loading" />
        <div className="MainLoader-items">
          {first_start && <p className="MainLoader-item">Acquisition de la base de données...</p>}
          {paramLoaded && <p className="MainLoader-item">Paramètres chargés</p>}
          {sseInit && <p className="MainLoader-item">SSE initialisé</p>}
          {catLoaded && <p className="MainLoader-item">Catalogue chargées</p>}
          {cmdLoaded && <p className="MainLoader-item">Commandes chargées</p>}
          {cloLoaded && <p className="MainLoader-item">Clotures chargées</p>}
        </div>
      </div>
    );
  }
}

export default MainLoader;