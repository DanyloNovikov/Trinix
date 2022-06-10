import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, providers } from "ethers";
import {SWRResponse} from "swr";

// set dependencies for web object
export type Web3Dependencies = {
    provider: providers.Web3Provider;
    contract: Contract;
    ethereum: MetaMaskInpageProvider;
}

// export type params and response
export type CryptoHookFactory<D = any, P = any> = {
    (d: Partial<Web3Dependencies>): CryptoHandlerHook<D, P>
}

// response for function must be CryptoHookSWRResponse params must be any type and response must be any type
export type CryptoHandlerHook<D = any, P = any> = (params: P) => CryptoHookSWRResponse<D>

// set type response from SWRResponse and set params as we expect any data type
export type CryptoHookSWRResponse<D = any> = SWRResponse<D>;
