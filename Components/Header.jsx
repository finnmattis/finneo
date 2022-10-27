import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { UserContext } from "../lib/context"
import { auth } from "../lib/firebase"
import styles from "../styles/Header.module.css"

function Menu({ show, onClickOutside, profile_ref }) {
    const { username } = useContext(UserContext)
    const menu_ref = useRef()
    const active = show ? "active" : ""

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
            onClickOutside()
        })
    }

    return (
        <div
            ref={menu_ref}
            className={`${styles.menu} ${active ? styles.active : ""}`}
        >
            <h3>{username || "Guest"}</h3>
            {username ? (
                <ul>
                    <Link href="/upload">
                        <li onClick={onClickOutside}>
                            <div className={styles.wrapper}>
                                <Image
                                    src="/upload.png"
                                    alt="upload"
                                    width="100%"
                                    height="100%"
                                ></Image>
                            </div>
                            <p>Upload</p>
                        </li>
                    </Link>
                    <Link href={`/users/${username}`}>
                        <li onClick={onClickOutside}>
                            <div className={styles.wrapper}>
                                <Image
                                    src="/folder.png"
                                    alt="folder"
                                    width="100%"
                                    height="100%"
                                ></Image>
                            </div>
                            <p>My Videos</p>
                        </li>
                    </Link>
                    <li onClick={logout}>
                        <div className={styles.wrapper}>
                            <Image
                                src="/logout.png"
                                alt="logout"
                                width="100%"
                                height="100%"
                            ></Image>
                        </div>
                        <p>Logout</p>
                    </li>
                </ul>
            ) : (
                <ul>
                    <Link href="/enter">
                        <li onClick={onClickOutside}>
                            <div className={styles.wrapper}>
                                <Image
                                    src="/login.png"
                                    alt="login"
                                    width="100%"
                                    height="100%"
                                ></Image>
                            </div>
                            <p>Login</p>
                        </li>
                    </Link>
                </ul>
            )}
        </div>
    )
}

export default function Header() {
    const { profilePicture } = useContext(UserContext)
    const profile_ref = useRef()
    const [menuShown, setMenuShown] = useState(false)

    const handleEscape = (e) => {
        if (e.key === "Escape") {
            setMenuShown(false)
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", handleEscape, false)
        return () => {
            document.removeEventListener("keydown", handleEscape, false)
        }
    }, [])

    return (
        <header className={styles.root}>
            <Link href="/">
                <div className={styles.logo}>
                    <Image
                        src={"/logo.png"}
                        alt="logo"
                        width="100%"
                        height="100%"
                    ></Image>
                </div>
            </Link>

            <div
                className={styles.profile}
                onClick={() => setMenuShown(!menuShown)}
                ref={profile_ref}
            >
                <Image
                    src={profilePicture || "/user.png"}
                    alt="profile"
                    width="100%"
                    height="100%"
                ></Image>
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
