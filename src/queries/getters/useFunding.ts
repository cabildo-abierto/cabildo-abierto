import {useAPI} from "@/queries/utils";
import {DonationHistory} from "@/components/aportar/donation-history";

export function useMonthlyValue() {
    return useAPI<number>("/monthly-value", ["monthly-value"])
}


export function useFundingState() {
    return useAPI<number>("/funding-state", ["funding-state"])
}


export function useDonationHistory() {
    return useAPI<DonationHistory>("/donation-history", ["donation-history"])
}