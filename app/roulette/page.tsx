"use client";
import React, { useRef, useEffect, useState } from "react";
import styles from "./roulette.module.css";
import Image from "next/image";
import seta from "../../public/seta.png";

const prizes = [
  { icon: "🎉", name: "Prize 1", color: "#ff9999" },
  { icon: "🎁", name: "Prize 2", color: "#ffcc99" },
  { icon: "🏆", name: "Prize 3", color: "#ffff99" },
  { icon: "🎟️", name: "Prize 4", color: "#ccff99" },
  { icon: "💎", name: "Prize 5", color: "#99ff99" },
  { icon: "🚗", name: "Prize 6", color: "#99ffcc" },
  { icon: "🏖️", name: "Prize 7", color: "#99ffff" },
];

const Pizza = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const radius = canvas?.width ? canvas.width / 2 : 0;
    const angleStep = (2 * Math.PI) / prizes.length;

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
      ctx.fillStyle = prize.color;
      ctx.fill();

      // desenha icones e nomes
      ctx.save();
      ctx.rotate(startAngle + angleStep / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#000";
      ctx.font = "16px Arial";
      ctx.translate(radius * 0.7, 0); // move para a posição
      ctx.rotate(Math.PI / 2); // rotaciona o texto para ficar na vertical
      ctx.fillText(prize.icon, 0, -10); // ajusta posição para o icone
      ctx.fillText(prize.name, 0, 10); // ajusta posição para o nome do premio
      ctx.restore();
    });

    ctx.restore();
  }, [rotation]);

  const handleClick = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedPrize(null);
    const duration = 5000; // duração fixa para o giro da roleta
    const start = performance.now();
    const initialRotation = rotation;
    const spinCount = 5 + Math.floor(Math.random() * 5); // 5 a 9 números de giros
    const finalRotation =
      initialRotation + 360 * spinCount + Math.random() * 360;

    const animate = (time: number) => {
      const elapsed = time - start;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 3); // efeito ao parar a roleta
        setRotation(
          initialRotation + easeOut * (finalRotation - initialRotation)
        );
        requestAnimationFrame(animate);
      } else {
        const angleStep = 360 / prizes.length;
        const normalizedRotation = ((finalRotation % 360) + 360) % 360;
        // ajusta o index do prêmio selecionado
        const prizeIndex =
          (prizes.length -
            Math.floor((normalizedRotation + angleStep) / angleStep)) %
          prizes.length;
        setRotation(finalRotation);
        setIsSpinning(false);
        setSelectedPrize(prizes[prizeIndex].name);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className={styles.container}>
      <div className={styles.rouletteWrapper}>
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className={styles.pizza}
          onClick={handleClick}
        />
        <Image src={seta} alt="Seta" className={styles.seta} />
      </div>
      {selectedPrize && (
        <div className={styles.selectedPrize}>
          <h2>Prêmio Sorteado: {selectedPrize}</h2>
        </div>
      )}
    </div>
  );
};

export default Pizza;
