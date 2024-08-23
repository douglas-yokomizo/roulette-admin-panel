"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../utils/supabase/client";
import styles from "./roulette.module.css";
import seta from "../../public/seta.png";
import pluxeLogo from "@/public/images/pluxeeLogo.png";
import { useRouter } from "next/navigation";

interface Prize {
  id: number;
  icon: string;
  name: string;
  quantity: number;
  color: string;
}

const sortPrizes = (prizes: Prize[]) => {
  const order = [
    "Caderno",
    "Fone de ouvido",
    "Fone de ouvido",
    "Viseira",
    "Copo Térmico",
    "Cooler",
    "Lancheira",
  ];

  return prizes.sort((a, b) => {
    return order.indexOf(a.name) - order.indexOf(b.name);
  });
};

const RoulettePage = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);

  useEffect(() => {
    const fetchPrizes = async () => {
      const { data, error } = await supabase
        .from("prizes")
        .select("*")
        .gt("quantity", 0); // Fetch only prizes with quantity greater than 0
      if (error) {
        console.error("Error fetching prizes:", error);
      } else {
        setPrizes(sortPrizes(data));
      }
    };

    fetchPrizes();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || prizes.length === 0) return;

    const radius = canvas?.width ? canvas.width / 2 : 0;
    const angleStep = (2 * Math.PI) / prizes.length;

    const loadImages = async () => {
      const images = await Promise.all(
        prizes.map(
          (prize) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new window.Image();
              img.src = prize.icon;
              img.onload = () => resolve(img);
              img.onerror = reject;
            })
        )
      );

      ctx.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate((rotation * Math.PI) / 180 - Math.PI / 2); // rotaciona e ajusta o ângulo inicial

      let foneDeOuvidoCount = 0;

      prizes.forEach((prize, index) => {
        const startAngle = index * angleStep;
        const endAngle = startAngle + angleStep;

        // desenha as fatias
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.fillStyle = prize.color; // Use a cor do prêmio
        ctx.fill();

        // desenha o ícone e o nome
        ctx.save();
        ctx.rotate(startAngle + angleStep / 2);
        ctx.textAlign = "center";
        ctx.font = "20px TTTravels-DemiBold"; // aumente o tamanho da fonte
        ctx.fillStyle = "#172554";
        ctx.translate(radius * 0.7, 0); // ajuste a posição
        ctx.rotate(Math.PI / 2); // rotaciona o texto para ficar na posição correta

        // desenha a imagem
        const img = images[index];
        ctx.drawImage(img, -30, -30, 60, 60); // ajuste a posição e o tamanho do ícone

        // Define a cor da fonte
        if (prize.name === "Fone de ouvido") {
          foneDeOuvidoCount++;
          if (foneDeOuvidoCount === 2) {
            ctx.fillStyle = "#FFF"; // branco para o segundo "Fone de ouvido"
          } else {
            ctx.fillStyle = "#172554 "; // preto para o primeiro "Fone de ouvido"
          }
        } else if (prize.name === "Cooler") {
          ctx.fillStyle = "#FFF"; // branco para "Cooler"
        } else {
          ctx.fillStyle = "#172554 "; // preto para os outros prêmios
        }

        // quebra o nome em duas linhas se tiver mais de duas palavras
        const words = prize.name.split(" ");
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
        const line2 = words.slice(Math.ceil(words.length / 2)).join(" ");
        ctx.fillText(line1, 0, 50); // ajuste a posição da primeira linha do nome
        if (line2) {
          ctx.fillText(line2, 0, 70); // ajuste a posição da segunda linha do nome
        }

        ctx.restore();
      });

      // Desenha o contorno da borda externa
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 60; // ajuste a espessura do contorno
      ctx.strokeStyle = "#000"; // cor do contorno
      ctx.stroke();

      // Desenha o círculo preto no meio com sombra
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = -10;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI); // ajuste o tamanho do círculo
      ctx.fillStyle = "#292929"; // cor do círculo
      ctx.fill();
      ctx.restore();

      // Desenha o contorno fino ao redor do círculo
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.1 + 3, 0, 2 * Math.PI); // contorno a 1px de distância
      ctx.lineWidth = 0.5; // espessura do contorno
      ctx.strokeStyle = "#000"; // cor do contorno
      ctx.stroke();

      ctx.restore();
    };

    loadImages();
  }, [rotation, prizes]);

  const handleClick = () => {
    if (isSpinning || prizes.length === 0) return;

    setIsSpinning(true);
    setSelectedPrize(null);
    const duration = 5000; // duração fixa para o tempo de rotação
    const start = performance.now();
    const initialRotation = rotation;
    const spinCount = 5 + Math.floor(Math.random() * 5); // 5 a 9 rotações completas
    const finalRotation =
      initialRotation + 360 * spinCount + Math.random() * 360;

    const animate = (time: number) => {
      const elapsed = time - start;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 3); // efeito ease-out
        setRotation(
          initialRotation + easeOut * (finalRotation - initialRotation)
        );
        requestAnimationFrame(animate);
      } else {
        const angleStep = 360 / prizes.length;
        const normalizedRotation = ((finalRotation % 360) + 360) % 360;
        const prizeIndex =
          (prizes.length -
            Math.floor((normalizedRotation + angleStep) / angleStep)) %
          prizes.length;
        setRotation(finalRotation);
        setIsSpinning(false);
        const prizeName = prizes[prizeIndex].name;
        setSelectedPrize(prizeName);
        updatePrizeQuantity(prizes[prizeIndex].id);

        // Navega para a página de resultado com o prêmio sorteado na URL
        router.push(`/result?prize=${encodeURIComponent(prizeName)}`);
      }
    };

    requestAnimationFrame(animate);
  };

  const updatePrizeQuantity = async (prizeId: number) => {
    const { data: prizeData, error: fetchError } = await supabase
      .from("prizes")
      .select("quantity")
      .eq("id", prizeId)
      .single();

    if (fetchError) {
      console.error("Error fetching prize quantity:", fetchError);
      return;
    }

    const newQuantity = prizeData.quantity - 1;

    const { data, error } = await supabase
      .from("prizes")
      .update({ quantity: newQuantity })
      .eq("id", prizeId);

    if (error) {
      console.error("Error updating prize quantity:", error);
    } else {
      console.log("Prize quantity updated:", data);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center bg-roulette bg-cover bg-center bg-no-repeat">
      <Image
        src={pluxeLogo}
        width={400}
        alt="Logo Pluxee"
        className="mt-28 mb-20"
      />
      <p className="text-6xl text-center font-bold font-tt-travels text-blue-950">
        Aproveite <br /> nosso mundo de <br /> oportunidades!
      </p>
      <div className={styles.container}>
        <div className={styles.rouletteWrapper}>
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className={styles.roulette}
            onClick={handleClick}
          />
          <Image src={seta} alt="Seta" className={styles.seta} />
        </div>
      </div>
    </div>
  );
};

export default RoulettePage;
