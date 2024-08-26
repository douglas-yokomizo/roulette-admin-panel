"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import pluxeeLogo from "@/public/images/pluxeeLogo.png";

export default function Home() {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    router.push("/roulette");
  };

  return (
    <div
      className="flex flex-col bg-prize items-center h-screen w-full bg-cover bg-center bg-no-repeat cursor-pointer"
      onClick={handleClick}
    >
      <Image src={pluxeeLogo} alt="Logo Pluxee" className="mt-[600px]" />
      <h1 className="text-4xl animate-pulse text-blue-950 mt-20">
        Toque para iniciar
      </h1>
    </div>
  );
}
