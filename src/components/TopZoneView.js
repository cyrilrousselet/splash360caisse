import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';

const TopZone = ({ cashname, username, userid, homename, onClickUseraccount }) => (
  <div className="topzone">
    <div className="cashName">{ cashname }</div>
    <div className="userName" onClick={()=>{onClickUseraccount(userid)} }>{ username }</div>
    <Link to={routes.DASHBOARD}><div className="dashboardLink">{ homename }</div></Link>
  </div>
);

TopZone.propTypes = {
  cashname: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  userid: PropTypes.string.isRequired,
  homename: PropTypes.string,
  onClickUseraccount: PropTypes.func.isRequired,
}

export default TopZone;