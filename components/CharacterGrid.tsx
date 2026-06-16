import CharacterCard from "./CharacterCard";
import { Character } from "@/types/character";

type Props = {
  characters: Character[];
  selectedCharacter: Character | null;
  onSelect: (character: Character) => void;
};

export default function CharacterGrid({
  characters,
  selectedCharacter,
  onSelect,
}: Props) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          selected={selectedCharacter?.id === character.id}
          onClick={() => onSelect(character)}
        />
      ))}
    </div>
  );
}