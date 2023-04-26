import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import Button from './Button';

const GettingCall = ({join, hang}) => {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/foto.jpg')} style={styles.image} />
      <View style={styles.bContainer}>
        <Button text="accept" accept onPress={join} />
        <Button text="reject" onPress={hang} />
      </View>
    </View>
  );
};

export default GettingCall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  bContainer: {
    flexDirection: 'row',
    bottom: 30,
  },
});
