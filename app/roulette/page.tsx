"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../utils/supabase/client";
import styles from "./roulette.module.css";
import seta from "../../public/seta.png";
import pluxeLogo from "@/public/images/pluxeeLogo.png";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import leftArrow from "../../public/icons/left-arrow.png";

interface Prize {
  id: number;
  icon: string;
  name: string;
  quantity: number;
  color: string;
  isActive: boolean;
}

const sortPrizes = (prizes: Prize[]) => {
  const order = [
    "Caderno",
    "Fone de Ouvido",
    "Fone de Ouvido 2",
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
        .gt("quantity", 0) // Fetch only prizes with quantity greater than 0
        .eq("isActive", true); // Fetch only active prizes
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
        if (prize.name === "Fone de Ouvido 2") {
          ctx.fillStyle = "#FFF"; // branco para "Fone de Ouvido 2"
        } else if (prize.name === "Cooler") {
          ctx.fillStyle = "#FFF"; // branco para "Cooler"
        } else {
          ctx.fillStyle = "#172554"; // preto para os outros prêmios
        }

        // Substitui "Fone de Ouvido 2" por "Fone de Ouvido"
        const displayName =
          prize.name === "Fone de Ouvido 2" ? "Fone de Ouvido" : prize.name;

        // quebra o nome em duas linhas se tiver mais de duas palavras
        const words = displayName.split(" ");
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
        let prizeName = prizes[prizeIndex].name;

        if (prizeName === "Fone de Ouvido 2") {
          prizeName = "Fone de Ouvido";
        }
        const prizeId = prizes[prizeIndex].id;
        const prizeIcon = prizes[prizeIndex].icon;
        const prizeColor = prizes[prizeIndex].color;
        setSelectedPrize(prizeName);
        updatePrizeQuantity(prizes[prizeIndex].id);

        // Navega para a página de resultado com o prêmio sorteado na URL
        router.push(
          `/result?prize=${encodeURIComponent(
            prizeName
          )}&icon=${encodeURIComponent(prizeIcon)}&color=${encodeURIComponent(
            prizeColor
          )}&id=${encodeURIComponent(prizeId)}`
        );
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
    <motion.div
      className="h-screen relative flex flex-col items-center bg-roulette bg-cover bg-center bg-no-repeat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute w-10 left-6 top-6 hover:cursor-pointer"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src={leftArrow}
          alt="Back Icon"
          className=""
          onClick={() => router.back()}
        />
      </motion.div>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 50 }}
      >
        <Image src={pluxeLogo} alt="Logo Pluxee" className="mt-28 mb-20" />
      </motion.div>
      <motion.p
        className="text-6xl text-center font-bold font-tt-travels text-blue-950"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        Aproveite <br /> nosso mundo de <br /> oportunidades!
      </motion.p>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <motion.div
          className={styles.rouletteWrapper}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className={styles.roulette}
            onClick={handleClick}
          />

          <Image src={seta} alt="Seta" className={styles.seta} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RoulettePage;
