import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../Components/Button";
import Input from "../Components/Input";
import UploadFile from "../Components/UploadFile";
import { auth, firestore, serverTimestamp, storage } from "../lib/firebase";
import styles from "../styles/upload.module.css";

export default function upload() {
    const [video, setVideo] = useState(null)
    const [thumbnail, setThumbnail] = useState(null)
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")

    const uploadFile = async () => {
        if (!video || !thumbnail || !title || !desc) {
            return toast.error("Please fill all the fields")
        }

        //Upload Video to Firebase Storage
        const vid = Array.from(video)[0];
        const vidExtension = vid.type.split('/')[1];

        const vidRef = storage.ref(`uploads/${auth.currentUser.uid}/${Date.now()}.${vidExtension}`);
        const vidTask = vidRef.put(vid);

        //Upload Thumbnail to Firebase Storage
        const thumb = Array.from(thumbnail)[0];
        const thumbExtension = thumb.type.split('/')[1];

        const thumbRef = storage.ref(`uploads/${auth.currentUser.uid}/${Date.now()}.${thumbExtension}`);
        const thumbTask = thumbRef.put(thumb);



        // Get downloadURL AFTER task resolves (Note: this is not a native Promise)
        vidTask
            .then((d) => vidRef.getDownloadURL())
            .then((vidUrl) => {
                thumbTask.then((d) => thumbRef.getDownloadURL()).then((thumbUrl) => {
                    console.log(desc)
                    console.log(title)
                    firestore
                        .collection('users')
                        .doc(auth.currentUser.uid)
                        .collection('uploads')
                        .add({ videoURL: vidUrl, title: title, thumbnailURL: thumbUrl, description: desc, createdAt: serverTimestamp() });
                    toast.success("Success!")
                })
            });
    };


    return (
        <div className={styles.root}>
            <div className={styles.container}>
                <UploadFile name="Video" func={(e) => { setVideo(e.target.files) }} />
                <UploadFile name="Thumbnail" func={(e) => { setThumbnail(e.target.files) }} />
                <Input name="Title" func={(e) => { setTitle(e.target.value) }} />
                <Input name="Description" func={(e) => { setDesc(e.target.value) }} />
                <Button name="Submit" func={uploadFile} />
            </div >
        </div >
    )
}
