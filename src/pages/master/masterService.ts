import { dataBranch } from "@/common/constant/constant";
import { db } from "../../config/firebase";
import {
  ref,
  push,
  get,
  remove,
  update,
  child,
  DatabaseReference,
} from "firebase/database";

const PATH = dataBranch.master;

export const getMasterRef = () => ref(db, PATH);

export const fetchMasters = async () => {
  const snapshot = await get(getMasterRef());

  if (!snapshot.exists()) return [];

  const data = snapshot.val();

  return Object.keys(data).map((key) => ({
    id: key,
    ...data[key],
  }));
};

export const addMaster = async (data: any) => {
  return push(getMasterRef(), data);
};

export const updateMaster = async (id: string, data: any) => {
  return update(child(getMasterRef(), id), data);
};

export const deleteMaster = async (id: string) => {
  return remove(ref(db, `${PATH}/${id}`));
};
