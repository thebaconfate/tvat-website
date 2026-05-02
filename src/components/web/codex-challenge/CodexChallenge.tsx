import { useState } from "react";
import styles from "./CodexChallenge.module.css";
import { Button } from "@/components/shared/Button";
import { Language, type Song } from "@/lib/codex-challenge";
import RandomSongPicker from "./RandomSongPicker";

interface Props {
  dutchSongs: Song[];
  frenchSongs: Song[];
  germanSongs: Song[];
  otherSongs: Song[];
}

enum Mode {
  Menu,
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
  const [mode, setMode] = useState<Mode>(Mode.Menu);
  const [totalScore, setTotalScore] = useState<Score>(initScores);
  const [song, setSong] = useState<Song | undefined>(undefined);
  const [songSet, setSongSet] = useState<Set<Song>>(new Set<Song>());
  const [addedScore, setAddedScore] = useState<boolean>(false);

  function goBack() {
    setMode(Mode.Menu);
    setTotalScore(initScores);
    setSong(undefined);
    setSongSet(new Set<Song>());
    setAddedScore(false);
  }

  function createScoreHandler(score: number) {
    return () => {
      if (song !== undefined && !addedScore) {
        setTotalScore((prev) => {
          return {
            ...prev,
            [song.language]: totalScore[song.language] + score,
          };
        });
        setAddedScore(true);
      }
    };
  }

  return (
    <main className={styles.contentContainer}>
      <h1 className={styles.title}>Codex Challenge</h1>
      <div className={styles.content}>
        {(() => {
          switch (mode) {
            case Mode.CodexChallenge:
              return (
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
                        setSongSet((prev) => new Set(prev).add(newSong));
                        setAddedScore(false);
                      }
                    }}
                  ></RandomSongPicker>
                  <div className={styles.challengeContainer}>
                    <p>{`Totaal: ${Object.values(totalScore).reduce((acc, e) => acc + e, 0)}/20`}</p>
                    {song ? (
                      <div className={styles.scoreButtonsContainer}>
                        <Button
                          variant="secondary"
                          onClick={createScoreHandler(2)}
                        >
                          2 punten
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={createScoreHandler(1)}
                        >
                          1 punt
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={createScoreHandler(0)}
                        >
                          0 punten
                        </Button>
                      </div>
                    ) : (
                      ""
                    )}
                    <div className={styles.buttonContainer}>
                      <Button variant="danger" onClick={() => goBack()}>
                        Terug
                      </Button>
                    </div>
                  </div>
                </>
              );
            case Mode.Randomizer:
              return (
                <>
                  <RandomSongPicker
                    dutchSongs={dutchSongs}
                    frenchSongs={frenchSongs}
                    germanSongs={germanSongs}
                    otherSongs={otherSongs}
                    song={song}
                    setSong={setSong}
                  />
                  <div className={styles.buttonContainer}>
                    <Button
                      variant="danger"
                      className={styles.returnButton}
                      onClick={() => goBack()}
                    >
                      Terug
                    </Button>
                  </div>
                </>
              );
            case Mode.Menu:
              return (
                <>
                  <div className={styles.challengeInformation}>
                    <p>Welkom tot de codex challenge. </p>
                    <p>
                      Voor de challenge wordt gevraagd om de eerste strofe en
                      het refrein te zingen met codex, tenzij anders vermeld.
                    </p>
                    <p>
                      Elk lied staat op 2 punten en er worden 10 liedjes
                      gevraagd. Je kan dus 20 punten in totaal scoren.
                    </p>
                    <p>Je slaagt als je minstens 10 op 20 haalt.</p>
                    <p>
                      Er worden 4 nederland-, 3 frans-, 2 duits- en 1 anders- of
                      engelstalige liedjes gevraagd.
                    </p>
                  </div>
                  <div className={styles.buttonContainer}>
                    <Button
                      className={styles.button}
                      onClick={() => setMode(Mode.CodexChallenge)}
                    >
                      Challenge starten
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setMode(Mode.Randomizer)}
                    >
                      Oefenen
                    </Button>
                  </div>
                </>
              );
          }
        })()}
      </div>
    </main>
  );
}
