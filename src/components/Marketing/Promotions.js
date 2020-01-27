import React from 'react';
import contimage from '../../assets/images/fake_contenu_marketing.svg';


class Promotions extends React.Component {
 render() {
  return (
   <div className="Promotions subcontent">
    <img src={ contimage } className="contimage" />
   </div>
  );
 }
};

export default Promotions;