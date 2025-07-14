import React, { useState } from "react";
import { Language, type Song } from "../../../../lib/codex-challenge";
import "./random-song-picker.css";

interface Props {
  dutchSongs: Song[];
  frenchSongs: Song[];
  germanSongs: Song[];
  otherSongs: Song[];
  song?: Song;
  alreadySelectedSongs?: Set<Song>;
  setSong: (s: Song) => void;
}

function alreadySelected(newSong: Song, currentSong?: Song) {
  if (currentSong === undefined) return false;
  return currentSong.title === newSong.title;
}

const limit: { [key in Language]: number } = {
  [Language.DUTCH]: 4,
  [Language.FRENCH]: 3,
  [Language.GERMAN]: 2,
  [Language.ENGLISH]: 1,
  [Language.OTHER]: 1,
};

function filterLang(language: Language) {
  return function f(song: Song) {
    switch (language) {
      case Language.ENGLISH:
      case Language.OTHER:
        return (
          song.language === Language.ENGLISH || song.language === Language.OTHER
        );
      default:
        return song.language === language;
    }
  };
}

export default function RandomSongPicker({
  dutchSongs,
  frenchSongs,
  germanSongs,
  otherSongs,
  song,
  alreadySelectedSongs,
  setSong,
}: Props) {
  const [error, setError] = useState<boolean>(false);

  function makeRandomFunction(langlist: Song[]) {
    return (_: React.MouseEvent<HTMLImageElement>) => {
      if (
        alreadySelectedSongs !== undefined &&
        [...alreadySelectedSongs].filter(filterLang(langlist[0].language))
          .length === limit[langlist[0].language]
      )
        setError(true);
      else {
        setError((prev) => (!prev ? prev : !prev));
        let randIdx;
        do {
          randIdx = Math.floor(Math.random() * langlist.length);
        } while (
          alreadySelectedSongs === undefined
            ? song !== undefined && song.title === langlist[randIdx].title
            : song !== undefined && alreadySelectedSongs.has(langlist[randIdx])
        );
        setSong(langlist[randIdx]);
      }
    };
  }

  return (
    <div className="picker">
      <div className="buttons">
        <div className="lang-container">
          <img
            className="lang"
            src="/vlaamse-leeuw.jpg"
            onClick={makeRandomFunction(dutchSongs)}
            alt="vlaamse leeuw"
          ></img>
          {alreadySelectedSongs === undefined ? (
            ""
          ) : (
            <p>
              {`${
                [...alreadySelectedSongs].filter(
                  (s) => s.language === Language.DUTCH,
                ).length
              }/4`}
            </p>
          )}
        </div>
        <div className="lang-container">
          <img
            className="lang"
            src="/waalse-haan.png"
            onClick={makeRandomFunction(frenchSongs)}
            alt="waalse haan"
          ></img>
          {alreadySelectedSongs === undefined ? (
            ""
          ) : (
            <p>
              {`${
                [...alreadySelectedSongs].filter(
                  (s) => s.language === Language.FRENCH,
                ).length
              }/3`}
            </p>
          )}
        </div>
        <div className="lang-container">
          <img
            className="lang"
            src="/duitse-dinges.png"
            onClick={makeRandomFunction(germanSongs)}
            alt="duitse gemeenschap logo"
          ></img>
          {alreadySelectedSongs === undefined ? (
            ""
          ) : (
            <p>
              {`${
                [...alreadySelectedSongs].filter(
                  (s) => s.language === Language.GERMAN,
                ).length
              }/2`}
            </p>
          )}
        </div>
        <div className="lang-container">
          <img
            className="lang"
            src="/internationaal.png"
            onClick={makeRandomFunction(otherSongs)}
            alt="anders"
          ></img>
          {alreadySelectedSongs === undefined ? (
            ""
          ) : (
            <p>
              {`${
                [...alreadySelectedSongs].filter(
                  (s) =>
                    s.language === Language.ENGLISH ||
                    s.language === Language.OTHER,
                ).length
              }/1`}
            </p>
          )}
        </div>
      </div>
      <div className="result">
        <div className="song">
          {error ? (
            <>
              <p>Je hebt het maximum aantal liedjes van deze taal al berijkt</p>
              <p>Kies een andere taal </p>
            </>
          ) : song ? (
            <>
              <p>Titel: {song.title}</p>
              <p>Pagina: {song.page}</p>
              {song.description ? <p>{song.description}</p> : ""}
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}
