import React from "react";

class Sms extends React.Component {
  constructor(props) {
    super(props);
    this.addProduct = this.addProduct.bind(this);
  }

  componentDidMount() {
    this.props.loadProducts();
  }

  addProduct() {
    // commandeServices.getCommandesToSync().then((res) => {
    //   console.log("Commandes to sync: ", res);
    // });

    const id = Math.floor(Math.random() * 100);
    this.props.createProduct({
      id,
      name: `Product ${id}`,
      price: Math.floor(Math.random() * 10),
    });
  }

  render() {
    console.log("Products: ", this.props.products);
    return (
      <div className="Sms subcontent">
        <div className="wrapper">
          <p>Liste des Sms</p>
          <button onClick={this.addProduct}>Test Mongo</button>
          <ul>
            {this.props.products &&
              this.props.products.map((p) => <li key={`${p.id}`}>{p.name}</li>)}
          </ul>
        </div>
      </div>
    );
  }
}

export default Sms;
