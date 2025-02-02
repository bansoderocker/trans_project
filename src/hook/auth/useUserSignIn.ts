// import { auth } from "@/config/firebase";
// import { authUser } from "@/model/auth/user";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import useLocalStorage from "../common/useLocalStorage";
// import { useDispatch } from "react-redux";
// import { setToken } from "@/redux/authSlice";
// import { useEffect } from "react";

// export const useUserSignIn = async (
//   req: authUser,
//   isLogin: boolean,
//   isSubmit: boolean
// ): Promise<void> => {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (isSubmit && isLogin) {
//       signIn(req);
//     }
//   }, [isSubmit, isLogin]);
// };
