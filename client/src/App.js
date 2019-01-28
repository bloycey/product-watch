import React, { Component } from "react";
import ProductStepper from "./components/ProductStepper";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import blue from "@material-ui/core/colors/blue";
import pink from "@material-ui/core/colors/pink";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import ProductTable from "./components/ProductTable";
import Sort from "./components/Sort";
import Filter from "./components/Filter";
import format from "date-fns/format";
import sort from "fast-sort";
import "./App.css";
import { getTime, addSeconds, differenceInSeconds } from "date-fns";
import axios from "axios";

const theme = createMuiTheme({
  typography: {
    // Use Fira Sans instead of the default Roboto font.
    fontFamily: [
      "Fira Sans",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"'
    ].join(",")
  },
  palette: {
    primary: blue,
    secondary: pink
  }
});

class App extends Component {
  state = {
    productList: {},
    numOfItems: 0,
    response: "",
    currentItem: "",
    stepper: 0,
    productLoading: false,
    error: false,
    updateInterval: 900,
    updatingIn: 900,
    sortBy: "totalPrice-desc",
    filterBy: []
  };

  componentDidMount() {
    this.loadState();
  }

  componentWillUnmount() {
    this.saveAll();
  }

  loadState = () => {
    const localState = localStorage.getItem("state");
    console.log("loading local state", localState);
    if (localState) {
      const parsedLocal = JSON.parse(localState);
      const productList = parsedLocal.productList || {};
      const numOfItems = parsedLocal.numOfItems || 0;
      const response = parsedLocal.response || "";
      const currentItem = parsedLocal.currentItem || "";
      const stepper = parsedLocal.stepper || 0;
      const sortBy = parsedLocal.sortBy;
      const filterBy = parsedLocal.filterBy || [];
      console.log("state retrieved!! ", parsedLocal);
      this.setState(
        {
          productList,
          numOfItems,
          response,
          currentItem,
          stepper,
          sortBy,
          filterBy
        },
        () => this.refreshProducts(this.state.productList)
      );
    }
    setInterval(() => this.decrementUpdateTimer(), 1000); // Runs once a second.
  };

  decrementUpdateTimer = () => {
    let newVal = this.state.updatingIn - 1;
    if (newVal == 0) {
      this.setState(
        {
          updatingIn: this.state.updateInterval
        },
        () => {
          this.refreshProducts(this.state.productList);
        }
      );
    } else {
      this.setState({
        updatingIn: newVal
      });
    }
  };

  sortProducts = (obj, sortby, direction) => {
    let newArray = [];
    Object.keys(obj).map(key => newArray.push(obj[key]));

    const sorted =
      direction == "desc"
        ? sort(newArray).desc(product => product[sortby])
        : sort(newArray).asc(product => product[sortby]);

    let newObject = {};
    for (let i = 0; i < sorted.length; i++) {
      newObject[sorted[i].id] = sorted[i];
    }

    this.setState(
      {
        productList: newObject,
        sortBy: sortby + "-" + direction
      },
      () => this.saveAll()
    );
  };

  saveAll = () => {
    console.log("save all triggered");
    console.log(this.state);
    localStorage.setItem("state", JSON.stringify(this.state));
  };

  addProductBasic = product => {
    //SEND PRODUCT TO SERVER
    console.log(product.name, product.url);
    axios
      .get(`/api/getPrice/${product.name}/?url=${product.url}`)
      .then(res => {
        const priceResponse = res.data.response;
        if (
          priceResponse.status == 200 &&
          (priceResponse.genericMeta.length !== 0 ||
            priceResponse.itemprop.length !== 0 ||
            priceResponse.jsonld.length !== 0 ||
            priceResponse.metaprice.length !== 0)
        ) {
          this.setState({
            currentItem: priceResponse,
            stepper: 1,
            response: priceResponse.status
          });
        }
      })
      .catch(error => {
        console.log(error.response.status);
        this.setState({
          response: error.response.status
        });
        this.productIsNotLoading();
        this.displayError();
      });
  };

  setPrice = (setPrice, id, type, index) => {
    let current = { ...this.state.currentItem };
    current.price = setPrice;
    current.type = type;
    current.priceIndex = index;
    current.priceSet = true;
    this.setState({
      currentItem: current
    });
  };

  addTag = tag => {
    let current = { ...this.state.currentItem };
    current.tags = current.tags || [];
    current.tags.push(tag);
    this.setState({
      currentItem: current
    });
  };

  deleteTag = tag => {
    let current = { ...this.state.currentItem };
    const newTags = current.tags.filter(item => item !== tag);
    current.tags = newTags;
    this.setState({
      currentItem: current
    });
  };

  addShipping = price => {
    let current = { ...this.state.currentItem };
    current.shippingPrice = price;
    current.totalPrice = (
      parseFloat(price) + parseFloat(this.state.currentItem.price)
    ).toFixed(2);
    this.setState({
      currentItem: current
    });
  };

