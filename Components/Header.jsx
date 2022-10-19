import Image from "next/image"
import { useContext, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { UserContext } from "../lib/context"
import { auth } from "../lib/firebase"
import styles from "../styles/Header.module.css"


function Menu(props) {
    const { user, username } = useContext(UserContext)
    const menu_ref = useRef()
    const active = props.show ? "active" : ""
    const { onClickOutside, profile_ref } = props

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menu_ref.current &&
                !menu_ref.current.contains(event.target) &&
                !profile_ref.current.contains(event.target)
            ) {
                onClickOutside()
            }
        }
        document.addEventListener("click", handleClickOutside, true)
        return () => {
            document.removeEventListener("click", handleClickOutside, true)
        }
    }, [onClickOutside])

    const logout = () => {
        auth.signOut().then(() => {
            toast.success("Signed out!")
        })
    }

    return (
        <div
            ref={menu_ref}
            className={`${styles.menu} ${active ? styles.active : ""}`}
        >
            <h3>{username || "Guest"}</h3>
            <ul>
                <li>
                    <div className={styles.wrapper}>
                        <Image
                            src="/settings.png"
                            width="100%"
                            height="100%"
                        ></Image>
                    </div>
                    <p>Settings</p>
                </li>
                <li onClick={logout}>
                    <div className={styles.wrapper}>
                        <Image
                            src="/logout.png"
                            width="100%"
                            height="100%"
                        ></Image>
                    </div>
                    <p>Logout</p>
                </li>
            </ul>
        </div>
    )
}

export default function Header() {
    const { profilePicture } = useContext(UserContext)
    const profile_ref = useRef()
    const [menuShown, setMenuShown] = useState(false)

    return (
        <header className={styles.root}>
            <div
                className={styles.profile}
                onClick={() => setMenuShown(!menuShown)}
                ref={profile_ref}
            >
                <Image src={profilePicture || "/user.png"} width="100%" height="100%"></Image>
            </div>
            <Menu
                show={menuShown}
                onClickOutside={() => {
                    setMenuShown(false)
                }}
                profile_ref={profile_ref}
            />
        </header>
    )
}
