import { DBCollection } from "@/common/constant/constant";
import { db2 } from "@/config/firebase";
import { Transaction } from "@/interface/wallet";
import { collection, addDoc } from "firebase/firestore";

export const saveAddEditTransaction = async (formData?: Transaction) => {
  if (!formData) return;

  // useEffect(() => async {
  //   try {
  //     const docRef = await addDoc(
  //       collection(db2, DBCollection.monthlyExpense),
  //       formData
  //     );

  //     console.log("Transaction saved with ID:", docRef.id);
  //     return docRef;
  //   } catch (err) {
  //     console.error("Error saving transaction:", err);
  //     throw err;
  //   }
  // }, [JSON.stringify(formData)]);

  try {
    const docRef = await addDoc(
      collection(db2, DBCollection.monthlyExpense),
      formData,
    );
    console.log("Transaction saved with ID:", docRef.id);
    return docRef;
  } catch (err) {
    console.error("Error saving transaction:", err);
    throw err;
  }
};
