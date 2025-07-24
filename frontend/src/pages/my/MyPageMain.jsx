import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import MyPage from "./MyPage";

const MyPageMain = () => {
    return(
        <MainLayout pageTitle="MYPAGE">
            <MyPage />
        </MainLayout>
    )
}

export default MyPageMain;