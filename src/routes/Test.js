import React from 'react'
import { connect } from 'dva'
import fetch from 'dva/fetch'
import { List, InputItem, WingBlank, Button, Toast } from 'antd-mobile'
import o3 from '../utils/o3'
class App extends React.Component {
  state = {
    addrFrom: '',
    addrTo: 'AeaWf2v7MHGpzxH4TtBAu5kJRp5mRq2DQG',
    number: '0.01',
    loading: false,
    disabled: false
  }
  componentWillMount() {
    o3.init(_ => this.callbackHandler2())
  }
  callbackHandler2(response) {
    if (response == null) {
      this.setState({ loading: false, disabled: false })
      Toast.info('需要在O3钱包中操作', 1.5)
    } else {
      if (response.command === 'init') {
        o3.requestToConnect()
      } else if (response.command === 'requestToConnect') {
        o3.getAccounts()
      } else if (response.command === 'getAccounts') {
        this.setState({
          addrFrom: response.data.accounts[0].neo.address
        })
      }
    }
  }
  /**
   * @methods 转账
   */
  handleSubmit = e => {
    this.setState({ loading: true, disabled: true })
    this.gettransfertxhex(
      this.state.addrFrom,
      this.state.addrTo,
      '0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7',
      this.state.number
    )
  }
  makeRpcPostBody = (method, ..._params) => {
    var body = {}
    body['jsonrpc'] = '2.0'
    body['id'] = 1
    body['method'] = method
    var params = []
    for (var i = 0; i < _params.length; i++) {
      params.push(_params[i])
    }
    body['params'] = params
    return body
  }
  gettransfertxhex = (from, to, assetID, amount) => {
    var api = 'https://api.nel.group/api/testnet'
    var postdata = this.makeRpcPostBody(
      'gettransfertxhex',
      from,
      to,
      assetID,
      amount
    )
    fetch(api, {
      method: 'post',
      body: JSON.stringify(postdata)
    }).then(result => {
      result.json().then(r => {
        this.requestToSignRawTransaction(r.result[0].transfertxhex)
      })
    })
  }
  requestToSignRawTransaction = raw => {
    o3.requestToSignRawTransaction(raw)
    this.setState({ loading: false, disabled: false })
  }
  /**
   * @methods 改变转账地址
   */
  addrToChange(addrTo) {
    this.setState({ addrTo })
  }
  /**
   * @methods 改变转账数量
   */
  numberChange(number) {
    let splitVal = number.split('.')
    if (splitVal[1]) {
      number = `${splitVal[0]}.${splitVal[1]}`
    } else if (number.indexOf('.') > -1) {
      number = `${splitVal[0]}.`
    }
    this.setState({ number })
  }
  render() {
    return (
      <div>
        <List renderHeader={() => '转账测试'}>
          <InputItem
            value={this.state.addrFrom}
            id="addrFrom"
            editable={false}
            placeholder="您的钱包地址"
          >
            钱包地址
          </InputItem>
          <InputItem
            value={this.state.addrTo}
            onChange={val => this.addrToChange(val)}
            id="addrTo"
            clear
            placeholder="请输入转出地址"
          >
            转出地址
          </InputItem>
          <InputItem
            value={this.state.number}
            onChange={val => this.numberChange(val)}
            id="number"
            clear
            type="money"
            placeholder="请输入转账数量"
          >
            转账数量
          </InputItem>
        </List>
        <WingBlank style={{ marginTop: '15px' }}>
          <Button
            loading={this.state.loading}
            disabled={this.state.disabled}
            onClick={this.handleSubmit}
            type="primary"
          >
            点击转账
          </Button>
        </WingBlank>
      </div>
    )
  }
}

export default connect()(App)