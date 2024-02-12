import { Button, Icon, IconButton, TextInput } from '@react-native-material/core'
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore'
import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Colors } from "../Constants"
import { useFocusEffect } from '@react-navigation/native'
import { useAuthentication } from '../utils/hooks/useAuthentication'
import { getGradeLevelNameForYear } from '../utils/style'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { type Activity } from '../types/Activity'

type Props = NativeStackScreenProps<UserStackParamList, 'Activity'>
export const ActivityScreen = ({ navigation, route }: Props) => {
  const db = getFirestore()
  const { user } = useAuthentication()
  const { activityId } = route.params
  const [activity, setActivity] = useState<Activity | undefined>()
  const [loadingActivity, setLoadingActivity] = useState(true)

  const toggleComplete = async () => {
    const activityRef = doc(db, 'activities', activityId)
    await updateDoc(activityRef, { complete: !activity.complete })
  }

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (activityId && user) {
          const activity = await getDoc(doc(db, 'activities', activityId))
          // todo: need handling for if there are no activities at all, plus network error handling
          // todo: mapper for firestore data to Activity
          setActivity(activity.data())
          setLoadingActivity(false)
        }
      }

      fetchData().catch(console.error)
    }, [activityId, user])
  )

  return (
    loadingActivity
      ? <Text style={{ fontFamily: 'Roboto_400Regular' }}>Loading</Text>
      :
      <View>
        <View style={{ marginTop: 32, marginBottom: 16 }}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton
              onPress={() => { navigation.pop() }}
              icon={<Icon size={24} color={Colors.text} name="arrow-left" />}
            />
            <IconButton
              onPress={() => { navigation.navigate('CreateUpdateActivity', { activity: { activityId, name: activity.name, semester: activity.semester, year: activity.year, description: activity.description } }) }}
              // todo: need disabled styling...or hide when not enabled hmm
              disabled={!!activity.testActivityId}
              icon={<Icon size={24} color={!!activity.testActivityId ? '#66a' : Colors.text} name="square-edit-outline" />}
            />
          </View>
          <Text style={{ fontFamily: 'Roboto_400Regular', color: Colors.text, fontSize: 24, marginTop: 8, marginLeft: 16 }}>
            {activity.name}
          </Text>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 12, marginTop: 16 }}>
            {/* todo: pull this into a Badge component */}
            <View style={{ backgroundColor: Colors.text, padding: 8, borderRadius: 8, margin: 4 }}>
              <Text style={{ fontFamily: 'Roboto_400Regular' }}>{activity.semester}</Text>
            </View>
            <View style={{ backgroundColor: Colors.text, padding: 8, borderRadius: 8, margin: 4 }}>
              <Text style={{ fontFamily: 'Roboto_400Regular' }}>{getGradeLevelNameForYear(activity.year)}</Text>
            </View>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.container}>
          <View>
            {activity.testActivityId ?
              <><Text style={{ fontFamily: 'Roboto_400Regular' }}>{activity.overview.header}</Text>
                {
                  activity.overview.items.map(item =>
                    <Text key={item}>-- {item}</Text>
                  )
                }</> : <></>
            }
            <Button
              color={Colors.highlight2} tintColor={Colors.background}
              title={activity.complete ? 'Mark as incomplete' : 'Mark as complete'}
              onPress={async () => { await toggleComplete().then(() => { navigation.pop() }) }}
            />

            {
              typeof activity.description === "string" ?
                <Text style={{ fontFamily: 'Roboto_400Regular' }}>{activity.description}</Text>
                : <>
                  <Text style={{ fontFamily: 'Roboto_400Regular' }}>{activity.description.header}</Text>
                  {
                    activity.description.items.map(item =>
                      <Text key={item}>-- {item}</Text>
                    )
                  }
                  <Text style={{ fontFamily: 'Roboto_400Regular' }}>{activity.description.footer}</Text>
                </>
            }
          </View>
        </ScrollView>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    marginVertical: 32,
    paddingBottom: 256,
    padding: 8,
    paddingRight: 16
  }
})
