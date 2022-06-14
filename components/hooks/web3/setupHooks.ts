import { Web3Dependencies } from "@_types/hooks";
import { hookFactory as createAccountHook, UseAccountHook } from "@hooks/web3/useAccount";
import { hookFactory as createNetworkHook, UseNetworkHook } from "@hooks/web3/useNetwork";

// set type returned for our function setting hooks
export type Web3Hooks = {
    useAccount: UseAccountHook;
    useNetwork: UseNetworkHook;
}

// set type params for function
export type SetupHooks = {
    (d: Web3Dependencies): Web3Hooks
}

// create function for setting our hooks
export const setupHooks: SetupHooks = (deps) => {
    return {
        // c
        useAccount: createAccountHook(deps),
        useNetwork: createNetworkHook(deps)
    }
}