import { auth } from "@/config/firebase";
import { authUser } from "@/model/auth/user";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useEffect, useState } from "react";

export const useFirebaseAuth = (
  req: authUser,
  isLogin: boolean,
  isSubmit: boolean
): string => {
  const [message, setMessage] = useState<string>("");

  // Sign-up logic
  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        req.email,
        req.password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: req.userName,
      });
      setMessage("Success");
    } catch (error) {
      const firebaseError = error as FirebaseError;

      if (firebaseError.code === "auth/email-already-in-use") {
        console.error(
          "The email address is already in use by another account."
        );
        setMessage(
          "The email address is already in use. Please use a different email."
        );
      } else if (firebaseError.code === "auth/invalid-email") {
        console.error("The email address is not valid.");
        setMessage("The email address is invalid.");
      } else if (firebaseError.code === "auth/weak-password") {
        console.error("The password is too weak.");
        setMessage(
          "The password is too weak. Please choose a stronger password."
        );
      } else {
        console.error("Error during registration:", firebaseError.message);
        setMessage("Error during registration: " + firebaseError.message);
      }
    }
  };

  // Sign-in logic
  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        req.email,
        req.password
      );
      const user = userCredential.user;

      // Fetch the ID token
      const token = await user.getIdToken();

      // Store the token locally (in sessionStorage, localStorage, or state)
      sessionStorage.setItem("firebaseToken", token);
      setMessage("Login successful! Token saved.");
    } catch (error) {
      const er = error as FirebaseError;
      console.error("Error during sign-in:", error);
      setMessage("Error during sign-in: " + er.message);
    }
  };

  useEffect(() => {
    // Trigger async operations inside useEffect
    const authenticate = async () => {
      if (isSubmit && !isLogin) {
        await signUp();
      }
      if (isSubmit && isLogin) {
        await signIn();
      }
    };

    authenticate(); // Call async logic
  }, [isSubmit, isLogin, req]); // Ensure dependencies include `req` to track changes in inputs

  return message; // Return the current message (state value)
};
