"use client";
import TransactionButton from "../TransactionButton";
import { Token } from "../../utils/cardano/token";
import { useDappStore } from "../../store";
import { Value } from "../../utils/cardano/value";
import { validator } from "../../utils/cardano/validator";
import { useQueryClient } from "@tanstack/react-query";
import FunctionKey from "../../utils/functionKey";
import { getLockDatum } from "../../utils/cardano/datum";
import { nftsQueryInvalidationDelay } from "../../utils/cardano/constants";
import { ButtonProps } from "@mui/material";
import env from "../../utils/configs/env";
import { useSnackbar } from "notistack";
import { SnackbarMessage } from "../../utils/texts";

type Props = {
  tokens: Token[];
  actionText?: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isPending: boolean;
  setIsPending: React.Dispatch<React.SetStateAction<boolean>>;
} & ButtonProps;

export default function LockNftButton({
  tokens,
  actionText = "Lock token",
  isLoading,
  setIsLoading,
  isPending,
  setIsPending,
  ...props
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const paymentKeyHash = useDappStore((state) => state.paymentKeyHash);
  const lucid = useDappStore((state) => state.lucid);
  const queryClient = useQueryClient();

  async function lockNft() {
    if (!lucid || !paymentKeyHash) return;

    const validatorAddress = lucid.utils.validatorToAddress(validator);
    const datum = getLockDatum({ ownerPaymentKeyHash: paymentKeyHash });

    if (env.REACT_APP_TESTNET) {
      tokens = tokens.map((token) => {
        return new Token(token.asset, 1n);
      });
    }

    const tx = await lucid
      .newTx()
      .payToContract(
        validatorAddress,
        { inline: datum },
        new Value(0n, tokens).toAssetsMap(),
      )
      .complete();
    setIsLoading(true);
    let signedTx;
    try {
      signedTx = await tx.sign().complete();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      return;
    }
    const txHash = await signedTx.submit();
    console.log("txhash", txHash);
    enqueueSnackbar({
      message: SnackbarMessage.TransactionSubmitted,
      variant: "info",
    });
    setIsLoading(false);
    setIsPending(true);
    await lucid.awaitTx(txHash);
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.NFTS],
      });
    }, nftsQueryInvalidationDelay);
    queryClient.invalidateQueries({
      queryKey: [FunctionKey.LOCKS],
    });
    enqueueSnackbar({
      message: SnackbarMessage.LockSuccess,
      variant: "success",
    });
    setIsPending(false);
    return txHash;
  }

  async function handleClickLockButton() {
    try {
      await lockNft();
    } catch (err: any) {
      console.error(err);
      enqueueSnackbar({
        message: `Error: ${err.info || err.message}`,
        variant: "error",
      });
    }
    setIsLoading(false);
    setIsPending(false);
  }

  return (
    <TransactionButton
      onClick={handleClickLockButton}
      isLoading={isLoading}
      isPending={isPending}
      actionText={actionText}
      {...props}
    />
  );
}
