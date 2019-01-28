import React, { Component } from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import '../App.css';


const Sort = (props) => {


    const initSort = (event) => {
        const selectVal = event.target.value;
        const splitVal = selectVal.split('-');
        const sortValue = splitVal[0];
        const sortDirection = splitVal[1];
        props.sortProducts(props.productList, sortValue, sortDirection);
    }


    return (
        <FormControl variant="outlined">
            <Select value={props.currentSort} onChange={initSort}>
                <MenuItem value="totalPrice-asc">Total Price (Cheapest First)</MenuItem>
                <MenuItem value="totalPrice-desc">Total Price (Most Expensive First)</MenuItem>
                {/* <MenuItem value="price-asc">Price - Not incl Shipping (Cheapest First)</MenuItem>
                <MenuItem value="price-desc">Price - Not incl Shipping (Most Expensive First)</MenuItem> 
                <MenuItem value="shippingPrice-desc">Shipping Price (Cheapest First)</MenuItem>
                <MenuItem value="shippingPrice-asc">Shipping Price (Most Expensive First)</MenuItem>*/}
                <MenuItem value="productName-asc">Product Name (A-Z)</MenuItem>
                <MenuItem value="productName-desc">Product Name (Z-A)</MenuItem>
                <MenuItem value="dateAddedRaw-desc">Date Added (Newest First)</MenuItem>
                <MenuItem value="dateAddedRaw-asc">Date Added (Oldest First)</MenuItem>
            </Select>
        </FormControl>
    )
}

export default Sort;