import axios, { AxiosResponse } from "axios";

export const getBenefits = (): Promise<AxiosResponse<any, any>> => {
  const url: string = "http://demo3495337.mockable.io/my-benefits";

  return axios.get(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
};
