import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

export default function AppInput(props: TextInputProps) {
  return <TextInput placeholderTextColor="#999" {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginVertical: 6,
    backgroundColor: '#fff',
  },
});