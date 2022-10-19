import debounce from "lodash.debounce"
import Image from "next/image"
import { useCallback, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import Button from "../Components/Button"
import Input from "../Components/Input"
import { UserContext } from "../lib/context"
import { auth, firestore, googleAuthProvider, storage } from "../lib/firebase"
import styles from "../styles/Enter.module.css"


function ChoosePicture() {
    const { user } = useContext(UserContext)
    //Need to set this after username because update needs document to exist
    if (user.photoURL) {
        firestore
            .collection('users')
            .doc(auth.currentUser.uid)
            .update({ photoURL: user.photoURL });
    }

    const [profilePic, setProfilePic] = useState(null)
    const [viewPic, setViewPic] = useState(null)


    useEffect(() => {
        if (profilePic) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setViewPic(reader.result)
            }
            reader.readAsDataURL(profilePic[0])
        } else {
            setViewPic(null)
        }
    }, [profilePic])

    const uploadFile = async () => {
        const file = Array.from(profilePic)[0];
        const extension = file.type.split('/')[1];

        const ref = storage.ref(`uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`);
        const task = ref.put(file);

        // Get downloadURL AFTER task resolves (Note: this is not a native Promise)
        task
            .then((d) => ref.getDownloadURL())
            .then((url) => {
                firestore
                    .collection('users')
                    .doc(auth.currentUser.uid)
                    .update({ photoURL: url });
                toast.success("Success!")
            });
    };

    return (
        <>
            <span className={styles.title}>Choose Picture</span>
            <div className={styles["upload-container"]}>
                <label htmlFor="file-upload" className={styles.upload}>Choose File</label>
            </div>
            <input
                id="file-upload"
                className={styles.hidden}
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => { setProfilePic(e.target.files) }}
            />
            <span>Preview:</span>
            <div className={styles["profile-preview"]}>
                <Image src={viewPic || "/user.png"} width="200px" height="200px"></Image>
            </div>
            <Button
                name="Submit"
                func={uploadFile}
                disabled={!profilePic}
            />
        </>
    )
}

function ChooseUsername() {
    const { user } = useContext(UserContext)

    const [username, SetUsername] = useState("")
    const [isValid, setIsValid] = useState(false)
    const [loading, setLoading] = useState(false)

    const write_to_db = async () => {
        const userDoc = firestore.doc(`users/${user.uid}`)
        const usernameDoc = firestore.doc(`usernames/${username}`)

        const batch = firestore.batch()
        batch.set(userDoc, {
            username: username,
        })
        batch.set(usernameDoc, { uid: user.uid })

        await batch
            .commit()
            .then(() => {
                toast.success("Success!")
            })
            .catch((error) => {
                console.log(error)
                toast.error("Failed to set username")
            })
    }

    useEffect(() => {
        checkUsername(username)
    }, [username])

    const checkUsername = useCallback(
        debounce(async (username) => {
            if (username.length >= 3) {
                const ref = firestore.doc(`usernames/${username}`)
                const { exists } = await ref.get()
                console.log("Firestore read executed!")
                setIsValid(!exists)
                setLoading(false)
            }
        }, 500),
        []
    )

    const usernameChange = (e) => {
        const val = e.target.value.toLowerCase()
        const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/

        if (val.length < 3) {
            SetUsername(val)
            setLoading(false)
            setIsValid(false)
        }

        if (re.test(val)) {
            SetUsername(val)
            setLoading(true)
            setIsValid(false)
        }
    }

    return (
        <>
            <span className={styles.title}>Choose Username</span>
            <Input
                name="Username"
                func={(e) => {
                    usernameChange(e)
                }}
            />
            <Button
                name="Choose Username"
                func={write_to_db}
                disabled={!isValid}
            />
        </>
    )
}

