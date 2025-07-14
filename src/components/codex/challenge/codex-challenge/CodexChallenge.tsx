import { useState } from "react";
import type { Song } from "../../../../lib/codex-challenge";
import RandomSongPicker from "../song-picker/RandomSongPicker";
import "./codex-challenge.css";

interface Props {
  dutchSongs: Song[];
  frenchSongs: Song[];
  germanSongs: Song[];
  otherSongs: Song[];
}

enum Mode {
  CodexChallenge,
  Randomizer,
}

export default function CodexChallenge({
  dutchSongs,
  frenchSongs,
  germanSongs,
  otherSongs,
}: Props) {
  const [mode, setMode] = useState<Mode | undefined>();
  const [score, setScore] = useState<number>(0);
  const [song, setSong] = useState<Song | undefined>(undefined);

  return (
    <>
      {mode === Mode.Randomizer ? (
        <RandomSongPicker
          dutchSongs={dutchSongs}
          frenchSongs={frenchSongs}
          germanSongs={germanSongs}
          otherSongs={otherSongs}
          song={song}
          setSong={setSong}
        />
      ) : mode == Mode.CodexChallenge ? (
        <>
          <RandomSongPicker
            dutchSongs={dutchSongs}
            frenchSongs={frenchSongs}
            germanSongs={germanSongs}
            otherSongs={otherSongs}
            song={song}
            setSong={setSong}
          ></RandomSongPicker>
        </>
      ) : (
        <div className="content-container">
          <div className="information-container">
            <h1 className="title">Codex Challenge</h1>
            <p>Welkom tot de codex challenge </p>
            <p>
              Voor de challenge wordt gevraagd om de eerste strofe en het
              refrein te zingen zonder codex, tenzij anders vermeld.
            </p>
            <p>
              Elk lied staat op 2 punten en er worden 10 liedjes gevraagd. Je
              kan dus 20 punten in totaal scoren.
            </p>
            <p>Je slaagt als je minstens 10 op 20 haalt.</p>
            <p>
              Er worden 4 nederland-, 3 frans-, 2 duits- en 1 anders- of
              engelstalige liedjes gevraagd.
            </p>
          </div>
          <div className="button-container">
            <button
              className="challenge-button"
              onClick={(_) => setMode(Mode.CodexChallenge)}
            >
              Challenge starten
            </button>
            <button
              className="randomizer-button"
              onClick={(_) => setMode(Mode.Randomizer)}
            >
              Oefenen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
