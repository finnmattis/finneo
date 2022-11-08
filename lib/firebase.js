import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import firebase from "firebase/compat/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyAZrWo69UZBgqitSeC6qELqqJNVBWXpgm0",
    authDomain: "finneo-131b9.firebaseapp.com",
    projectId: "finneo-131b9",
    storageBucket: "finneo-131b9.appspot.com",
    messagingSenderId: "107259586417",
    appId: "1:107259586417:web:9fc923f1d782c6fe4df8d0",
}

firebase.initializeApp(firebaseConfig)
const firebaseApp = initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)
export const googleAuth = new GoogleAuthProvider()

export const firestore = getFirestore(firebaseApp)

export const storage = getStorage(firebaseApp)

export function toJSON(doc) {
    const data = doc.data()
    return {
        ...data,
        // Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
        createdAt: data?.createdAt.toMillis() || 0,
        id: doc.id,
    }
}
