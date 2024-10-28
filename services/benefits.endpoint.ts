import axios, { AxiosResponse } from "axios";

export const getBenefits = (): Promise<AxiosResponse<any, any>> => {
  const url: string = `${process.env.API_URL as string}/my-benefits`;

  return axios.get(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
};
