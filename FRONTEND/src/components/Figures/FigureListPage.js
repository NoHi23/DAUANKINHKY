import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './FigurePage.css';

const FigureListPage = () => {
    const [figures, setFigures] = useState([]);
    useEffect(() => {
        api.get('/figures').then(res => setFigures(res.data));
    }, []);

    return (
        <div className="figure-list-container">
            <h1>Dòng thời gian Ký Ức</h1>
            <div className="figure-grid">
                {figures.map(figure => (
                    <Link to={`/figures/${figure._id}`} key={figure._id} className="figure-card">
                        <img src={figure.mainImage} alt={figure.name}/>
                        <div className="figure-card-info">
                            <h3>{figure.name}</h3>
                            <p>{figure.period}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default FigureListPage;