import firebase from "firebase/compat/app"
import "firebase/compat/auth"
import "firebase/compat/firestore"
import "firebase/compat/storage"

const firebaseConfig = {
    apiKey: "AIzaSyAZrWo69UZBgqitSeC6qELqqJNVBWXpgm0",
    authDomain: "finneo-131b9.firebaseapp.com",
    projectId: "finneo-131b9",
    storageBucket: "finneo-131b9.appspot.com",
    messagingSenderId: "107259586417",
    appId: "1:107259586417:web:9fc923f1d782c6fe4df8d0",
}

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
}

export const auth = firebase.auth()
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider()

export const firestore = firebase.firestore()
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp
export const fromMillis = firebase.firestore.Timestamp.fromMillis

export const storage = firebase.storage()
export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED

export function toJSON(doc) {
    const data = doc.data()
    return {
        ...data,
        // Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
        createdAt: data?.createdAt.toMillis() || 0,
        id: doc.id,
    }
}
