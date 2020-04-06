import React from 'react';
import { CircularProgress } from '@material-ui/core';

class LoadingSpinner extends React.Component {
 render() {
  return (
   <div className={ `LoadingSpinner ${(this.props.className?this.props.className:'')}` }>
     <CircularProgress />
   </div>
  );
 }
};

export default LoadingSpinner;