import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import styles from "../styles/Header.module.css"

function Menu(props) {
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

    return (
        <div
            ref={menu_ref}
            className={`${styles.menu} ${active ? styles.active : ""}`}
        >
            <h3>User</h3>
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
                <li>
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
    const profile_ref = useRef()
    const [menuShown, setMenuShown] = useState(false)

    return (
        <header className={styles.root}>
            <div
                className={styles.profile}
                onClick={() => setMenuShown(!menuShown)}
                ref={profile_ref}
            >
                <Image src="/user.png" width="100%" height="100%"></Image>
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
