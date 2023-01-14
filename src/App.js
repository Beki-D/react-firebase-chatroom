import { useState } from 'react';
import './App.css';

import {BiSend} from 'react-icons/bi';
import {FcGoogle} from 'react-icons/fc';
import {FiLogOut} from 'react-icons/fi';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useRef } from 'react';

firebase.initializeApp({
  apiKey: "AIzaSyB4fHjJ7R0bWO7M-BmcxfE52CUmaRKdM0c",
  authDomain: "chat-room-4eb05.firebaseapp.com",
  projectId: "chat-room-4eb05",
  storageBucket: "chat-room-4eb05.appspot.com",
  messagingSenderId: "123963457305",
  appId: "1:123963457305:web:3f2039c765bf2859d34f88",
  measurementId: "G-LLZNTT4GR6"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Chatroom</h1>
        <SignOut />
      </header>
      
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}><FcGoogle /> Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out <FiLogOut /> </button>
  )
}

function ChatRoom() {
  const dummy = useRef();//dummy ref for scroll down

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL 
    });

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth'});
  }

  return (
    <>  
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

        <button type='submit' disabled={!formValue}>Send <i><BiSend /></i></button>

      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.multiavatar.com/Binx Bond.png'} alt='user_pic' referrerPolicy='no-referrer' />
      <p>{text}</p>
    </div>  
  ) 
}

export default App;
