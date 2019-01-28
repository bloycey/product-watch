import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import "../../App.css";

class PricePick extends React.Component {
  render() {
    const {
      productName,
      url,
      date,
      jsonld,
      metaprice,
      itemprop,
      genericMeta,
      editMode,
      status,
      price,
      type,
      priceIndex,
      id,
      priceSet
    } = this.props.currentItem;

    const currentSelection = type + priceIndex;

    //Create function to loop over these and build the price matrices

    const itempropPrices = itemprop.map((singlePrice, index) => (
      <Paper
        className={
          "itemprop" + index == currentSelection
            ? "active price-paper"
            : "itemprop" + index + " " + "price-paper"
        }
        key={"itemprop" + index}
        onClick={() => {
          this.props.setPrice(singlePrice, id, "itemprop", index);
        }}
      >
        <span className="price-type">Itemprop</span>
        <h2 className="product-price">{singlePrice}</h2>
      </Paper>
    ));

    const jsonldPrices = jsonld.map((singlePrice, index) => (
      <Paper
        className={
          "jsonld" + index == currentSelection
            ? "active price-paper"
            : "jsonld" + index + " " + "price-paper"
        }
        key={"jsonld" + index}
        onClick={() => {
          this.props.setPrice(singlePrice, id, "jsonld", index);
        }}
      >
        <span className="price-type">Json-ld</span>
        <h2 className="product-price">{singlePrice}</h2>
      </Paper>
    ));

    const genericMetaPrices = genericMeta.map((singlePrice, index) => (
      <Paper
        className={
          "genericMeta" + index == currentSelection
            ? "active price-paper"
            : "genericMeta" + index + " " + "price-paper"
        }
        key={"genericMeta" + index}
        onClick={() => {
          this.props.setPrice(singlePrice, id, "genericMeta", index);
        }}
      >
        <span className="price-type">Generic Meta</span>
        <h2 className="product-price">{singlePrice}</h2>
      </Paper>
    ));

    const metapricePrices = metaprice.map((singlePrice, index) => (
      <Paper
        className={
          "metaprice" + index == currentSelection
            ? "active price-paper"
            : "metaprice" + index + " " + "price-paper"
        }
        key={"metaprice" + index}
        onClick={() => {
          this.props.setPrice(singlePrice, id, "metaprice", index);
        }}
      >
        <span className="price-type">Metaprice</span>
        <h2 className="product-price">{singlePrice}</h2>
      </Paper>
    ));

    return (
      <div>
        {jsonldPrices}
        {metapricePrices}
        {itempropPrices}
        {genericMetaPrices}
        <div className="price-btn-wrapper">
          {priceSet === true && (
            <Button
              variant="contained"
              color="primary"
              onClick={this.props.handleNext}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    );
  }
}

export default PricePick;
