"use client";
import { Stack, Typography } from "@mui/material";
import { useGetChainType } from "../hooks/useGetChainType";
import LockNftListEVM from "./LockNftListEVM";

export default function LockNftSection() {
  const chainType = useGetChainType();

  return (
    <Stack sx={{ gap: 2, mt: 4, alignItems: "center", width: "100%" }}>
      <Typography variant="h3">Lock an NFT</Typography>
      {chainType === "EVM" ? <LockNftListEVM /> : <></>}
    </Stack>
  );
}