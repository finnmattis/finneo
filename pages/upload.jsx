import { useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import Button from "../Components/Button"
import Input from "../Components/Input"
import UploadFile from "../Components/UploadFile"
import { UserContext } from "../lib/context"
import { firestore, serverTimestamp, storage } from "../lib/firebase"
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

        //Create Task to Upload Video to Firebase Storage
        const vid = Array.from(video)[0]
        const vidExtension = vid.type.split("/")[1]

        const vidRef = storage.ref(
            `uploads/${user.uid}/${Date.now()}.${vidExtension}`
        )

        const vidTask = vidRef.put(vid)

        //Create Task to Upload Thumbnail to Firebase Storage
        const thumb = Array.from(thumbnail)[0]
        const thumbExtension = thumb.type.split("/")[1]

        const thumbRef = storage.ref(
            `uploads/${user.uid}/${Date.now()}.${thumbExtension}`
        )

        const thumbTask = thumbRef.put(thumb)

        //Upload to storage and get the download URL
        //Note: this is not a native Promise
        let vidURL = await vidTask
            .then((d) => vidRef.getDownloadURL())
            .catch(() => {
                toast.error("Error uploading video")
                return
            })
        let thumbURL = await thumbTask
            .then((d) => thumbRef.getDownloadURL())
            .catch(() => {
                toast.error("Error uploading thumbnail")
                return
            })

        //Upload to Firestore
        let doc = firestore
            .collection("users")
            .doc(user.uid)
            .collection("uploads")
            .doc()
        await doc
            .set({
                author: user.uid,
                createdAt: serverTimestamp(),
                description: desc,
                id: doc.id,
                thumbnailURL: thumbURL,
                title: title,
                videoURL: vidURL,
                views: 0,
            })
            .catch(() => {
                toast.error("Failed to write to database")
                return
            })
        toast.success("Success!")
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
                            func={(e) => {
                                setTitle(e.target.value)
                            }}
                        />
                        <Input
                            name="Description"
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
