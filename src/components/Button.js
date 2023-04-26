import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";

const Button = ({ text, accept, onPress }) => {
  return (
    <TouchableOpacity
      style={{ ...styles.button, backgroundColor: accept ? "green" : "red" }}
      onPress={onPress}
    >
      <Text>{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 100,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    zIndex: 10,
    marginHorizontal: 20,
  },
});
