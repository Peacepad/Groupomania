import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
    return (
        <div className="navigation">
            <NavLink exact to="/login" activeClassName="nav-active">
                Se connecter
            </NavLink>
            <NavLink exact to="/signup" activeClassName="nav-active">
                S'inscrire
            </NavLink>
        </div>
    );
};

export default Navigation;