"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import pluxeeLogo from "@/public/images/pluxeeLogo.png";

const ResultPage = () => {
  const searchParams = useSearchParams();
  const prize = searchParams.get("prize");
  const icon = searchParams.get("icon");
  const color = searchParams.get("color");
  const id = searchParams.get("id");
  const router = useRouter();

  // Define a cor do texto com base no identificador do prêmio
  const textColor =
    id === "7" || prize === "Cooler" ? "text-white" : "text-blue-950";

  // Variants for list items animation
  const listItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.5,
      },
    }),
  };

  const listItems = [
    "Oportunidades",
    "Experiências Personalizads",
    "Engajamento de Colaboradores",
    "Do que realmente importa para você",
  ];

  return (
    <motion.div
      className="h-screen flex text-blue-950 flex-col font-tt-travels items-center justify-center bg-prize bg-cover bg-center bg-no-repeat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 50 }}
      >
        <Image src={pluxeeLogo} alt="Logo Pluxee" />
      </motion.div>
      <motion.h1
        className="text-6xl text-center mt-10"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        Sinta o efeito <br /> Pluxee
      </motion.h1>
      <motion.ul
        className="text-4xl list-none justify-center flex flex-col items-center gap-6 mt-8 mb-16"
        initial="hidden"
        animate="visible"
      >
        {listItems.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-3"
            custom={index}
            variants={listItemVariants}
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-white text-6xl">+</span>
            <li>{item}</li>
          </motion.div>
        ))}
      </motion.ul>
      {prize && icon && color && (
        <motion.div
          className="flex flex-col items-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="flex flex-col items-center justify-center rounded-full"
            style={{
              backgroundColor: color,
              width: "450px",
              height: "450px",
            }}
          >
            <Image src={icon} alt={prize} width={140} height={140} />
            <p className={`text-6xl mt-4 text-center ${textColor}`}>
              <strong>{prize}</strong>
            </p>
          </div>
        </motion.div>
      )}
      <motion.button
        onClick={() => router.push("/")}
        className="mt-10 bg-green-500 px-8 py-4 rounded-xl text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        Voltar
      </motion.button>
      <style jsx>{`
        .bg-prize {
          background-color: ${color || "transparent"};
        }
      `}</style>
    </motion.div>
  );
};

export default ResultPage;
