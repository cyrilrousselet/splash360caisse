import React from 'react';

import {data} from '../constants/translations';
import LocalizedStrings from 'react-localization';
import LoadingSpinner from './common/LoadingSpinner';
import Logger from '../helpers/Logger';

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
    const { paramLoaded, paramLoading, catLoaded, catLoading, cmdLoaded, cmdLoading, cloLoaded, cloLoading, sseInit, params } = this.props;

    // let first_start;
    let first_start = false;

    if (!paramLoaded) {
      this.props.getParametres();
    }
    if (paramLoaded && !sseInit) {
 //     first_start = params.first_start;
      this.props.initSSE();
      this.props.setPOS();
      this.props.initSync();
      logger.log('first_start',first_start);
  //    if (first_start===true) this.props.getDatabase();
    }
    if (paramLoaded && sseInit && !catLoaded && !catLoading && first_start===false) {
      this.props.getCatalogue();
    }
    if (paramLoaded && sseInit && catLoaded && !cmdLoaded && !cmdLoading && first_start===false) {
      this.props.getCommandesList();
    }
    if (paramLoaded && sseInit && catLoaded && cmdLoaded && !cloLoaded && !cloLoading && first_start===false) {
      this.props.getCloturesList();
      this.props.getCurrentPeriode();
    }
    if (paramLoaded && sseInit && catLoaded && cmdLoaded && cloLoaded && first_start===false) {
      this.props.loadingComplete();
    }
    return (      
      <div>
        <LoadingSpinner className="MainLoader-loading" />
        {first_start && <p>get database...</p>}
      </div>
    );
  }
}

export default MainLoader;