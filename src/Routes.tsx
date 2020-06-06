import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';

const Routes = () => {
  return (
    <BrowserRouter>
      <Route component={CreatePoint} path="/create-point" />
      <Route component={Home} exact path="/" />
    </BrowserRouter>
  );
};

export default Routes;
