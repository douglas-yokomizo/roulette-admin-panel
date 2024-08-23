"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

const ResultPage = () => {
  const searchParams = useSearchParams();
  const prize = searchParams.get("prize");
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl mb-10">Parabéns!</h1>
      {prize && (
        <p className="text-3xl">
          Você ganhou: <strong>{prize}</strong>
        </p>
      )}
      <button
        onClick={() => router.push("/")}
        className="mt-10 bg-green-500 px-8 py-4 rounded-xl text-white"
      >
        Voltar
      </button>
    </div>
  );
};

export default ResultPage;
