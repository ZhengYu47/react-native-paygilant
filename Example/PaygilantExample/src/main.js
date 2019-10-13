import React, { Component } from 'react'
import { TouchableHighlight, Text, View, TextInput, Platform, StyleSheet, AppState } from 'react-native'
import Paygilant from 'react-native-paygilant'
import { NativeEventEmitter, NativeModules } from 'react-native';

import { getJsonFromCheckPoint, getNewCheckPoint } from './components/CheckPoint'

export default class MainScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userId: this.props.navigation.state.params.userId,
            appState: AppState.currentState,
            paygilantListenerID: 100,
            requestID: null,
        }
        Paygilant.getScreenListner(Paygilant.ScreenListenerType.SCREEN_MAIN, this.state.paygilantListenerID,
            (id) => {
                console.log("startNewScreenListener success");
            },
            error => {
                console.log(error);
            })
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);

        // receive event from native code for getRiskForCheckPoint
        const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample)
        eventEmitter.addListener('RiskforCheckPointEvent', (event) => {
            var riskLevel = event.riskLevel
            var signedRisk = event.signedRisk
            var requestId = event.requestId

            alert("Receive event from " + requestId + ": riskLevel=" + riskLevel + ", signedRisk=" + signedRisk)
        })
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!');
            if (Platform.OS === "android") {
                Paygilant.resumeListen(this.state.paygilantListenerID)
            }
        } else {//if (this.state.appState.match(/active/) && (nextAppState === 'inactive' || nextAppState === 'background')) {
            console.log('App has come to the background!');
            if (Platform.OS === "android") {
                Paygilant.pauseListenToSensors(this.state.paygilantListenerID)
            }
        }
        this.setState({ appState: nextAppState });
    };


    sendMoney() {
        var checkpoint = getNewCheckPoint()
        checkpoint.transactionType = Paygilant.TransactionType.PURCHASE
        checkpoint.timeStamp = new Date().getTime()
        checkpoint.curType = Paygilant.CurrencyCode.USD
        checkpoint.userID = this.state.userId
        checkpoint.amount = 50
        checkpoint.destinationId = "DestinationID_1"
        checkpoint.paymentMethod = "CreditCardISRACRAD_8794"

        // alert(getJsonFromCheckPoint(checkpoint))
        Paygilant.getRiskForCheckPoint(getJsonFromCheckPoint(checkpoint), (requestID) => {
            this.setState({ requestID: requestID })
        })
    }

    myshop() {
        var checkpoint = getNewCheckPoint()
        checkpoint.transactionType = Paygilant.TransactionType.PURCHASE
        checkpoint.timeStamp = new Date().getTime()
        checkpoint.curType = Paygilant.CurrencyCode.USD
        checkpoint.userID = this.state.userId
        checkpoint.amount = 100
        checkpoint.destinationId = "DestinationID_2"
        checkpoint.paymentMethod = "CreditCardISRACRAD_8794"

        Paygilant.getRiskForCheckPoint(getJsonFromCheckPoint(checkpoint), (requestID) => {
            this.setState({ requestID: requestID })
            this.props.navigation.push("Myshop", { requestID: requestID })
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableHighlight style={styles.button} onPress={() => this.sendMoney()}>
                    <Text style={{ color: 'white', fontSize: 30 }}>{'Send Money'}</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.button} onPress={() => this.myshop()}>
                    <Text style={{ color: 'white', fontSize: 30 }}>{'My Shop'}</Text>
                </TouchableHighlight>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        width: '60%',
        height: 100,
        backgroundColor: 'gray',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center'
    }
});