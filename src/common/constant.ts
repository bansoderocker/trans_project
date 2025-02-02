import { auth } from "@/config/firebase";

export const getUserData = () => {
    
  return auth.currentUser;
};
