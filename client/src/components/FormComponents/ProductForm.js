import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import '../../App.css';
import { spawn } from 'child_process';

function is_url(str) {
  const regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(str)) {
        return true;
    } else {
        return false;
    }
}

class ProductForm extends React.Component {

state = {
    productName: '',
    productUrl: '',
    validUrl: true
}

handleChange = name => event => {
    let empty = name + "Empty";
    this.setState({
        [name]: event.target.value,
    })
    if(name == "productUrl") {
        this.setState({
            validUrl: is_url(event.target.value),
        })
    }
  };

createProduct = (event) => {
    event.preventDefault();
    if(this.state.validUrl == true ) {
        this.props.hideError();
        if (!this.props.loading) {
            this.props.productIsLoading()
        }
        const product = {
            name: this.state.productName,
            url: this.state.productUrl
        }
        this.props.addProduct(product);
    } 
}

    render(){

    let loading = this.props.loading;
    const statusMsg = this.props.response == 403 ? "ERR: 403. This website blocks scraping bots 😥" : "This website doesn't have their metadata set up as standard";

        return(
        <form className="add-product-form" onSubmit={this.createProduct}>
            <div className="input-wrapper">
                <TextField required id="filled-name" label="Product Name" margin="normal" variant="filled" onChange={this.handleChange('productName')}/>
                <TextField required error={!this.state.validUrl} helperText={this.state.validUrl == false ? "Please enter a valid URL" : ""} id="filled-url" label="Product URL" margin="normal" variant="filled" onChange={this.handleChange('productUrl')}/> 
            </div>
            <div>
                {this.props.error == true &&
                    <span className="error-msg">This product cannot be scraped. ({statusMsg})</span>
                }
            </div>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>Add Product{loading && <CircularProgress size={24} className="btn-loading"/> }</Button>
        </form>
        )
    }
}

export default ProductForm;