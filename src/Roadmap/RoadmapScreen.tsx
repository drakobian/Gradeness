import { Dimensions, FlatList, Image, Platform, Pressable, View } from 'react-native'
import { Colors, GradeLevels, fontSizes } from '../Constants'
import { getAuth } from 'firebase/auth'
import { getColorForYear } from '../utils/style'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { type RoadmapStackParamList } from '../navigation/userStackParams'
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { Drawer } from 'react-native-drawer-layout'
import { Button, Dialog, DialogActions, DialogContent, DialogHeader, Icon, IconButton } from '@react-native-material/core'
import * as Linking from 'expo-linking';
import Toast from 'react-native-toast-message'
import { useAuthentication } from '../utils/hooks/useAuthentication'
import * as Clipboard from 'expo-clipboard'
import { Text } from '../Typography'
import { useFocusEffect } from '@react-navigation/native'
import { collection, getCountFromServer, getFirestore, query, where } from 'firebase/firestore'

const roadmapGradeLevels = GradeLevels

type Props = NativeStackScreenProps<RoadmapStackParamList, 'RoadmapHome'>
export const RoadmapScreen = ({ navigation }: Props) => {
  const auth = getAuth()
  const { user } = useAuthentication()
  const [toastHidden, setToastHidden] = useState(false);
  const db = getFirestore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);

  const cardMargin = 16;
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;
  const cardWidth = (windowWidth - cardMargin * 3) / 2;
  const cardHeight = cardWidth;

  useEffect(useCallback(() => {
    if (!toastHidden && user) {
      if (!user.emailVerified) {
        Toast.show({
          type: 'success',
          text1: 'Thanks for signing up!',
          text2: 'We sent you a verification email.',
          swipeable: true,
          autoHide: true,
          visibilityTime: 10000,
          topOffset: 75,
          onHide: () => setToastHidden(true)
        });
      }
    }
  }, [user, toastHidden]));

  const DeleteAccountDialog = () => {
    return (
      <Dialog
        visible={deleteAccountDialogOpen} onDismiss={() => setDeleteAccountDialogOpen(false)}
      >
        <DialogHeader title="Delete your account?" />
        <DialogContent>
          <Text size='xs'>
            You can delete your account with Gradeness but you will lose all of your information. Account deletion will take place in 2-3 business days.
          </Text>
        </DialogContent>
        <DialogActions>
          <Button
            title="Cancel"
            variant='text'
            onPress={() => setDeleteAccountDialogOpen(false)}
          />
          <Button
            title="Delete"
            variant='text'
            onPress={() => {
              setDeleteAccountDialogOpen(false);
              auth.signOut();
              Linking.openURL('https://www.gradeness.app/delete-account');
            }}
          />
        </DialogActions>
      </Dialog>
    )
  }

  const DrawerItem = ({ onPress, iconName, text, subtext, lastItem = false }) => {
    return (
      <Pressable style={{ marginBottom: lastItem ? 0 : 24 }} onPress={onPress}>
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <Icon size={24} name={iconName} color={Colors.background} />
          <View style={{ marginHorizontal: 16 }}>
            <Text color='background' style={{ marginBottom: 8 }}>{text}</Text>
            {subtext ? <Text weight='light' size='xxs' color='background' style={{ lineHeight: 20 }}>{subtext}</Text> : <></>}
          </View>
        </View>
      </Pressable>
    );
  }

  const DrawerContent = () => {
    return (
      <View style={{ display: 'flex', height: '80%', justifyContent: 'space-between', marginTop: windowHeight / 10, marginHorizontal: 24 }}>
        <View>
          <View>
            <Image source={require('../../assets/slideoutowl.png')} style={{ marginBottom: 36 }} />
            <DrawerItem onPress={() => auth.signOut()} iconName={'logout'} text={'Log out'} subtext={''} />
            <DrawerItem onPress={() => Linking.openURL('https://forms.gle/q6TfiTnTqLYZwZAY8')} iconName={'message-outline'} text={'Give feedback'} subtext={'Your feedback is valuable to us. Click here to respond to our survey and help us improve the app.'} />
            <DrawerItem onPress={() => Linking.openURL('https://www.youtube.com/watch?v=x89dP_hjT1k')} iconName={'video-outline'} text={'Tutorial'} subtext={'Watch on YouTube'} />
            <DrawerItem onPress={() => { }} iconName={'email-outline'} text={'Need help?'} subtext={'Contact us at support@gradeness.app'} />
            <DrawerItem onPress={() => {
              Clipboard.setStringAsync('https://www.gradeness.app/')
                .then(() => Toast.show({ type: 'success', text1: 'Copied!', position: 'bottom', bottomOffset: 300, swipeable: true }));
            }} iconName={'share-variant-outline'} text={'Share with a friend'} subtext={'Enjoying the app? Share with a friend.'} />
          </View>
        </View>
        <DrawerItem lastItem onPress={() => setDeleteAccountDialogOpen(true)} iconName={'delete-outline'} text={'Delete your account'} subtext={'Account deletion will take place in 2-3 business days.'} />
      </View>
    )
  }

  const RoadmapCard = ({ year, name, objective }) => {
    const [numberOfActivities, setNumberOfActivities] = useState(0);
    const [loadingActivities, setLoadingActivities] = useState(true);
    useFocusEffect(
      useCallback(() => {
        const fetchData = async () => {
          if (user) {
            const q = query(collection(db, 'activities'),
              where('userId', '==', user.uid),
              where('year', '==', year));
            const snapshot = await getCountFromServer(q);
            setNumberOfActivities(snapshot.data().count);
            setLoadingActivities(false);
          }
        }

        fetchData().catch(console.error)
      }, [user])
    )

    return (
      <Pressable
        onPress={() => { navigation.navigate('GradeLevel', { year }) }}
      >
        <LinearGradient
          colors={[getColorForYear(year, true), getColorForYear(year)]}
          style={{ width: cardWidth, height: cardHeight, margin: 4, borderRadius: 8 }}
        >
          <View style={{ display: 'flex', margin: 16, height: '88%', justifyContent: 'space-between' }}>
            <View>
              <Text weight='medium'>{name}</Text>
              <Text size='xs' style={{ marginTop: 8 }}>{objective}</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: getColorForYear(year), fontSize: 8, marginTop: 10 }} >{'\u2B24  '}</Text>
                <Text size='xxs' style={{ marginTop: 8 }}>
                  {loadingActivities ? 'Loading your ' : numberOfActivities === 0 ? 'Creating your ' : numberOfActivities + ' '}activities
                </Text>
              </View>
            </View>
            <Text weight='light' size='xxl' style={{ alignSelf: 'flex-end', opacity: 0.7 }}>{year}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    )
  }

  return (
    <LinearGradient
      style={{ height: '100%' }}
      colors={[Colors.background, '#2a354c']}>
      <Drawer
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        renderDrawerContent={DrawerContent}
        drawerType={Platform.OS === 'android' ? 'slide' : 'front'}
        // todo: known bug using drawerPosition Right in android: https://github.com/react-navigation/react-navigation/issues/11853
        // drawerPosition='right'
        drawerStyle={{ backgroundColor: '#E9ECF2', width: '90%', borderRadius: 16 }}
        hideStatusBarOnOpen={true}
      >
        <DeleteAccountDialog />
        <View
          style={{ marginHorizontal: 16, marginVertical: windowHeight / 50 }}>
          <StatusBar backgroundColor={Colors.background} style="light" />
          <IconButton
            style={{ marginTop: windowHeight / 10, marginBottom: 16, marginLeft: -12 }}
            onPress={() => setDrawerOpen(true)}
            icon={<Icon size={24} color={Colors.text} name="menu" />}
          />
          <Text size='l'>Welcome</Text>
          <Text style={{ marginTop: 24 }}>
            Gradeness is designed to simplify the high school process by providing a
            roadmap of time sensitive activities to prepare you for your future and a
            place to capture your accomplishments.
          </Text>
          <View>
            <FlatList
              data={roadmapGradeLevels}
              renderItem={({ item: { year, name, objective } }) => (
                <RoadmapCard {...{ year, name, objective }} />
              )}
              numColumns={2}
              style={{ marginTop: 24, alignSelf: 'center' }}
            />
          </View>
        </View>
      </Drawer>
    </LinearGradient >
  )
}
