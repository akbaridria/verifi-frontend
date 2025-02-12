import CheckAddress from "@/components/check-address";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { WordRotate } from "@/components/magicui/word-rotate";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-16 mt-16">
      <div className="z-10 flex items-center justify-center">
        <a
          href="https://github.com/akbaridria/verifi"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AnimatedGradientText>
            🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />{" "}
            <span
              className={cn(
                `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
              )}
            >
              Introducing VeriFi
            </span>
            <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </AnimatedGradientText>
        </a>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center w-full max-w-[600px] mx-auto">
        Unlock the decentralized world with just a look.{" "}
        <WordRotate
          className="text-3xl sm:text-4xl md:text-5xl font-semibold"
          words={["Privacy-first", "Secure", "Seamless"]}
        />
      </h1>
      <h3 className="w-full max-w-[600px] mx-auto text-center font-medium text-muted-foreground text-sm sm:text-base">
        Tired of complex KYC processes? Worried about your biometric data being
        stored? VeriFi revolutionizes digital identity verification using
        zero-knowledge proofs, ensuring your privacy while proving you&apos;re
        human.
      </h3>

      <CheckAddress />
    </div>
  );
}
