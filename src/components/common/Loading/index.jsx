import React from 'react';
import './styles.css';

const Loading = ({ text = "Loading..." }) => {
    return (
        <div className="loading-center">
            <div className="spinner" />
            <p>{text}</p>
        </div>
    );
};

export default Loading;
