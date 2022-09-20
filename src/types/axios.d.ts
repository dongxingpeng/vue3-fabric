import * as axios from "axios";

declare module "axios" {
  export interface AxiosInstance {
    CancelToken: any;
    get<T = any>(
      url: string,
      config?: AxiosRequestConfig & { useCache: boolean }
    ): Promise<T>;
    post<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>;
  }
  export interface AxiosResponse<T> {
    code: number;
    message: string;
    total: number;
    usedPercent: string;
    enddate: string;
    startdate: string;
    width: number;
    height: number;
  }
  export interface cameraStatus {
    all?: number;
    online?: number;
    offline?: number;
    error?: number;
  }
}
