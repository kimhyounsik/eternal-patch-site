"use client";

import { useState } from "react";

import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CharacterGrid from "@/components/CharacterGrid";
import { characters } from "@/data/characters";
import { Character } from "@/types/character";
import PatchList from "@/components/PatchList";
import { patches } from "@/data/patch";

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCharacter, setSelectedCharacter] =
    useState<Character | null>(null);

  const filteredCharacters = characters.filter((character) =>
    character.name.includes(search)
  );

  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl p-8">
        <SearchBar value={search} onChange={setSearch} />

        <div className="mt-8 grid grid-cols-3 gap-8">
          {/* 실험체 목록 스크롤 박스 */}
          <div className="col-span-1 max-h-[550px] overflow-y-auto rounded-xl border bg-white p-3 shadow-sm">
            <CharacterGrid
              characters={filteredCharacters}
              selectedCharacter={selectedCharacter}
              onSelect={(character) => setSelectedCharacter(character)}
            />
          </div>

          {/* 패치 상세 영역 */}
          <div className="col-span-2">
            {selectedCharacter ? (
              <PatchList
                character={selectedCharacter}
                patches={
                  patches[selectedCharacter.name as keyof typeof patches] ?? []
                }
              />
            ) : (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                실험체를 선택해주세요.
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}