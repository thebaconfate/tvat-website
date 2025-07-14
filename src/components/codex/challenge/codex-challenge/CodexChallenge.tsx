import { useState } from "react";
import type { Song } from "../../../../lib/codex-challenge";
import RandomSongPicker from "../song-picker/RandomSongPicker";

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
        <>
                            <div>
                                <button onClick={(_) => setMode(Mode.CodexChallenge)}>Challenge starten</button>

                            </div>
                        </>
      )}
    </>
  );
}
