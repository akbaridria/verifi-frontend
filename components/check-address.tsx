"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LIST_NETWORKS } from "@/constant/data";
import { abiVeriFiContract } from "@/lib/utils";
import { useState } from "react";

const formSchema = z.object({
  walletAddress: z.string().refine((value) => ethers.isAddress(value), {
    message: "Invalid wallet address.",
  }),
});

const CheckAddress = () => {
  const [verifiedNetworks, setVerifiedNetworks] = useState<string[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const list_verifi_contracts = LIST_NETWORKS.filter(
    (item) => item.supported
  )?.map((item) => ({
    address: item.verifiAddress,
    rpcUrl: item.appkitnetwork.rpcUrls.default.http[0],
    networkName: item.appkitnetwork.name,
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: "",
    },
  });

  // Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const networks: string[] = [];
    await Promise.all(
      list_verifi_contracts.map(async ({ address, rpcUrl, networkName }) => {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(
          address,
          abiVeriFiContract,
          provider
        );
        const isVerified = await contract.isVerified(values.walletAddress);
        if (isVerified) networks.push(networkName);
      })
    );
    setVerifiedNetworks(networks);
    setHasChecked(true);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-[600px] mx-auto"
        >
          <FormField
            control={form.control}
            name="walletAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Is your wallet address verified?</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input placeholder="0x..." {...field} />{" "}
                    <Button type="submit" disabled={loading}>
                      {loading ? "Checking..." : "Check"}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  {hasChecked ? (
                    <div className="font-bold text-primary">
                      {verifiedNetworks.length > 0 ? (
                        <>
                          This address is verified on:{" "}
                          {verifiedNetworks.join(", ")}
                        </>
                      ) : (
                        "This address is not verified on any network."
                      )}
                    </div>
                  ) : (
                    <div>Please enter your Ethereum wallet address.</div>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default CheckAddress;
