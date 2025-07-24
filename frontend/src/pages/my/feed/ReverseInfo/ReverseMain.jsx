import React from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import ReverseInfo from "./ReversePage.jsx"

const ReverseMain = () => {
    return(
        <MainLayout pageTitle={"MYPAGE"}>
            <ReverseInfo />
        </MainLayout>
    )
}

export default ReverseMain;