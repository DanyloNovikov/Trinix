import {MetaMaskInpageProvider} from "@metamask/providers";
import {Contract, providers, ethers} from "ethers";
import {Web3Dependencies} from "@_types/hooks";
import {setupHooks, Web3Hooks} from "@hooks/web3/setupHooks";

// include MetaMask provider
declare global {
    interface Window {
        ethereum: MetaMaskInpageProvider;
    }
}

// type for State
type Nullable<T> = {
    [P in keyof T]: T[P] | null;
}

export type Web3State = {
    isLoading: boolean; // true  while loading web3State
    hooks: Web3Hooks;
} & Nullable<Web3Dependencies>

export const createDefaultState = () => {
    return {
        ethereum: null,
        provider: null,
        contract: null,
        isLoading: true,
        hooks: setupHooks({} as any),
    }
}
//

// функция которая будет возвращать набор обектов а так же передает hooks
export const createWeb3State = ({
    ethereum, provider, contract, isLoading
                                }:Web3Dependencies & { isLoading: boolean } ) => {
    return {
        ethereum,
        provider,
        contract,
        isLoading,
        hooks: setupHooks({ethereum, provider, contract}),
    }
}

// load contracts
const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID;

export const loadContract = async (
    name: string,
    provider: providers.Web3Provider
): Promise<Contract> => {

    if (!NETWORK_ID) {
        return Promise.reject("Network ID is not defined");
    }

    const res = await fetch(`/contracts/${name}.json`);
    const Artifact = await res.json();

    if (Artifact.networks[NETWORK_ID].address) {
        return new ethers.Contract(
            Artifact.networks[NETWORK_ID].address,
            Artifact.abi,
            provider
        );
    } else {
        return Promise.reject(`Contract: [${name}] cannot be loaded!`);
    }
}
