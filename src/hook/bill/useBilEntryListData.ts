// import { vTransApiEndPoint } from "@/common/constant/constant";
import { Bill } from "@/interface/billEntry";
import getAxios from "../common/getAxios";

export const useBilEntryListData = async () => {
  //   const vTransApiAxios = process.env.VTRANS_API_BASE_URL;
  //   const { LocalStorage } = require("node-localstorage");
  //   const localStorage = new LocalStorage("./scratch");
  // url: "https://vtrans-microservice.vercel.app/getBillList",
  //`${vTransApiAxios}${vTransApiEndPoint.getBillList}`,

  const token = localStorage.getItem("token");
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "http://localhost:4000/getBillList",
    headers: {
      Authorization: token,
    },
  };
  console.log("config", config);

  const { loading, data } = await getAxios<Bill[]>(config);

  return { data, loading };
};
