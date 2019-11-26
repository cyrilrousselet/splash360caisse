import React from 'react';
import PropTypes from 'prop-types';

const PillConnect = ({ activated, onClick }) => (
  <div
    className={ activated ? 'PillConnect active' : 'PillConnect' }
    onClick={ ()=>{ if (activated) onClick(); } }
  ></div>
);

PillConnect.propTypes = {
  activated: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
}

export default PillConnect;