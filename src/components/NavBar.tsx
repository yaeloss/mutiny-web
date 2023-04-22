import mutiny_m from '~/assets/icons/m.svg';
// import scan from '~/assets/icons/scan.svg';
import airplane from '~/assets/icons/airplane.svg';
import settings from '~/assets/icons/settings.svg';

import { A } from "solid-start";

type ActiveTab = 'home' | 'scan' | 'send' | 'settings' | 'none';

export default function NavBar(props: { activeTab: ActiveTab }) {
    const activeStyle = 'h-full border-t-2 border-b-2 border-b-sidebar-gray flex flex-col justify-center md:border-t-0 md:border-b-0 md:p-2 md:bg-black md:rounded-lg'
    const inactiveStyle = "md:p-2 md:hover:bg-white/5 md:rounded-lg md:active:bg-m-blue"
    return (
        <nav class='backdrop-blur-xl fixed bottom-0 md:shadow-none shadow-above z-40 w-full safe-bottom md:top-0 md:bottom-auto md:left-0 md:w-auto md:h-full'>
            <ul class='h-16 flex justify-between px-16 items-center md:flex-col md:justify-start md:gap-4 md:px-4 md:mt-4'>
                <li class={props.activeTab === "home" ? activeStyle : inactiveStyle}>
                    <A href="/">
                        <img src={mutiny_m} alt="home" />
                    </A>
                </li>
                <li class={props.activeTab === "send" ? activeStyle : inactiveStyle}>
                    <A href="/send">
                        <img src={airplane} alt="send" />
                    </A>
                </li>
                <li class={props.activeTab === "settings" ? activeStyle : inactiveStyle}>
                    <A href="/settings">
                        <img src={settings} alt="settings" />
                    </A>
                </li>
            </ul>
        </nav >
    )
}