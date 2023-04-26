import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const Fire = () => {
  const [datas, setDatas] = useState([]);
  useEffect(() => {
    const subscriber = firestore()
      .collection('data')
      .onSnapshot(documentSnapshot => {
        let dataList = [];
        documentSnapshot.forEach(data => {
          dataList.push(data._data);
        });
        return setDatas(dataList);
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, []);
  return (
    <View>
      {datas.map(data => {
        return (
          <View key={data.nama}>
            <Text>{data.nama}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default Fire;

const styles = StyleSheet.create({});
