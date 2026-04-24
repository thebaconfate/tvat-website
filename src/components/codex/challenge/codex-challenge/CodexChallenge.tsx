import { useState } from "react";
import { Language, type Song } from "../../../../lib/codex-challenge";
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

type Score = { [key in Language]: number };
const initScores: Score = {
  [Language.DUTCH]: 0,
  [Language.FRENCH]: 0,
  [Language.GERMAN]: 0,
  [Language.ENGLISH]: 0,
  [Language.OTHER]: 0,
};

export default function CodexChallenge({
  dutchSongs,
  frenchSongs,
  germanSongs,
  otherSongs,
}: Props) {
  const [mode, setMode] = useState<Mode | undefined>();
  const [totalScore, setTotalScore] = useState<Score>(initScores);
  const [song, setSong] = useState<Song | undefined>(undefined);
  const [songSet, setSongSet] = useState<Set<Song>>(new Set<Song>());
  const [addedScore, setAddedScore] = useState<boolean>(false);

  function goBack(_: any) {
    setMode(undefined);
    setTotalScore(initScores);
    setSong(undefined);
    setSongSet(new Set<Song>());
    setAddedScore(false);
  }

  function createScoreHandler(score: number) {
    return (_: any) => {
      if (song !== undefined && !addedScore) {
        setTotalScore({
          ...totalScore,
          [song.language]: totalScore[song.language] + score,
        });
        setAddedScore(true);
      }
    };
  }

  return (
    <>
      <div className="content-container">
        <h1 className="title">Codex Challenge</h1>
        {mode === Mode.Randomizer ? (
          <>
            <RandomSongPicker
              dutchSongs={dutchSongs}
              frenchSongs={frenchSongs}
              germanSongs={germanSongs}
              otherSongs={otherSongs}
              song={song}
              setSong={setSong}
            />
            <div className="return-button-container">
              <button className="return-button" onClick={goBack}>
                Terug
              </button>
            </div>
          </>
        ) : mode == Mode.CodexChallenge ? (
          <>
            <RandomSongPicker
              dutchSongs={dutchSongs}
              frenchSongs={frenchSongs}
              germanSongs={germanSongs}
              otherSongs={otherSongs}
              song={song}
              alreadySelectedSongs={songSet}
              setSong={(newSong: Song) => {
                if (addedScore || song === undefined) {
                  setSong(newSong);
                  setSongSet(songSet.add(newSong));
                  setAddedScore(false);
                }
              }}
            ></RandomSongPicker>
            <div className="challenge-container">
              <p>{`Totaal: ${Object.values(totalScore).reduce((acc, e) => acc + e, 0)}/20`}</p>
              {song ? (
                <div className="score-button-container">
                  <button onClick={createScoreHandler(2)}>2 punten</button>
                  <button onClick={createScoreHandler(1)}>1 punt</button>
                  <button onClick={createScoreHandler(0)}>0 punten</button>
                </div>
              ) : (
                ""
              )}
              <div className="return-button-container">
                <button className="return-button" onClick={goBack}>
                  Terug
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="information-container">
              <p>Welkom tot de codex challenge. </p>
              <p>
                Voor de challenge wordt gevraagd om de eerste strofe en het
                refrein te zingen met codex, tenzij anders vermeld.
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
          </>
        )}
      </div>
    </>
  );
}
