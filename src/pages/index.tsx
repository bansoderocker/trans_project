import Head from "next/head";
import SideNavBar from "@/common/component/navSidebar/sidebar";
import Auth from "./auth/Auth";

import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";
import type { RootState } from "../redux/store"; // ✅ Import RootState
import { auth } from "@/config/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";

export default function Home() {
  const token = useSelector((state: RootState) => state.auth.token);
  console.log("token on index = ", token);
  console.log("auth on index = ", auth);

  const [user, setUser] = useState<User | null>(null); // User or null state

  //const [authUpdated, setAuthUpdated] = useState(false); // Dummy state

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      //   setAuthUpdated((prev) => !prev); // Trigger re-render
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Head>
        <title>Trans App</title>
        <meta name="description" content="Trans app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {user && <SideNavBar />}

      {!user && (
        <div
          className="card p-4 text-center shadow-lg"
          style={{
            width: "400px", // Fixed width for login box
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            marginTop: "10%",
            marginLeft: "35%",
          }}
        >
          <Auth />
        </div>
      )}
    </>
  );
}
