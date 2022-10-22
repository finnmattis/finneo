import { useContext, useState } from "react"
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

    const uploadFile = async () => {
        if (!video || !thumbnail || !title || !desc) {
            return toast.error("Please fill all the fields")
        }

        //Upload Video to Firebase Storage
        const vid = Array.from(video)[0]
        const vidExtension = vid.type.split("/")[1]

        const vidRef = storage.ref(
            `uploads/${user.uid}/${Date.now()}.${vidExtension}`
        )
        const vidTask = vidRef.put(vid)

        //Upload Thumbnail to Firebase Storage
        const thumb = Array.from(thumbnail)[0]
        const thumbExtension = thumb.type.split("/")[1]

        const thumbRef = storage.ref(
            `uploads/${user.uid}/${Date.now()}.${thumbExtension}`
        )
        const thumbTask = thumbRef.put(thumb)

        //Note: this is not a native Promise
        vidTask
            .then((d) => vidRef.getDownloadURL())
            .then((vidUrl) => {
                thumbTask
                    .then((d) => thumbRef.getDownloadURL())
                    .then((thumbUrl) => {
                        console.log(desc)
                        console.log(title)
                        let doc = firestore
                            .collection("users")
                            .doc(user.uid)
                            .collection("uploads")
                            .doc()
                        doc.set({
                            author: user.uid,
                            createdAt: serverTimestamp(),
                            description: desc,
                            id: doc.id,
                            thumbnailURL: thumbUrl,
                            title: title,
                            videoURL: vidUrl,
                        })
                        toast.success("Success!")
                    })
            })
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
                        <Button name="Submit" func={uploadFile} />
                    </>
                ) : (
                    <p className={styles["not-login-text"]}>Not logged in!</p>
                )}
            </div>
        </div>
    )
}
