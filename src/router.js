import React from 'react'
import { Router, Route, Switch } from 'dva/router'
import Test from './routes/Test'

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={Test} />
      </Switch>
    </Router>
  )
}

export default RouterConfig
