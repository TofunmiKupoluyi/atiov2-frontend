
import React, { Component } from 'react';
import {FlatList, StyleSheet, Text, View, StatusBar, Image, TouchableHighlight } from 'react-native';
import { Card, ListItem, Button } from 'react-native-elements'

const Styles = StyleSheet.create({
  navBarStyle: {
    paddingTop: 22, 
    height: 70, 
    backgroundColor: 'whitesmoke', 
    flex:0, 
    flexDirection:'row', 
    alignItems:'center', 
    justifyContent: 'space-between',
    borderBottomWidth:1,
    borderBottomColor: 'gainsboro'
  },
  imageSectionStyle: {
    height:200, 
    flexDirection:"row", 
    justifyContent:"center",
    borderBottomWidth:1,
    borderBottomColor:'gainsboro',
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    overflow:'hidden'
    
  },
  imageStyle: {
    flex:1,  
    
  }

})

class Networking{

  static getPublicRants(){
    return fetch('https://atio-v2.herokuapp.com/rant/getPublicRants')
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      console.error(error);
    });
  }

}

export default class DisplayComponent extends Component {
    constructor(props){
      super(props);
      this.state = {rants: [], isLoading: true}
    }

    generateTime(timeStamp) {
        var now = new Date(),
          secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
        if(secondsPast < 60){
          return parseInt(secondsPast) + 's';
        }
        if(secondsPast < 3600){
          return parseInt(secondsPast/60) + 'm';
        }
        if(secondsPast <= 86400){
          return parseInt(secondsPast/3600) + 'h';
        }
        if(secondsPast > 86400){
            day = timeStamp.getDate();
            month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ","");
            year = timeStamp.getFullYear() == now.getFullYear() ? "" :  " "+timeStamp.getFullYear();
            return day + " " + month + year;
        }
    }

    componentDidMount(){
      Networking.getPublicRants()
      .then((response) =>{
        this.setState((previousState) => {return {rants: response.res, isLoading: false}}); 
      })
      .catch((err)=>{
        console.log(err);
      });
    }
    render() {
      if(!this.state.isLoading){
        return ( 
          <View style = {{flex: 1}}>
            <StatusBar backgroundColor="skyblue" barStyle="default" />
            <View style = {Styles.navBarStyle} >
              <TouchableHighlight onPress={this._onPressButton} style={{padding:20}}>
                <Image
                  style={{width:25, height:25, tintColor:"darkgray"}}
                  source={require('./image_assets/notes_image.png')}
                />
              </TouchableHighlight>
              {/* <Text style={{fontWeight:'bold',  fontSize:18}}>Home</Text> */}
              <TouchableHighlight onPress={this._onPressButton} style={{padding:20}}>
                <Image
                  style={{width:23, height:22, tintColor:"darkgray"}}
                  source={require('./image_assets/message_image.png')}
                />
              </TouchableHighlight>
            </View>
            <FlatList
              data = {this.state.rants}
              keyExtractor= {item => item.rant_id}
              renderItem = {(obj) => {
                if(obj.item.image_url){
                  return(
                    <View style={{flex:1, flexDirection:"column", borderWidth: 1, borderColor: 'gainsboro', margin:10, borderRadius:10}}>
                      {/* <View style={{flex:2, padding:2, flexDirection:"row", justifyContent:'center', borderRightWidth:1, borderRightColor: 'gainsboro', backgroundColor:"linen" }}>
                        <Text style = {{fontWeight:'bold'}}></Text>
                      </View> */}
                      <View style={Styles.imageSectionStyle}>
                          <Image style={Styles.imageStyle} source ={{uri: obj.item.image_url}}></Image>
                          {/* <View></View> */}
                      </View>
                      <View style={{flex:10, paddingTop:10, paddingBottom:10}}>
                        <View style = {{flexDirection:'row', justifyContent:"space-between", padding:5, paddingLeft:15}}>
                          <View style={{flexDirection:"row"}}>
                            <Text style={{fontWeight: "bold"}}>{obj.item.pseudonym}</Text>
                            <Text style={{color:'darkgray'}}> . {this.generateTime(new Date(obj.item.rant_date))}</Text>
                          </View>
                          <TouchableHighlight onPress={this._onPressButton} style={{paddingRight:10}}>
                            <Image
                              style={{width:20, height:20, tintColor:"darkgray"}}
                              source={require('./image_assets/heart_image.png')}
                            />
                          </TouchableHighlight>
                        </View>
                        <View style = {{flexDirection:'row', padding:5, paddingLeft:15, marginRight:15 }}>
                          <Text>{obj.item.rant_content}</Text>
                        </View>
                        
                        
                      </View>
                    </View>
                  )
                }
                else{
                  return(
                    <View style={{flex:1, flexDirection:"column", borderWidth: 1, borderColor: 'gainsboro', margin:10, borderRadius:10}}>
                      <View style={{flex:10, paddingTop:10, paddingBottom:10}}>
                        <View style = {{flexDirection:'row', justifyContent:"space-between", padding:5, paddingLeft:15}}>
                          <View style={{flexDirection:"row"}}>
                            <Text style={{fontWeight: "bold"}}>{obj.item.pseudonym}</Text>
                            <Text style={{color:'darkgray'}}> . {this.generateTime(new Date(obj.item.rant_date))}</Text>
                          </View>
                          <TouchableHighlight onPress={this._onPressButton} style={{paddingRight:10}}>
                            <Image
                              style={{width:20, height:20, tintColor:"darkgray"}}
                              source={require('./image_assets/heart_image.png')}
                            />
                          </TouchableHighlight>
                        </View>
                        <View style = {{flexDirection:'row', padding:5, paddingLeft:15, marginRight:15 }}>
                          <Text>{obj.item.rant_content}</Text>
                        </View>
                        {/* <Text style={{padding:5, paddingLeft:15, color:'darkgray'}}>{this.generateTime(new Date(obj.item.rant_date))}</Text> */}
                        
                        
                      </View>
                    </View>
                  )
                }
            }}
            />
            <View style={{height:42, borderTopWidth:1, borderTopColor: 'gainsboro', backgroundColor: 'whitesmoke', flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:20}}>
              <TouchableHighlight onPress={this._onPressButton} style={{padding:20}}>
                <Image
                  style={{width:22, height:22, tintColor:"black"}}
                  source={require('./image_assets/home_image.png')}
                />
              </TouchableHighlight>
              <TouchableHighlight onPress={this._onPressButton} style={{padding:20}}>
                <Image
                  style={{width:22, height:22, tintColor:"darkgray"}}
                  source={require('./image_assets/download_image.png')}
                />
              </TouchableHighlight>
              <TouchableHighlight onPress={this._onPressButton} style={{padding:20}}>
                <Image
                  style={{width:25, height:25, tintColor:"darkgray"}}
                  source={require('./image_assets/settings_image.png')}
                />
              </TouchableHighlight>

            </View>
          </View>
        );
      }
      else{
        return(<View></View>);
      }
    }
  
}
