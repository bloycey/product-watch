import React, { Component } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Tag from "./FormComponents/micro/Tag";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";
import format from "date-fns/format";
import "../App.css";
import Edit from "./Edit";
import ReactChartkick, { LineChart, PieChart } from "react-chartkick";
import Chart from "chart.js";
ReactChartkick.addAdapter(Chart);

class ProductTable extends React.Component {
  state = {
    expanded: false
  };

  toggleExpanded = () => {
    this.setState({
      expanded: !this.state.expanded
    });
  };

  refreshProduct = (id, product) => {
    this.props.updatingProduct(id);
    this.props.refreshProducts(product);
  };

  filterOut = (filterList, current) => {
    if (filterList && current) {
      return current.some(filter => filterList.includes(filter));
    }
  };

  render() {
    const {
      productName,
      image,
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
      tags,
      dateAdded,
      history,
      chartData,
      lowest,
      highest,
      movement,
      shippingPrice,
      updating,
      description
    } = this.props.details;
    const id = this.props.id;
    const shipping = shippingPrice == 0 ? "-" : shippingPrice;
    const total = (parseFloat(shippingPrice) + parseFloat(price)).toFixed(2);

    let singleProductList = {};
    singleProductList[this.props.id] = this.props.details;
    singleProductList[this.props.id].id = id;
    const updated = distanceInWordsToNow(Date.parse(date), {
      addSuffix: true,
      includeSeconds: true
    });

    const MovementIcon = () => {
      if (movement && movement.from) {
        const options = {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric"
        };
        const distance = distanceInWordsToNow(Date.parse(movement.date), {
          addSuffix: true
        });

        if (movement.trend == "up") {
          return (
            <div className="mvmnt-wrapper">
              <i className="material-icons up">trending_up</i> ({distance})
            </div>
          );
        } else {
          return (
            <div className="mvmnt-wrapper">
              <i className="material-icons down">trending_down</i> ({distance})
            </div>
          );
        }
      } else {
        return (
          <div className="mvmnt-wrapper">
            <i className="material-icons flat">trending_flat</i>
          </div>
        );
      }
    };

    const ImageTag = () => {
      if (image == "No Image Found") {
        return "No Image Found";
      } else {
        return <img src={image} alt={productName} className="product-img" />;
      }
    };

    const movementString =
      movement && movement.from
        ? `${movement.trend} from $${movement.from} to $${movement.to} (${
            movement.percentChange
          }) on ${movement.date}`
        : `${movement.trend}`;

    let expandIcon =
      this.state.expanded === true ? "expand_less" : "expand_more";

    if (
      this.filterOut(this.props.filterBy, tags) ||
      this.props.filterBy.length == 0
    ) {
      return (
        <TableBody>
          <TableRow
            className={
              "expanded-" + this.state.expanded + " updating-" + updating
            }
          >
            <TableCell
              colSpan={3}
              className="table-text pointer "
              onClick={this.toggleExpanded}
            >
              <span className="name-cell">{productName}</span>
              <span className="float-right expand-toggle-icon">
                <i className="material-icons">{expandIcon}</i>
              </span>
            </TableCell>
            <TableCell colSpan={3} className="table-text">
              <ul className="tags-table-wrapper">
                &nbsp;
                {tags &&
                  tags.map(tag => {
                    return <li key={tag}>{tag}</li>;
                  })}
              </ul>
            </TableCell>
            <TableCell colSpan={2} className="table-text table-price">
              <div>{price}</div>
              <MovementIcon />
            </TableCell>
            <TableCell colSpan={2} className="table-text">
              {shipping}
            </TableCell>
            <TableCell colSpan={1} className="table-text">
              {total}
            </TableCell>
            <TableCell colSpan={1} className="text-right">
              {updating && (
                <CircularProgress size={24} className="btn-loading" />
              )}
              <span
                className="pointer"
                onClick={() => this.refreshProduct(id, singleProductList)}
              >
                <i className="material-icons">refresh</i>
              </span>
              <span
                className="pointer"
                onClick={() => this.props.deleteProduct(id)}
              >
                <i className="material-icons">delete_outline</i>
              </span>
            </TableCell>
          </TableRow>
          {this.state.expanded === true && (
            <TableRow>
              <TableCell colSpan={12}>
                {chartData && (
                  <LineChart
                    data={chartData}
                    messages={{ empty: "Refresh price for chart data" }}
                    prefix="$"
                  />
                )}
                <div className="additional-info">
                  <Grid container spacing={24}>
                    <Grid item xs={12}>
                      <h3 className="uppercase">Additional Information</h3>
                      <hr />
                    </Grid>
                    <Grid item xs={4} className="meta-desc">
                      <h4 className="uppercase">Meta description</h4>
                      <p>{description}</p>
                      <Edit
                        id={id}
                        name={productName}
                        tags={tags}
                        shippingPrice={shippingPrice}
                        updateProduct={this.props.updateProduct}
                      />
                    </Grid>
                    <Grid item xs={5} className="additional-product-details">
                      <p>
                        <strong>URL: </strong>
                        <a href={url} target="_blank">
                          {url}{" "}
                        </a>
                        <br />
                        <strong>Date Added: </strong>
                        {dateAdded} <br />
                        <strong>Last Updated: </strong>
                        {updated} ({date}) <br />
                        {lowest && (
                          <React.Fragment>
                            <strong>Lowest Price: </strong>${lowest.value} (
                            {lowest.date})<br />
                          </React.Fragment>
                        )}
                        {highest && (
                          <React.Fragment>
                            <strong>Highest Price: </strong>${highest.value} (
                            {highest.date})<br />
                          </React.Fragment>
                        )}
                        {movement && (
                          <React.Fragment>
                            <strong>Last Change: </strong>
                            {movementString}
                            <br />
                          </React.Fragment>
                        )}
                      </p>
                    </Grid>
                    <Grid item xs={3}>
                      <ImageTag />
                    </Grid>
                  </Grid>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      );
    } else {
      return null;
    }
  }
}
export default ProductTable;
