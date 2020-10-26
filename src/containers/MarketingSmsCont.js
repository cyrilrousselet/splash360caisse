// @flow
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Sms from "../components/Marketing/Sms";
import { productActions } from "./../services/product/productActions";

const mapStateToProps = (state) => {
  return {
    products: state.productReducer.items,
  };
};

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators(
    {
      createProduct: productActions.createProduct,
      loadProducts: productActions.loadProducts,
    },
    dispatch
  );

  return {
    ...bound,
  };
};

const MarketingSmsCont = connect(mapStateToProps, mapDispatchToProps)(Sms);

export default MarketingSmsCont;