function GoogleAuth() {
    const signInGoogle = () => {
        const provider = googleAuthProvider
        auth.signInWithPopup(provider)
            .catch((error) => {
                const errorCode = error.code
                console.log(errorCode)
                if (
                    errorCode === "auth/popup-closed-by-user" ||
                    errorCode === "auth/cancelled-popup-request"
                ) {
                    toast.error("Popup Closed")
                }
            })
            .then(() => {
                toast.success("Signed in!")
            })
    }
    return (
        <>
            <span className={styles["auth-title"]}>OR</span>
            <div className={styles["auth-root"]}>
                <div
                    className={styles["auth-container"]}
                    onClick={signInGoogle}
                >
                    <div className={styles["auth-img"]}>
                        <Image
                            src="/google.png"
                            height="100%"
                            width="100%"
                        ></Image>
                    </div>
                    <p className={styles["auth-text"]}>Continue using Google</p>
                </div>
            </div>
        </>
    )
}

function SignUp(props) {
    const [email, setEmail] = useState("")
    const [password, SetPassword] = useState("")

    const signUp = async (e) => {
        e.preventDefault()
        console.log({ email: email, password: password })

        auth.createUserWithEmailAndPassword(email, password)
            .then(() => { toast.success("Signed up!") })
            .catch((error) => {
                const errorCode = error.code
                if (errorCode === "auth/invalid-email") {
                    toast.error("Invalid Email")
                } else if (errorCode === "auth/weak-password") {
                    toast.error("Weak Password")
                } else if (errorCode === "auth/email-already-in-use") {
                    toast.error("Email already in use")
                } else {
                    toast.error("Failed to sign up")
                }
            })
    }

    return (
        <>
            <span className={styles.title}>Sign Up</span>
            <Input
                name="Email"
                func={(e) => {
                    setEmail(e.target.value)
                }}
            />
            <Input
                name="Password"
                func={(e) => {
                    SetPassword(e.target.value)
                }}
            />
            <Button name="Sign Up" func={signUp} />
            <span className={styles.signup} onClick={props.func}>
                Already have an account? Sign in
            </span>
            <GoogleAuth />
        </>
    )
}

function SignIn(props) {
    const [email, setEmail] = useState("")
    const [password, SetPassword] = useState("")

    const signInEmail = () => {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                toast.success("Signed in!")
            })
            .catch((error) => {
                const errorCode = error.code
                console.log(errorCode)
                if (errorCode === "auth/invalid-email") {
                    toast.error("Invalid Email")
                } else if (errorCode === "auth/wrong-password") {
                    toast.error("Wrong Password")
                } else if (errorCode === "auth/user-not-found") {
                    toast.error("User not found")
                } else {
                    toast.error("Failed to sign in")
                }
            })
    }

    const signInGoogle = () => {
        const provider = googleAuthProvider
        auth.signInWithPopup(provider)
            .catch((error) => {
                const errorCode = error.code
                console.log(errorCode)
                if (
                    errorCode === "auth/popup-closed-by-user" ||
                    errorCode === "auth/cancelled-popup-request"
                ) {
                    toast.error("Popup Closed")
                }
            })
            .then(() => {
                toast.success("Signed in!")
            })
    }

    return (
        <>
            <span className={styles.title}>Sign In</span>
            <Input
                name="Email"
                func={(e) => {
                    setEmail(e.target.value)
                }}
            />
            <Input
                name="Password"
                func={(e) => {
                    SetPassword(e.target.value)
                }}
            />
            <Button name="Sign In" func={signInEmail} />
            <span className={styles.signup} onClick={props.func}>
                Don't have an accout? Sign Up!
            </span>
            <GoogleAuth />
        </>
    )
}

export default function enter() {
    const { user, username, profilePicture } = useContext(UserContext)
    const [signUp, setSignUp] = useState(false)

    return (
        <main className={styles.root}>
            <div className={styles.container}>
                {user ? !username ? <ChooseUsername /> : profilePicture ? <p>Already Signed In!</p> : <ChoosePicture /> : signUp ? <SignUp func={() => setSignUp(false)} /> : <SignIn func={() => setSignUp(true)} />}
            </div>
        </main>
    )
}
