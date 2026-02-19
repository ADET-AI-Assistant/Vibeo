import React from 'react';
import './styles.css';

const Skeleton = ({ className = '', style = {} }) => {
    return (
        <div className={`skeleton ${className}`} style={style} />
    );
};

export default Skeleton;
