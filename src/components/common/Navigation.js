import React, { Component } from 'react';
import { matchPath, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import NavigationButton from './NavigationButton.js';
import paths from './../../constants/routes.json';


class Navigation extends Component {

  render() {

    const { submodules, strings, titre, onClickSubmodule, path_prefix } = this.props;

    return (
      <div className="sidebar">
        <div className="titre">
          <div className="icon"></div>
          <div className="text">{ titre }</div>
        </div>
        <div className="submodulesList">
          {submodules.map((submodule, i) => 
            <div className={matchPath(this.props.location.pathname, { path: paths[`${path_prefix}_${submodule.toUpperCase()}`] }) ? 'module-item active' : 'module-item'} key={ i }>
              <NavigationButton identifier={ `${path_prefix}_${submodule.toUpperCase()}` } elementclass={ submodule } text={ strings[submodule].nom } onClick={(value) => { onClickSubmodule(value) }}></NavigationButton>
            </div>
          )}
        </div>
      </div>
    );
  }
}

Navigation.propTypes = {
  onClickSubmodule: PropTypes.func.isRequired,
}

export default withRouter(Navigation);