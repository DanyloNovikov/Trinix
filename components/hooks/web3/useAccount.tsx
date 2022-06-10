import { CryptoHookFactory } from "@_types/hooks";
import useSWR from 'swr';

type AccountHookFactory = CryptoHookFactory<string, string>

export type UseAccountHook = ReturnType<AccountHookFactory>

export const hookFactory: CryptoHookFactory<string, string> = (deps) => (params) => {
    return useSWR("web3/useAccount", () => {
        console.log(deps)
        console.log(params)
        return "Test User"
    });
}

