import { CryptoHookFactory } from "@_types/hooks";
import useSWR from 'swr';

// create params type for our hooks factory
type AccountHookFactory = CryptoHookFactory<string, string>

// type for returned on Hooks
export type UseAccountHook = ReturnType<AccountHookFactory>

// CryptoHookFactory must get ethereum, provider, contract
export const hookFactory: CryptoHookFactory<string, string> = (deps) => (params) => {
    return useSWR("web3/useAccount", () => {
        console.log(deps)
        console.log(params)
        return "Test User"
    });
}

