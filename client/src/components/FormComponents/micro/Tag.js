import React, { Component } from 'react';
import '../../../App.css';

const Tag = (props) => {
    return (
        <li key={props.tagName}>{props.tagName} {props.closeBtn === "true" && <i className="material-icons" onClick={() => props.iconClick(props.tagName)}>cancel</i>}</li>
    )
}

export default Tag;