  saveCurrent = () => {
    let products = { ...this.state.productList };
    const identifier = Date.now();
    products[`product${identifier}`] = this.state.currentItem;
    if (products[`product${identifier}`].totalPrice == 0) {
      products[`product${identifier}`].totalPrice =
        products[`product${identifier}`].price;
    }

    this.setState(
      {
        productList: products,
        stepper: 0,
        currentItem: "",
        productLoading: false
      },
      () => {
        const splitVal = this.state.sortBy.split("-");
        const sortValue = splitVal[0];
        const sortDirection = splitVal[1];
        this.sortProducts(this.state.productList, sortValue, sortDirection);
        this.saveAll();
      }
    );
  };

  deleteProduct = key => {
    let products = { ...this.state.productList };
    delete products[key];
    this.setState(
      {
        productList: products
      },
      () => this.saveAll()
    );
  };

  updatingProduct = key => {
    let products = { ...this.state.productList };
    products[key].updating = true;
    this.setState({
      productList: products
    });
  };

  refreshProducts = products => {
    Object.keys(products).map(key => {
      console.log("full products", products[key]);
      console.log("products type", products[key].type);
      let productToRefresh = {
        productName: products[key].productName,
        url: products[key].url,
        id: products[key].id,
        type: products[key].type,
        priceIndex: products[key].priceIndex
      };
      this.updatingProduct(key);
      console.log("product to refresh", productToRefresh);

      axios
        .get(
          `/api/updateProduct/${productToRefresh.productName}/${
            productToRefresh.id
          }/${productToRefresh.type}/${productToRefresh.priceIndex}/?url=${
            productToRefresh.url
          }`
        )
        .then(res => {
          console.log(res.data.id, res.data.data, res.data.date);
          const { id, data, date } = res.data;

          const allProducts = { ...this.state.productList };
          allProducts[id].price = data;
          allProducts[id].date = date;
          allProducts[id].updating = false;

          //Create a history item and push to product history array
          const historyItem = {
            date: date,
            price: data
          };
          let productHistory = allProducts[id].history || [];
          productHistory.unshift(historyItem);
          allProducts[id].history = productHistory;

          //Create history for chart
          const chartItem = [
            format(new Date(), "YYYY-MM-DD HH:mm:ss Z"),
            parseFloat(data)
          ];
          let chartData = allProducts[id].chartData || [];
          chartData.push(chartItem);
          allProducts[id].chartData = chartData;

          //Set Highest and Lowest

          let historyPriceArray = [];

          productHistory.forEach(arr => {
            historyPriceArray.push(parseFloat(arr.price));
          });

          let historyDateArray = [];

          productHistory.forEach(arr => {
            historyDateArray.push(arr.date);
          });

          function lowestPrice(arr) {
            let index = 0;
            let value = arr[0];
            for (let i = 1; i < arr.length; i++) {
              if (arr[i] < value) {
                value = arr[i];
                index = i;
              }
            }
            return {
              lowest: value,
              index: index
            };
          }

          const lowestPriceData = lowestPrice(historyPriceArray);
          const lowestPriceValue = lowestPriceData.lowest;
          const lowestPriceIndex = lowestPriceData.index;
          const lowestPriceDate = historyDateArray[lowestPriceIndex];

          function highestPrice(arr) {
            let index = 0;
            let value = arr[0];
            for (let i = 1; i < arr.length; i++) {
              if (arr[i] > value) {
                value = arr[i];
                index = i;
              }
            }
            return {
              highest: value,
              index: index
            };
          }

          const highestPriceData = highestPrice(historyPriceArray);
          const highestPriceValue = highestPriceData.highest;
          const highestPriceIndex = highestPriceData.index;
          const highestPriceDate = historyDateArray[highestPriceIndex];

          allProducts[id].lowest = {
            value: lowestPriceValue,
            date: lowestPriceDate
          };

          allProducts[id].highest = {
            value: highestPriceValue,
            date: highestPriceDate
          };

          // Set last movement

          function percentChange(previous, current) {
            const difference = previous - current;
            return (difference / previous) * 100;
          }

          function lastMovement(arr) {
            let index = 0;
            let value = arr[0];
            for (let i = 1; i < arr.length; i++) {
              if (arr[i] !== value) {
                return {
                  trend: arr[i] > value ? "Down" : "Up",
                  from: arr[i],
                  to: value,
                  index: i,
                  percentChange: percentChange(value, arr[i])
                };
                value = arr[i];
                index = i;
              }
            }
            return {
              trend: "No Movement Recorded",
              from: null,
              to: null,
              index: null,
              percentChange: 0
            };
          }

          const lastMovementData = lastMovement(historyPriceArray);
          console.log("historyPriceArray", historyPriceArray);
          console.log("lastMovementData", lastMovementData);

          allProducts[id].movement = {
            trend: lastMovementData.trend,
            from: lastMovementData.from,
            to: lastMovementData.to,
            date: historyDateArray[lastMovementData.index - 1],
            percentChange:
              (Math.sign(lastMovementData.percentChange) == 1 ? "+" : "") +
              lastMovementData.percentChange.toFixed(2) +
              "%"
          };

          //Set State

          this.setState(
            {
              productList: allProducts
            },
            () => this.saveAll()
          );
        });
    });
  };

