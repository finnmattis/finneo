import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import Button from "../Components/Button"
import Input from "../Components/Input"
import UploadFile from "../Components/UploadFile"
import { UserContext } from "../lib/context"
import { firestore, storage } from "../lib/firebase"
import styles from "../styles/upload.module.css"

export default function upload() {
    const { user } = useContext(UserContext)
    const [video, setVideo] = useState(null)
    const [thumbnail, setThumbnail] = useState(null)
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    let [disabled, setDisabled] = useState(true)

    useEffect(() => {
        if (video && thumbnail && title && desc) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [video, thumbnail, title, desc])

    const uploadFile = async () => {
        if (!video || !thumbnail || !title || !desc) {
            toast.error("Please fill all the fields")
            return
        }

        //Upload Video to Firebase Storage
        const vid = Array.from(video)[0]
        const vidExtension = vid.type.split("/")[1]

        const vidRef = ref(
            storage,
            `uploads/${user.uid}/${Date.now()}.${vidExtension}`
        )

        const vidTask = await uploadBytes(vidRef, vid)

        //Upload Thumbnail to Firebase Storage
        const thumb = Array.from(thumbnail)[0]
        const thumbExtension = thumb.type.split("/")[1]

        const thumbRef = ref(
            storage,
            `uploads/${user.uid}/${Date.now()}.${thumbExtension}`
        )

        const thumbTask = await uploadBytes(thumbRef, thumb)

        let vidURL = await getDownloadURL(vidTask.ref)
        let thumbURL = await getDownloadURL(thumbTask.ref)

        //Upload to Firestore
        let uploadRef = doc(collection(firestore, "users", user.uid, "uploads"))
        await setDoc(uploadRef, {
            author: user.uid,
            createdAt: serverTimestamp(),
            description: desc,
            id: uploadRef.id,
            thumbnailURL: thumbURL,
            title: title,
            videoURL: vidURL,
            views: 0,
        }).catch(() => {
            toast.error("Failed to write to database")
            return
        })
        toast.success("Uploaded!")

        setVideo(null)
        setThumbnail(null)
        setTitle("")
        setDesc("")
    }

    return (
        <div className={styles.root}>
            <div className={styles.container}>
                {user ? (
                    <>
                        <UploadFile
                            name="Video"
                            accept="video/*"
                            func={(e) => {
                                setVideo(e.target.files)
                            }}
                        />
                        <UploadFile
                            name="Thumbnail"
                            accept="image/*"
                            func={(e) => {
                                setThumbnail(e.target.files)
                            }}
                        />
                        <Input
                            name="Title"
                            value={title}
                            func={(e) => {
                                setTitle(e.target.value)
                            }}
                        />
                        <Input
                            name="Description"
                            value={desc}
                            func={(e) => {
                                setDesc(e.target.value)
                            }}
                        />
                        <Button
                            name="Submit"
                            func={uploadFile}
                            disabled={disabled}
                        />
                    </>
                ) : (
                    <p className={styles["not-login-text"]}>Not logged in!</p>
                )}
            </div>
        </div>
    )
}
