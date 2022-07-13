import { useState, forwardRef } from "react";
import type { SyntheticEvent, ChangeEvent } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Grow from "@mui/material/Grow";
import { TransitionProps } from "@mui/material/transitions";
import type { Theme, SxProps } from "@mui/material";
import type { PublicKey } from "@solana/web3.js";

import useSolanaWeb3 from "../utility/hooks/useSolanaWeb3";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Grow ref={ref} {...props} />;
});

const styles: { [key: string]: SxProps<Theme> } = {
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  outcome: {
    p: 1,
    display: "flex",
    alignContent: "center",
    justifyContent: "center",
  },
  alert: {
    wordWrap: "break-word",
    maxWidth: "600px",
  },
};

const TransferPopUp = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [isTransiting, setIsTransiting] = useState<boolean>(false);
  const [transferRes, setTransferRes] = useState<
    { done: boolean; message: string } | undefined
  >(undefined);
  const [address, setAddress] = useState<PublicKey | "">("");
  const [amount, setAmount] = useState<number | "">("");

  const { transfer } = useSolanaWeb3();

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setAddress(value as unknown as PublicKey);
  };
  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (!isNaN(+value)) {
      setAmount(value as unknown as number);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    if (!isTransiting) {
      setAddress("");
      setAmount("");
      setTransferRes(undefined);
      setOpen(false);
    }
  };

  const handleLinkClick = () => {
    window.open(
      `https://solscan.io/tx/${transferRes?.message}?cluster=devnet`,
      "_blank"
    );
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (address !== "" && amount !== "") {
      setIsTransiting(true);
      const res = await transfer(address, amount);
      setIsTransiting(false);
      setTransferRes(res);
    } else {
      setTransferRes({
        done: false,
        message: "Please fill in the address and amount!",
      });
    }
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen}>
        Create a new transaction
      </Button>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <form onSubmit={handleSubmit}>
          <DialogContent sx={styles.inputContainer}>
            <TextField
              value={address}
              onChange={handleAddressChange}
              type="text"
              label="target address"
              variant="outlined"
            />
            <TextField
              value={amount}
              onChange={handleAmountChange}
              type="text"
              label="amount"
              variant="outlined"
            />
          </DialogContent>
          <Box sx={styles.outcome}>
            {isTransiting && <CircularProgress />}
            {!!transferRes && (
              <Alert
                sx={styles.alert}
                severity={transferRes?.done ? "success" : "error"}
              >
                {transferRes?.done ? (
                  <Link underline="hover" onClick={handleLinkClick} href="#">
                    {transferRes?.message}
                  </Link>
                ) : (
                  transferRes?.message
                )}
              </Alert>
            )}
          </Box>
          <DialogActions>
            <Button disabled={isTransiting} onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={isTransiting} type="submit">
              Submit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default TransferPopUp;