  handleNext = () => {
    this.setState({
      stepper: this.state.stepper + 1
    });
  };

  handleBack = () => {
    this.setState({
      stepper: this.state.stepper - 1
    });
  };

  handleReset = () => {
    this.setState({
      stepper: 0
    });
  };

  updatingAll = () => {
    this.setState({
      updatingAll: true
    });
  };

  updatingComplete = () => {
    this.setState({
      updatingAll: false
    });
  };

  productIsLoading = () => {
    this.setState({
      productLoading: true
    });
  };

  productIsNotLoading = () => {
    this.setState({
      productLoading: false
    });
  };

  displayError = () => {
    this.setState({
      error: true
    });
  };

  hideError = () => {
    this.setState({
      error: false
    });
  };

  editFilters = filterName => {
    let currentFilters = [...this.state.filterBy];

    if (currentFilters.indexOf(filterName.tag) == -1) {
      currentFilters.push(filterName.tag);
    } else {
      currentFilters = currentFilters.filter(filter => {
        return filter !== filterName.tag;
      });
    }
    this.setState({
      filterBy: currentFilters
    });
  };

  updateProduct = (id, name, tagsArray, shippingPrice) => {
    let products = { ...this.state.productList };
    products[id].productName = name;
    products[id].tags = tagsArray;
    products[id].shippingPrice = shippingPrice;
    this.setState(
      {
        productList: products
      },
      () => this.saveAll()
    );
  };

  render() {
    const updatingAll = this.state.updatingAll;
    let minutes = Math.floor(this.state.updatingIn / 60);
    let seconds = this.state.updatingIn - minutes * 60;

    return (
      <MuiThemeProvider theme={theme}>
        <section className="app-wrapper">
          <ProductStepper
            addProduct={this.addProductBasic}
            currentItem={this.state.currentItem}
            setPrice={this.setPrice}
            saveCurrent={this.saveCurrent}
            stepper={this.state.stepper}
            handleNext={this.handleNext}
            handleBack={this.handleBack}
            handleReset={this.handleReset}
            addTag={this.addTag}
            deleteTag={this.deleteTag}
            addShipping={this.addShipping}
            productIsLoading={this.productIsLoading}
            productIsNotLoading={this.productIsNotLoading}
            loading={this.state.productLoading}
            error={this.state.error}
            hideError={this.hideError}
            response={this.state.response}
          />
          <br />
          <br />
          {Object.keys(this.state.productList).length > 0 && (
            <section className="wrapper">
              <div className="text-right">
                <div className="filter-wrapper text-right">
                  <Filter
                    list={this.state.productList}
                    editFilters={this.editFilters}
                    filterBy={this.state.filterBy}
                  />
                </div>
                <div className="sort-wrapper">
                  <Sort
                    sortProducts={this.sortProducts}
                    productList={this.state.productList}
                    currentSort={this.state.sortBy}
                  />
                </div>
              </div>

              <Paper className="products-wrapper">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={3} className="table-title">
                        Product Name
                      </TableCell>
                      <TableCell colSpan={3} className="table-title">
                        Tags
                      </TableCell>
                      <TableCell colSpan={2} className="table-title">
                        Price
                      </TableCell>
                      <TableCell colSpan={2} className="table-title">
                        Shipping
                      </TableCell>
                      <TableCell colSpan={1} className="table-title">
                        <strong>TOTAL</strong>
                      </TableCell>
                      <TableCell colSpan={1} className="text-right" />
                    </TableRow>
                  </TableHead>
                  {this.state.productList &&
                    Object.keys(this.state.productList).map(key => (
                      <ProductTable
                        filterBy={this.state.filterBy}
                        key={key}
                        id={key}
                        details={this.state.productList[key]}
                        setPrice={this.setPrice}
                        refreshProducts={this.refreshProducts}
                        deleteProduct={this.deleteProduct}
                        updatingProduct={this.updatingProduct}
                        updateProduct={this.updateProduct}
                      />
                    ))}
                </Table>
              </Paper>
              <footer>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => this.refreshProducts(this.state.productList)}
                >
                  Update All <i className="material-icons">refresh</i>
                </Button>
                <span className="autoupdate fade">
                  Auto updating in {minutes}:{("00" + seconds).slice(-2)};
                </span>
              </footer>
            </section>
          )}
        </section>
      </MuiThemeProvider>
    );
  }
}

export default App;
