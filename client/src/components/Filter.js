import React, { Component } from 'react';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import '../App.css';


class Filter extends React.Component {
    state = {
        open: false
    }

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    handleToggle = (event) => {
        console.log(event.target.value)
    }

    render() {

        if(this.props.list){
        let tagList = [];
        const list = Object.keys(this.props.list).map(key => {
            let tags = this.props.list[key].tags;
            tags && tags.map(tag => {
                if (tagList.includes(tag) == false) {
                    tagList.push(tag);
                }
            })
        }) 

        return (
            <div>
                <Button onClick={this.handleOpen} variant="outlined" className="filter-btn">Filter by Tag {this.props.filterBy.length == 0 ? '' : '(' + this.props.filterBy.length + ')'}</Button>
                <Modal
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                    open={this.state.open}
                    onClose={this.handleClose}
                    id="filter-modal"
                >
                    <Paper id="modal-inner">
                        <h2 className="filters-heading">Filter By Tag</h2>
                        <p className="filters-subtitle">By clicking the tags below you will filter the products to only display products with the tags you have selected. If you leave all of the tags unchecked, all products will display.</p>
                        <List>
                            {tagList.map(tag => {
                                const filterList = this.props.filterBy;
                                let checkedStatus = filterList.includes(tag);
                                return <ListItem className="filter-item" key={tag}> <Checkbox tabIndex={-1} id={tag} checked={checkedStatus} onClick={() => this.props.editFilters({ tag })} /><ListItemText primary={tag} className="pointer filter-text" onClick={() => this.props.editFilters({ tag })} /></ListItem>
                            })}
                        </List>
                    </Paper>
                </Modal>
            </div>
        )
        } else {
            return null;
        }
    }
}

export default Filter;