import { useCallback } from "react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";

const useSolanaWeb3 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const transfer = useCallback(
    async (
      address: PublicKey,
      amount: number
    ): Promise<{
      done: boolean;
      message: string;
    }> => {
      try {
        if (!publicKey) throw new WalletNotConnectedError();
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: address,
            lamports: amount * LAMPORTS_PER_SOL,
          })
        );

        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(signature, "processed");

        return { done: true, message: signature };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return { done: false, message: error?.message || error };
      }
    },
    [connection, publicKey, sendTransaction]
  );
  return { transfer };
};

export default useSolanaWeb3;
