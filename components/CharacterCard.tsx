import Image from "next/image";
import { Character } from "@/types/character";

type Props = {
  character: Character;
  selected: boolean;
  onClick: () => void;
};

export default function CharacterCard({
  character,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center
        rounded-lg
        border
        p-3
        transition-all
        hover:scale-105
        hover:shadow-lg
        ${
          selected
            ? "border-blue-500 bg-blue-100"
            : "border-gray-300 bg-white"
        }
      `}
    >
      <Image
        src={character.image}
        alt={character.name}
        width={80}
        height={80}
      />

      <p className="mt-2 font-semibold">
        {character.name}
      </p>
    </button>
  );
}