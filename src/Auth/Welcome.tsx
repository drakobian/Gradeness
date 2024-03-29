import { Button, Text } from '@react-native-material/core'
import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Colors, fontSizes } from '../Constants'

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} />
      </View>
      <View style={styles.buttons}>
        <Button title="Get started" color={Colors.highlight2} style={styles.button} onPress={() => navigation.navigate('Sign Up')} />
        <Button title="Sign In" color={Colors.text} style={styles.button} onPress={() => navigation.navigate('Sign In')} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  header: {
    alignSelf: 'center',
    marginTop: '50%',

    image: {
      alignSelf: 'center',
    },

    text: {
      fontFamily: 'Roboto_400Regular',
      fontSize: fontSizes.xl,
    }
  },
  buttons: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 16,
    marginHorizontal: 12,
  }
})
