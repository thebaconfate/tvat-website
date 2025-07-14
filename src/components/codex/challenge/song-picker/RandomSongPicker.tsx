import React, { useState } from "react";
import { type Song } from "../../../../lib/codex-challenge";
import "./random-song-picker.css";

interface Props {
  dutchSongs: Song[];
  frenchSongs: Song[];
  germanSongs: Song[];
  otherSongs: Song[];
  song?: Song;
  setSong: (s: Song) => void;
}

export default function RandomSongPicker({
  dutchSongs,
  frenchSongs,
  germanSongs,
  otherSongs,
  song,
  setSong,
}: Props) {
  console.log("Loaded");
  function makeRandomFunction(langlist: Song[]) {
    return (_: React.MouseEvent<HTMLImageElement>) => {
      let randIdx;
      do {
        randIdx = Math.floor(Math.random() * langlist.length);
      } while (song !== undefined && langlist[randIdx].title == song.title);
      setSong(langlist[randIdx]);
    };
  }

  return (
    <div className="picker">
      <div className="buttons">
        <img
          className="lang"
          src="/vlaamse-leeuw.jpg"
          onClick={makeRandomFunction(dutchSongs)}
          alt="vlaamse leeuw"
        ></img>
        <img
          className="lang"
          src="/waalse-haan.png"
          onClick={makeRandomFunction(frenchSongs)}
          alt="waalse haan"
        ></img>
        <img
          className="lang"
          src="/duitse-dinges.png"
          onClick={makeRandomFunction(germanSongs)}
          alt="duitse gemeenschap logo"
        ></img>
        <img
          className="lang"
          src="/internationaal.png"
          onClick={makeRandomFunction(otherSongs)}
          alt="anders"
        ></img>
      </div>
      <div className="result">
        {song ? (
          <div className="song">
            <p>Titel: {song.title}</p>
            <p>Pagina: {song.page}</p>
            {song.description ? <p>{song.description}</p> : ""}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
