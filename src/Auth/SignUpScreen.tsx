import { Button, TextInput } from '@react-native-material/core'
import React, { useState } from 'react'
import { Linking, StyleSheet, Text, View } from 'react-native'
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { Colors, fontSizes } from '../Constants'

export default function SignUpScreen({ navigation }) {
  const auth = getAuth()

  const [signUp, setSignUp] = useState({
    email: '',
    password: '',
    error: ''
  })

  function onSignUp() {
    if (signUp.email === '' || signUp.password === '') {
      setSignUp({
        ...signUp,
        error: 'Email and password are required'
      })
      return
    }

    createUserWithEmailAndPassword(auth, signUp.email, signUp.password)
      .then(() => sendEmailVerification(auth.currentUser))
      // should i even have this 'then'? this authenticates them and
      // sends them right to the Roadmap so idk
      .then(() => navigation.navigate('Sign In'))
      .catch(error => { setSignUp({ ...signUp, error: error.message }) })
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontFamily: 'Roboto_400Regular', fontSize: fontSizes.m, marginBottom: 16 }}>Sign Up</Text>

      {!!signUp.error && <View><Text style={{ fontFamily: 'Roboto_400Regular' }}>{signUp.error}</Text></View>}

      <View>
        <TextInput
          label='Email'
          variant='outlined'
          value={signUp.email}
          onChangeText={(email) => { setSignUp({ ...signUp, email }) }}
          style={{ marginBottom: 12 }}
          autoComplete='email'
          inputMode='email'
          autoCapitalize='none'
          color={Colors.background}
        />
        <TextInput
          label='Password'
          variant='outlined'
          value={signUp.password}
          onChangeText={(password) => { setSignUp({ ...signUp, password }) }}
          style={{ marginBottom: 16 }}
          secureTextEntry
          autoComplete='new-password'
          color={Colors.background}
        />

        <Text style={{ fontFamily: 'Roboto_400Regular', fontSize: fontSizes.xxs, lineHeight: 20, letterSpacing: .25, marginBottom: 16 }}>By signing up you agree to the {''}
          <Text
            onPress={() => Linking.openURL('https://www.gradeness.app/privacy-policy')}
            style={{ textDecorationLine: 'underline' }}>privacy policy</Text>
        </Text>
        {/* todo: replace all react-native-material shit, this is silly. */}
        <Button color={Colors.highlight2} style={{ marginTop: 8 }} title="Sign up" onPress={onSignUp} />
        <Text style={{ marginTop: 24, alignSelf: 'center' }}>Already have an account? {''}
          <Text onPress={() => navigation.navigate("Sign In")} style={{ textDecorationLine: 'underline' }}>Sign in</Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginTop: 96,
    padding: 16
  }
})
