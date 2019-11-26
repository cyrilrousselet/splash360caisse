import React from 'react';
import { connect } from 'react-redux';

const BrowserLocation = ({ pathname, search, hash }) => (
  <div className="BrowserLocation">
    <strong>Browser Location:&nbsp;</strong>
    <div><span className="int">pathname:</span> '{pathname}'</div>&nbsp;•&nbsp;
    <div><span className="int">search:</span> '{search}'</div>&nbsp;•&nbsp;
    <div><span className="int">hash:</span> '{hash}'</div>
  </div>
)

const mapStateToProps = state => ({
  pathname: state.router.location.pathname,
  search: state.router.location.search,
  hash: state.router.location.hash,
});

export default connect(mapStateToProps)(BrowserLocation);