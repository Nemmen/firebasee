import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ToastAndroid , ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const snapshot = await firestore().collection('users').get();
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
      console.log('Documents retrieved successfully:', usersData);
    } catch (error) {
      console.error('Error getting documents:', error);
    }
  };

  // Check if user is signed in and update state
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log('User is signed in:', currentUser.email);
      } else {
        console.log('No user signed in');
      }
    });



    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const user = {
      name: email.split('@')[0] ,
      email: email,
      
    };
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      // Sign in success, update UI with the signed-in user's information
      console.log('signInWithEmail:success');
      try {
        // Add a new document with a generated ID
        const documentReference = await firestore().collection('users').add(user);
        console.log('DocumentSnapshot added with ID: ', documentReference.id);
        Alert.alert('Success', `DocumentSnapshot added with ID: ${documentReference.id}`);
      } catch (e) {
        console.error('Error adding document: ', e);
        Alert.alert('Error', 'Error adding document');
      }
      setUser(userCredential.user);
      setError('');
    } catch (e) {
      // If sign in fails, display a message to the user.
      console.warn('signInWithEmail:failure', e);
      ToastAndroid.show('Authentication failed.', ToastAndroid.SHORT);
      setError('Authentication failed.');
      setUser(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
      setUser(null); // Update state after sign out
      console.log('User signed out');
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  return (
    <View className="flex-1 justify-center p-[50]">
      {user ? (
        <View>
          <Text className="text-xl mt-3">Welcome, {user.email}</Text>
          <Button title="Sign Out" onPress={handleSignOut} />
        </View>
      ) : (
        <View>
          <TextInput
            placeholder="Email"

            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            className="mb-3 p-2 border-2 border-black rounded-md"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="mb-3 p-2 border-2 border-black rounded-md"
          />
          <Button title="Sign In" onPress={handleSignIn} />
          {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}
        </View>
      )}
      <View className="mt-3"></View>
      <Button title="Fetch Users" onPress={fetchUsers} />
      <ScrollView>
        {users.map(user => (
          <View key={user.id} >
            <Text>ID: {user.id}</Text>
            <Text>Name: {user.name}</Text>
            <Text>email: {user.email}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default App;
