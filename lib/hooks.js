import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, firestore } from "../lib/firebase"

// Custom hook to read  auth record and user profile doc
export function useUserData() {
    const [user] = useAuthState(auth)
    const [username, setUsername] = useState(null)
    const [profilePicture, setProfilePicture] = useState(null)

    useEffect(() => {
        // turn off realtime subscription
        let unsubscribe

        if (user) {
            const ref = firestore.collection("users").doc(user.uid)
            unsubscribe = ref.onSnapshot((doc) => {
                setUsername(doc.data()?.username)
                setProfilePicture(doc.data()?.photoURL)
            })
        } else {
            setUsername(null)
            setProfilePicture(null)
        }

        return unsubscribe
    }, [user])

    return { user, username, profilePicture }
}

export function useWindowDimensions() {
    const hasWindow = typeof window !== "undefined"

    function getWindowDimensions() {
        const width = hasWindow ? window.innerWidth : null
        const height = hasWindow ? window.innerHeight : null
        return {
            width,
            height,
        }
    }

    const [windowDimensions, setWindowDimensions] = useState(
        getWindowDimensions()
    )

    useEffect(() => {
        if (hasWindow) {
            function handleResize() {
                setWindowDimensions(getWindowDimensions())
            }

            window.addEventListener("resize", handleResize)
            return () => window.removeEventListener("resize", handleResize)
        }
    }, [hasWindow])

    return windowDimensions
}
