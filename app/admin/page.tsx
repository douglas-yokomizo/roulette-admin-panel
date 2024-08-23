"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase/client";
import Image from "next/image";

interface Prize {
  id: number;
  icon: string;
  name: string;
  quantity: number;
  color: string;
  isActive: boolean;
}

const AdminPage = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);

  useEffect(() => {
    const fetchPrizes = async () => {
      const { data, error } = await supabase.from("prizes").select("*");
      if (error) {
        console.error("Error fetching prizes:", error);
      } else {
        setPrizes(data);
      }
    };

    fetchPrizes();
  }, []);

  const updatePrize = async (prize: Prize) => {
    const { data, error } = await supabase
      .from("prizes")
      .update({ quantity: prize.quantity, isActive: prize.isActive })
      .eq("id", prize.id);

    if (error) {
      console.error("Error updating prize:", error);
    } else {
      console.log("Prize updated:", data);
    }
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    setPrizes((prevPrizes) =>
      prevPrizes.map((prize) =>
        prize.id === id ? { ...prize, quantity } : prize
      )
    );
  };

  const handleIsActiveChange = (id: number, isActive: boolean) => {
    setPrizes((prevPrizes) =>
      prevPrizes.map((prize) =>
        prize.id === id ? { ...prize, isActive } : prize
      )
    );
  };

  return (
    <div className="container mx-auto font-tt-travels p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {prizes.map((prize) => (
          <div
            key={prize.id}
            className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <Image
              src={prize.icon}
              alt={prize.name}
              width={200}
              height={200}
              className="w-full p-4 h-32 object-contain mb-4 bg-gray-400 rounded-lg"
            />
            <h2 className="text-xl font-semibold mb-4 text-center">
              {prize.name}
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Quantidade:</label>
              <select
                value={prize.quantity}
                onChange={(e) =>
                  handleQuantityChange(prize.id, parseInt(e.target.value, 10))
                }
                onBlur={() => updatePrize(prize)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 4000 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center text-gray-700">
                <span className="mr-2">Ativo:</span>
                <input
                  type="checkbox"
                  checked={prize.isActive}
                  onChange={(e) =>
                    handleIsActiveChange(prize.id, e.target.checked)
                  }
                  onBlur={() => updatePrize(prize)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
