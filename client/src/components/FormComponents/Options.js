import React, { Component } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Tag from './micro/Tag';
import '../../App.css';

class Options extends React.Component {

  state = {
    UpNotification: false,
    DownNotification: false,
    currentTagName: '',
    currentShipping: 0,
    missingTag: false
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  handleChangeInput = name => event => {
    this.setState({
      [name]: event.target.value,
      missingTag: false
    });
  };

  handleChangeShipping = name => event => {
    this.setState({
      [name]: event.target.value
    }, () => this.props.addShipping(this.state.currentShipping));
  };


  addTag = (event) => {
    event.preventDefault();
    let tag = this.state.currentTagName;
    if (this.state.currentTagName !== '') {
      this.props.addTag(tag);
      this.setState({
        currentTagName: ''
      })
    } else {
      this.setState({
        missingTag: true
      })
    }
  }


  render() {

    const tagError = "Please add a tag first!"

    return (
      <section className="options-wrapper">
        <div className="option-tags">

          <form className="add-tags-form" onSubmit={this.addTag}>
            <TextField error={this.state.missingTag} id="tag-name" label="Enter Tags *Optional" helperText={this.state.missingTag === true ? tagError : "Press 'enter' to add"} value={this.state.currentTagName} onChange={this.handleChangeInput('currentTagName')} margin="normal" variant="filled" />
          </form>
          <ul className="tags-wrapper">
            {this.props.tags && this.props.tags.map((tag) => {
              return <Tag key={tag} tagName={tag} iconClick={this.props.deleteTag} closeBtn="true" />
            })}
          </ul>
        </div>
        <div className="option-shipping">
          <TextField id="filled-number" label="Shipping Price *Optional" onChange={this.handleChangeShipping('currentShipping')} type="number" variant="filled" value={this.state.currentShipping} />
        </div>
        <div className="option-toggles">
          <FormGroup row>
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.UpNotification}
                  onChange={this.handleChange('UpNotification')}
                  value="UpNotification"
                  className="up-switch"
                />
              }
              label="Send me an email if the price of this product goes UP"
            />
            <br />
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.DownNotifcation}
                  onChange={this.handleChange('DownNotification')}
                  value="DownNotifcation"
                  color="primary"
                  className="down-switch"
                />
              }
              label="Send me an email if the price of this product goes DOWN"
            />
          </FormGroup>
        </div>
      </section>
    )
  }


}

export default Options;