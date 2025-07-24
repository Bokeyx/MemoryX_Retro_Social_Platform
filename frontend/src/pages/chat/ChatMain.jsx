import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import RandomChat from "./RandomChat";

const ChatMain = () => {
    return(
        <MainLayout pageTitle="WITH CHAT">
            <RandomChat />
        </MainLayout>
    )
}

export default ChatMain;