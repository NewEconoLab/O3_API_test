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
    pk: '',
    txHex: '',
    sign: '',
    loading: false,
    disabled: false
  }
  componentDidMount() {
    o3.init(response => this.callbackHandler2(response))
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
          addrFrom: response.data.accounts[0].neo.address,
          pk: response.data.accounts[0].neo.publicKey
        })
      } else if (response.command === 'requestToSign') {
        if (!response.data) {
          return false
        }
        this.setState(
          {
            sign: response.data.signatureData
          },
          _ => {
            let { txHex, sign, pk } = this.state
            this.sendtxplussign(txHex, sign, pk)
          }
        )
      }
    }
  }
  sendtxplussign = (txHex, sign, pk) => {
    let api = 'https://api.nel.group/api/testnet'
    let postdata = this.makeRpcPostBody('sendtxplussign', txHex, sign, pk)
    fetch(api, {
      method: 'post',
      body: JSON.stringify(postdata)
    }).then(result => {
      result.json().then(r => {
        this.setState({
          TXID: JSON.stringify(r)
        })
      })
    })
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
    let body = {}
    body['jsonrpc'] = '2.0'
    body['id'] = 1
    body['method'] = method
    let params = []
    for (let i = 0; i < _params.length; i++) {
      params.push(_params[i])
    }
    body['params'] = params
    return body
  }
  gettransfertxhex = (from, to, assetID, amount) => {
    let api = 'https://api.nel.group/api/testnet'
    let postdata = this.makeRpcPostBody(
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
        this.setState({
          txHex: r.result[0].transfertxhex
        })
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
          {['txHex', 'sign', 'TXID'].map(key => {
            return (
              <InputItem
                value={this.state[key]}
                id="addrFrom"
                editable={false}
                placeholder={key}
              >
                {key}
              </InputItem>
            )
          })}
        </List>

        <WingBlank style={{ marginTop: '15px' }}>
          <Button
            loading={this.state.loading}
            disabled={this.state.disabled}
            onClick={this.handleSubmit}
            type="primary"
          >
            {this.state.loading ? '转账中' : '点击转账'}
          </Button>
        </WingBlank>
      </div>
    )
  }
}

export default connect()(App)
