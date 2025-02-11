"use client";

import { useState, createContext, useContext } from "react";
import { InteractiveHoverButton } from "./magicui/interactive-hover-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AnimatePresence, motion } from "motion/react";
import SelectNetwork from "./select-network";
import { ReactNode } from "react";
import FaceScanner from "./face-scanner";

const LIST_STEPS = [
  {
    label: "Choose Network",
    description: "Select the network for verification",
    value: 33,
    component: <SelectNetwork />,
    stepNumber: 1,
  },
  {
    label: "Proof Generation",
    description: "Scan your face to generate proof",
    value: 66,
    component: <FaceScanner />,
    stepNumber: 2,
  },
  {
    label: "Submit Proof",
    description: "Submit the generated proof to the network",
    value: 100,
    component: <div>Proof submission component</div>,
    stepNumber: 3,
  },
];

const FormScanContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedStepIndex: number;
  setSelectedStepIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedChain: string;
  setSelectedChain: React.Dispatch<React.SetStateAction<string>>;
}>({
  open: false,
  setOpen: () => {},
  selectedStepIndex: 0,
  setSelectedStepIndex: () => {},
  selectedChain: "",
  setSelectedChain: () => {},
});

const FormScanProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [selectedChain, setSelectedChain] = useState("");

  return (
    <FormScanContext.Provider
      value={{
        open,
        setOpen,
        selectedStepIndex,
        setSelectedStepIndex,
        selectedChain,
        setSelectedChain,
      }}
    >
      {children}
    </FormScanContext.Provider>
  );
};

export const useFormScan = () => useContext(FormScanContext);

const FormScan = () => {
  const { open, setOpen, selectedStepIndex } = useFormScan();
  const selectedStep = LIST_STEPS[selectedStepIndex];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <InteractiveHoverButton
          className="text-sm!"
          onClick={() => setOpen(true)}
        >
          Start Verification
        </InteractiveHoverButton>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[525px] p-0"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="p-4">
          <VisuallyHidden>
            <DialogTitle>VeriFi</DialogTitle>
          </VisuallyHidden>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">{selectedStep.label}</div>
              <div className="text-sm text-muted-foreground">
                Step {selectedStep.stepNumber} of {LIST_STEPS.length}
              </div>
            </div>
            <Progress value={selectedStep.value} />
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStep ? selectedStep.label : "empty"}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {selectedStep ? selectedStep.component : "😋"}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

const FormScanWrapper = () => (
  <FormScanProvider>
    <FormScan />
  </FormScanProvider>
);

export default FormScanWrapper;
