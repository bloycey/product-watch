import React, { Component } from "react";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Tag from "./FormComponents/micro/Tag";
import "../App.css";

class Edit extends React.Component {
  state = {
    open: false,
    productName: this.props.name,
    tags: this.props.tags,
    shippingPrice: this.props.shippingPrice,
    currentTagName: "",
    missingTag: false
  };

  handleChangeInput = name => event => {
    this.setState({
      [name]: event.target.value,
      missingTag: false
    });
  };

  addTag = event => {
    event.preventDefault();
    let tag = this.state.currentTagName;
    console.log("DO SOMETHING WITH CURRENT TAG " + tag);
    let currentTags = this.state.tags || [];
    currentTags.push(tag);
    this.setState({
      tags: currentTags
    });
  };

  deleteTag = tag => {
    let currentTags = this.state.tags;
    let newTags = currentTags.filter(current => {
      return current !== tag;
    });
    this.setState({
      tags: newTags
    });
  };

  handleSubmit = () => {
    this.props.updateProduct(
      this.props.id,
      this.state.productName,
      this.state.tags,
      this.state.shippingPrice
    );
    this.handleClose();
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleToggle = event => {
    console.log(event.target.value);
  };

  render() {
    return (
      <div>
        <Button
          onClick={this.handleOpen}
          variant="outlined"
          className="edit-btn"
        >
          Edit Product
        </Button>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.open}
          onClose={this.handleClose}
          id="edit-modal"
        >
          <Paper id="modal-inner">
            <h2 className="edit-heading">Edit Product</h2>
            <TextField
              id="new-name"
              label="Rename Product"
              placeholder={this.props.name}
              value={this.state.productName}
              onChange={this.handleChangeInput("productName")}
              margin="normal"
              variant="filled"
            />
            <br />
            <TextField
              id="new-shipping"
              type="Number"
              label="Set New Shipping Price"
              placeholder={this.props.shippingPrice}
              value={this.state.shippingPrice}
              onChange={this.handleChangeInput("shippingPrice")}
              margin="normal"
              variant="filled"
            />
            <form className="add-tags-form" onSubmit={this.addTag}>
              <TextField
                error={this.state.missingTag}
                id="tag-name"
                label="Enter Tags *Optional"
                helperText="Press 'enter' to add"
                value={this.state.currentTagName}
                onChange={this.handleChangeInput("currentTagName")}
                margin="normal"
                variant="filled"
              />
            </form>
            <ul className="tags-wrapper">
              {this.state.tags &&
                this.state.tags.map(tag => {
                  return (
                    <Tag
                      key={tag}
                      tagName={tag}
                      iconClick={() => this.deleteTag(tag)}
                      closeBtn="true"
                    />
                  );
                })}
            </ul>
            {/* <button onClick={() => this.handleSubmit()}>Update Product</button> */}
            <Button
              variant="contained"
              color="primary"
              type="submit"
              onClick={() => this.handleSubmit()}
            >
              Edit Product
            </Button>
          </Paper>
        </Modal>
      </div>
    );
  }
}

export default Edit;
