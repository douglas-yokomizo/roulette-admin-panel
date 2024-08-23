"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import pluxeeLogo from "@/public/images/pluxeeLogo.png";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <Link
      className="flex flex-col bg-prize items-center h-screen w-full bg-cover bg-center bg-no-repeat cursor-pointer"
      href={"/roulette"}
    >
      <Image src={pluxeeLogo} alt="Logo Pluxee" className="mt-[600px]" />
      <h1 className="text-4xl animate-pulse text-blue-950 mt-20">
        Toque para iniciar
      </h1>
    </Link>
  );
}
