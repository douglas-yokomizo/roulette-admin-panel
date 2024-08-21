"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <h1 className="text-5xl mb-10">Pluxee</h1>
      <button
        onClick={() => router.push("/roulette")}
        className="bg-green-500 px-8 py-4 rounded-xl text-white"
      >
        Roleta
      </button>
    </div>
  );
}
