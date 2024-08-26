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
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [allPrizes, setAllPrizes] = useState<Prize[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);

  useEffect(() => {
    const fetchPrizes = async () => {
      const { data, error } = await supabase.from("prizes").select("*");

      if (error) {
        console.error("Error fetching prizes:", error);
      } else {
        setAllPrizes(sortPrizes(data));
        setPrizes(
          sortPrizes(
            data.filter((prize) => prize.isActive && prize.quantity > 0)
          )
        );
      }
    };

    fetchPrizes();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || allPrizes.length === 0) return;

    const radius = canvas?.width ? canvas.width / 2 : 0;
    const angleStep = (2 * Math.PI) / allPrizes.length;

    const loadImages = async () => {
      const images = await Promise.all(
        allPrizes.map(
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
      ctx.rotate((rotation * Math.PI) / 180 - Math.PI / 2);

      allPrizes.forEach((prize, index) => {
        const startAngle = index * angleStep;
        const endAngle = startAngle + angleStep;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.fillStyle = prize.color;
        ctx.fill();

        ctx.save();
        ctx.rotate(startAngle + angleStep / 2);
        ctx.textAlign = "center";
        ctx.font = "20px TTTravels-DemiBold";
        ctx.fillStyle = "#172554";
        ctx.translate(radius * 0.7, 0);
        ctx.rotate(Math.PI / 2);

        const img = images[index];
        ctx.drawImage(img, -30, -30, 60, 60);

        if (prize.name === "Fone de Ouvido 2") {
          ctx.fillStyle = "#FFF";
        } else if (prize.name === "Cooler") {
          ctx.fillStyle = "#FFF";
        } else {
          ctx.fillStyle = "#172554";
        }

        const displayName =
          prize.name === "Fone de Ouvido 2" ? "Fone de Ouvido" : prize.name;
        const words = displayName.split(" ");
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
        const line2 = words.slice(Math.ceil(words.length / 2)).join(" ");
        ctx.fillText(line1, 0, 50);
        if (line2) {
          ctx.fillText(line2, 0, 70);
        }

        ctx.restore();
      });

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 60;
      ctx.strokeStyle = "#000";
      ctx.stroke();

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = -10;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
      ctx.fillStyle = "#292929";
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.1 + 3, 0, 2 * Math.PI);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "#000";
      ctx.stroke();

      ctx.restore();
    };

    loadImages();
  }, [rotation, allPrizes]);

  const handleClick = () => {
    if (isSpinning || prizes.length === 0) {
      console.warn(
        "Cannot spin the roulette: Already spinning or no valid prizes available."
      );
      return;
    }

    setIsSpinning(true);
    setSelectedPrize(null);
    const duration = 5000;
    const start = performance.now();
    const initialRotation = rotation;
    const spinCount = 5 + Math.floor(Math.random() * 5);

    //  prêmio aleatório entre os prêmios disponíveis
    const chosenPrizeIndex = Math.floor(Math.random() * prizes.length);
    const chosenPrize = prizes[chosenPrizeIndex];

    // índice do prêmio sorteado na lista `allPrizes`
    const prizeIndexInAllPrizes = allPrizes.findIndex(
      (prize) => prize.id === chosenPrize.id
    );
    if (prizeIndexInAllPrizes === -1) {
      console.error("Prize not found in allPrizes array.");
      setIsSpinning(false);
      return;
    }

    const anglePerPrize = 360 / allPrizes.length;
    const prizeAngleOffset = anglePerPrize / 2; // centralizando o prêmio na setinha
    const targetAngle =
      prizeIndexInAllPrizes * anglePerPrize + prizeAngleOffset;

    // calculando a rot final para parar no premio sorteado
    const finalRotation =
      initialRotation + 360 * spinCount + (360 - targetAngle);

    const animate = (time: number) => {
      const elapsed = time - start;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setRotation(
          initialRotation + easeOut * (finalRotation - initialRotation)
        );
        requestAnimationFrame(animate);
      } else {
        setRotation(finalRotation % 360);
        setIsSpinning(false);

        setSelectedPrize(chosenPrize);
        updatePrizeQuantity(chosenPrize.id);

        // Navegar para a página de resultado com o prêmio sorteado
        router.push(
          `/result?prize=${encodeURIComponent(
            chosenPrize.name
          )}&icon=${encodeURIComponent(
            chosenPrize.icon
          )}&color=${encodeURIComponent(
            chosenPrize.color
          )}&id=${encodeURIComponent(chosenPrize.id)}`
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
